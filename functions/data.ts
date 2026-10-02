import { Hono } from "hono";
import { cors } from "hono/cors";
import { neon } from "@neondatabase/serverless";

const app = new Hono();

const sql = neon(process.env.DATABASE_URL!);

app.use(
    "*",
    cors({
        origin: "*",
        allowMethods: ["GET", "OPTIONS"],
    }),
);

app.get("/projects", async (c) => {
    const rows = await sql`
        SELECT *
        FROM "Projects"
        ORDER BY "Created" DESC
    `;

    return c.json(rows);
});

app.get("/general", async (c) => {
    const rows = await sql`
        SELECT "Label", "Text"
        FROM "General"
    `;

    return c.json(rows);
});

export default app;
