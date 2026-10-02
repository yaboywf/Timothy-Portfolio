import { Hono, Context } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { cors } from "hono/cors";
import { neon } from "@neondatabase/serverless";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "http://localhost:5173",
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    }),
);

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

const sql = neon(process.env.DATABASE_URL!);

const jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!));

const issuer = new URL(process.env.NEON_AUTH_BASE_URL!).origin;

async function requireAdmin(c: Context): Promise<boolean> {
    const authorization = c.req.header("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return false;
    }

    try {
        const token = authorization.slice(7);

        const { payload } = await jwtVerify(token, jwks, {
            issuer,
        });

        const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;

        if (!email) {
            return false;
        }

        const rows = await sql`
            SELECT EXISTS (
                SELECT 1
                FROM "AdminUsers"
                WHERE lower("Email") = ${email}
            ) AS "allowed"
        `;

        return Boolean(rows[0]?.allowed);
    } catch {
        return false;
    }
}

app.get("/", async (c) => {
    const key = c.req.query("key");

    if (!key) {
        return c.text("Missing key", 400);
    }

    try {
        const object = await s3.send(
            new GetObjectCommand({
                Bucket: "portfolio-images",
                Key: key,
            }),
        );

        if (!object.Body) {
            return c.text("Not found", 404);
        }

        return new Response(object.Body.transformToWebStream(), {
            headers: {
                "Content-Type": object.ContentType ?? "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return c.text("Not found", 404);
    }
});

app.delete("/", async (c) => {
    if (!(await requireAdmin(c))) {
        return c.text("Forbidden", 403);
    }

    const key = c.req.query("key");

    if (!key) {
        return c.text("Missing key", 400);
    }

    try {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: "portfolio-images",
                Key: key,
            }),
        );

        return c.body(null, 204);
    } catch (error) {
        console.error(error);

        return c.text("Failed to delete image", 500);
    }
});

app.get("/list", async (c) => {
    if (!(await requireAdmin(c))) {
        return c.text("Forbidden", 403);
    }

    try {
        const result = await s3.send(
            new ListObjectsV2Command({
                Bucket: "portfolio-images",
                MaxKeys: 100,
            }),
        );

        const files = (result.Contents ?? [])
            .map((object) => ({
                name: object.Key ?? "",
                id: object.ETag ?? null,
                created_at: object.LastModified?.toISOString() ?? null,
                metadata: {
                    size: object.Size ?? 0,
                },
            }))
            .filter((file) => file.name);

        return c.json(files);
    } catch (error) {
        console.error(error);

        return c.json(
            {
                error: "Failed to list images",
            },
            500,
        );
    }
});

app.post("/upload", async (c) => {
    if (!(await requireAdmin(c))) {
        return c.text("Forbidden", 403);
    }

    try {
        const formData = await c.req.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
            return c.text("Missing file", 400);
        }

        const key = file.name.replace(/\s+/g, "-");

        await s3.send(
            new PutObjectCommand({
                Bucket: "portfolio-images",
                Key: key,
                Body: Buffer.from(await file.arrayBuffer()),
                ContentType: file.type || "application/octet-stream",
                CacheControl: "public, max-age=31536000",
            }),
        );

        return c.json({
            name: key,
        });
    } catch (error) {
        console.error(error);

        return c.text("Failed to upload image", 500);
    }
});

export default app;
