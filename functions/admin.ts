// functions/admin.ts

import { Hono } from "hono";
import { cors } from "hono/cors";
import { neon } from "@neondatabase/serverless";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*",
        allowMethods: ["GET", "OPTIONS"],
    }),
);

const sql = neon(process.env.DATABASE_URL!);

app.get("/allowed", async (c) => {
    const email = c.req.query("email")?.trim().toLowerCase();

    if (!email) {
        return c.json({ allowed: false });
    }

    const rows = await sql`
        SELECT EXISTS (
            SELECT 1
            FROM "AdminUsers"
            WHERE lower("Email") = ${email}
        ) AS "allowed"
    `;

    return c.json({
        allowed: Boolean(rows[0]?.allowed),
    });
});

export default app;
