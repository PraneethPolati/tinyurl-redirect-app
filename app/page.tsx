"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LinkItem = {
  id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? "";

  async function fetchLinks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data);
    } catch (e: any) {
      setError(e.message ?? "Error loading links");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  function validateUrl(value: string) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateCode(value: string) {
    if (!value) return true;
    return /^[A-Za-z0-9]{6,8}$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUrlError(null);
    setCodeError(null);

    let hasError = false;
    if (!validateUrl(url)) {
      setUrlError("Please enter a valid URL starting with http or https.");
      hasError = true;
    }
    if (!validateCode(code)) {
      setCodeError("Code must be 6–8 characters [A-Za-z0-9].");
      hasError = true;
    }
    if (hasError) return;

    setFormLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: url, code: code || undefined }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setCodeError(data.error ?? "Code already exists");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create link");
      }

      setSuccess("Link created successfully.");
      setUrl("");
      setCode("");
      await fetchLinks();
    } catch (e: any) {
      setError(e.message ?? "Error creating link");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link "${code}"?`)) return;
    try {
      const res = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setLinks((prev) => prev.filter((l) => l.code !== code));
    } catch (e: any) {
      alert(e.message ?? "Error deleting link");
    }
  }

  const filteredLinks = links.filter((l) => {
    const q = filter.toLowerCase();
    return (
      l.code.toLowerCase().includes(q) ||
      l.targetUrl.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">TinyLink</h1>
          <a
  href="/healthz"
  className="text-lg font-semibold text-blue-700 hover:underline"
>
  Healthcheck
</a>

        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Create Link Card */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
          <h2 className="text-lg font-semibold">Create a short link</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* URL FIELD */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Target URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                placeholder="https://example.com/page"
              />
              {urlError && (
                <p className="text-xs text-red-600 mt-1">{urlError}</p>
              )}
            </div>

            {/* CODE FIELD */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom code (optional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                placeholder="e.g. docs123"
              />
              {codeError && (
                <p className="text-xs text-red-600 mt-1">{codeError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50 shadow hover:bg-blue-700 transition"
            >
              {formLoading ? "Creating..." : "Create link"}
            </button>

            {error && (
              <p className="text-sm text-red-600 mt-1">Error: {error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 mt-1">{success}</p>
            )}
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your links</h2>
            <input
              type="text"
              placeholder="Search…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-48 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            />
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading links…</p>
          ) : filteredLinks.length === 0 ? (
            <p className="text-sm text-gray-500">
              No links yet. Create one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Code</th>
                    <th className="text-left py-2 px-2">Target URL</th>
                    <th className="text-left py-2 px-2">Clicks</th>
                    <th className="text-left py-2 px-2">Last clicked</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => {
                    const shortUrl = `${baseUrl}/${link.code}`;
                    return (
                      <tr
                        key={link.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="py-2 px-2 font-mono text-blue-700 underline">
                          <Link href={`/code/${link.code}`}>
                            {link.code}
                          </Link>
                        </td>

                        <td className="py-2 px-2 max-w-xs">
                          <span className="block truncate text-gray-700">
                            {link.targetUrl}
                          </span>
                        </td>

                        <td className="py-2 px-2">{link.clicks}</td>

                        <td className="py-2 px-2 text-xs">
                          {link.lastClickedAt
                            ? new Date(link.lastClickedAt).toLocaleString()
                            : "Never"}
                        </td>

                        <td className="py-2 px-2 space-x-2">
                          <button
                            className="text-xs border rounded-lg px-2 py-1 hover:bg-gray-100 transition"
                            onClick={async () => {
                              await navigator.clipboard.writeText(shortUrl);
                              alert("Copied!");
                            }}
                          >
                            Copy
                          </button>

                          <button
                            className="text-xs border rounded-lg px-2 py-1 hover:bg-gray-100 transition"
                            onClick={() => window.open(shortUrl, "_blank")}
                          >
                            Open
                          </button>

                          <button
                            className="text-xs border rounded-lg px-2 py-1 text-red-600 hover:bg-red-100 transition"
                            onClick={() => handleDelete(link.code)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className="text-xs text-gray-500 py-4 text-center">
        TinyLink • Built for Assignment
      </footer>
    </main>
  );
}
