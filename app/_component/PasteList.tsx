"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PasteList({ refreshKey }: { refreshKey: number }) {
    const [urls, setUrls] = useState<{ id: string; snippet: string; url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPastes() {
            try {
                const res = await fetch("/api/pastes");

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                console.log(data);


                setUrls(data.pastes);
            } catch (err: any) {
                setError(err.message || "Failed to load pastes");
            } finally {
                setLoading(false);
            }
        }

        fetchPastes();
    }, [refreshKey]);

    if (loading) {
        return <p style={{ marginTop: 16 }}>Loading pastes...</p>;
    }

    if (error) {
        return <div className="error"> {error}</div>;
    }

    if (urls.length === 0) {
        return <p style={{ marginTop: 16 }}>No active pastes</p>;
    }

    return (
        <div className="card" style={{ marginTop: 32 }}>
            <h3 className="label">Active Pastes</h3>

            <ul style={{ marginTop: 12 }}>
                {urls.map((url) => (
                    <li key={url.id} style={{ marginBottom: 8 }}>
                        <Link
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb" }}
                        >

                            {/* add max length */}
                            View paste → {url.snippet.length > 100 ? url.snippet.slice(0, 100) + "..." : url.snippet}

                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
