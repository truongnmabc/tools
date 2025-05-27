"use client";

import { useState } from "react";

interface LinkItem {
  url: string;
}

const Pattern: React.FC = () => {
  const [url, setUrl] = useState("https://example.com");
  const [maxDepth, setMaxDepth] = useState(3);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleStart = () => {
    setLinks([]);
    setStatus("loading");

    const eventSource = new EventSource(
      `http://localhost:8001/api/stream-sse?url=${encodeURIComponent(
        url
      )}&maxDepth=${maxDepth}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLinks((prev) => [...prev, data]);
    };

    eventSource.addEventListener("done", () => {
      setStatus("done");
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setStatus("idle");
      eventSource.close();
    };
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        🕸️ Real-time Link Crawler (SSE)
      </h1>

      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value))}
          placeholder="Max depth"
          className="border p-2 rounded"
        />
        <button
          onClick={handleStart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Crawling..." : "Start"}
        </button>
      </div>

      <div className="space-y-2">
        {links.map((link, index) => (
          <div
            key={index}
            className="text-sm text-blue-700 break-words underline"
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.url}
            </a>
          </div>
        ))}
        {status === "done" && (
          <p className="text-green-600">✅ Crawl completed.</p>
        )}
      </div>
    </div>
  );
};

export default Pattern;
