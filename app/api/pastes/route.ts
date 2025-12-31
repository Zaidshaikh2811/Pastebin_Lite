import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { pool } from "@/lib/db";
import { createPasteSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = createPasteSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        const { content, ttl_seconds, max_views } = parsed.data;

        const id = nanoid(10);
        const expiresAt = ttl_seconds
            ? new Date(Date.now() + ttl_seconds * 1000)
            : null;

        await pool.query(
            `INSERT INTO pastes (id, content, expires_at, max_views)
           VALUES ($1, $2, $3, $4)`,
            [id, content, expiresAt, max_views ?? null]
        );

        return Response.json({
            id,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/p/${id}`,
        });
    } catch (err) {
        console.error(err);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const result = await pool.query(`
      SELECT id, content
      FROM pastes
      WHERE
        (expires_at IS NULL OR expires_at > NOW())
        AND (max_views IS NULL OR view_count < max_views)
      ORDER BY created_at DESC
      LIMIT 20
    `);

        const pastes = result.rows.map((row) => ({
            id: row.id,
            snippet:
                row.content.length > 100
                    ? row.content.slice(0, 100) + "..."
                    : row.content,
            url: `/p/${row.id}`,
        }));

        return Response.json({ pastes });
    } catch (err) {
        console.error("FETCH_PASTES_FAILED", err);
        return Response.json(
            { error: "Failed to fetch pastes" },
            { status: 500 }
        );
    }
}