import { notFound } from "next/navigation";

type PasteResponse = {
    content: string;
    remaining_views: number | null;
    expires_at: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: `Paste ${id}`,
        description: "Shared text paste",
    };
}


async function getPaste(id: string): Promise<PasteResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pastes/${id}`, { cache: "no-store" });
    if (!res.ok) notFound();
    return res.json();
}

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    if (!id || typeof id !== "string") {
        notFound();
    }


    const paste = await getPaste(id);

    return (
        <main className="container">
            <h1 className="title">Shared Paste</h1>

            <pre className="paste-box">{paste.content}</pre>

            <div className="meta">
                {paste.remaining_views !== null && (
                    <span> {paste.remaining_views} views left</span>
                )}
                {paste.expires_at && (
                    <span>
                        Expires: {new Date(paste.expires_at).toLocaleString()}
                    </span>
                )}
            </div>
        </main>
    );
}
