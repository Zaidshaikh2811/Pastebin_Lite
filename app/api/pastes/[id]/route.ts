import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getNow } from "@/lib/time";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    console.log("API params.id:", id);

    if (!id) {
        return Response.json(
            { error: "Paste not found" },
            { status: 404 }
        );
    }

    const nowMs = getNow(req.headers);

    const result = await pool.query(
        `
    UPDATE pastes
    SET view_count = view_count + 1
    WHERE id = $1
      AND (expires_at IS NULL OR expires_at > to_timestamp($2 / 1000.0))
      AND (max_views IS NULL OR view_count < max_views)
    RETURNING content, expires_at, max_views, view_count
    `,
        [id, nowMs]
    );

    if (result.rowCount === 0) {
        return Response.json(
            { error: "Paste not found" },
            { status: 404 }
        );
    }

    const paste = result.rows[0];

    return Response.json({
        content: paste.content,
        remaining_views:
            paste.max_views === null
                ? null
                : paste.max_views - paste.view_count,
        expires_at: paste.expires_at
            ? paste.expires_at.toISOString()
            : null,
    });
}
