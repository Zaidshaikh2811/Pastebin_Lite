export async function createPaste(payload: {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}) {
    const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed to create paste");
    }

    return data;
}
