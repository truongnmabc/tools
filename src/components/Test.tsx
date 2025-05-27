"use client";
import React, { useState } from "react";

interface LinkItem {
  url: string;
}

const Test: React.FC = () => {
  const [url, setUrl] = useState("https://example.com");
  const [maxDepth, setMaxDepth] = useState(3);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setLinks([]);

    try {
      const response = await fetch(
        `http://localhost:8001/api/stream-scan?url=${encodeURIComponent(
          url
        )}&maxDepth=${maxDepth}`
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let isFirstChunk = true;

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse dần từng object JSON từ chuỗi dạng mảng
        let match;
        const regex = /{[^}]*}/g;
        while ((match = regex.exec(buffer)) !== null) {
          try {
            const link: LinkItem = JSON.parse(match[0]);
            setLinks((prev) => [...prev, link]);
          } catch (e) {
            // ignore nếu parse lỗi
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🕸️ Real-time Link Crawler</h1>

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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Crawling..." : "Start"}
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
        {!loading && links.length === 0 && (
          <p className="text-gray-500">No links yet.</p>
        )}
      </div>
    </div>
  );
};

export default Test;
