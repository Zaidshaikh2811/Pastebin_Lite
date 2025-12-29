"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create paste");

      setResultUrl(data.url);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1 className="title">Pastebin Lite</h1>
      <p className="subtitle">Create a paste and share it instantly</p>

      <form onSubmit={handleSubmit} className="card">
        <label className="label">Paste Content</label>
        <textarea
          placeholder="Paste your text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="textarea"
        />

        <div className="row">
          <div>
            <label className="label">TTL (seconds)</label>
            <input
              type="number"
              min={1}
              placeholder="Optional"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Max Views</label>
            <input
              type="number"
              min={1}
              placeholder="Optional"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="button">
          {loading ? "Creating..." : "Create Paste"}
        </button>
      </form>

      {resultUrl && (
        <div className="success">
          <p> Paste created</p>
          <a href={resultUrl} target="_blank">
            {resultUrl}
          </a>
        </div>
      )}

      {error && <div className="error"> {error}</div>}
    </main>
  );
}
