export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CodeStatsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!code) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold mb-4">Invalid code</h1>
        <Link href="/" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold mb-4">Link not found</h1>
        <Link href="/" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shortUrl = `${baseUrl}/${link.code}`;

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Link Stats</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          Back to Dashboard
        </Link>
      </header>

      <section className="space-y-4 bg-white rounded-xl shadow p-4">
        <div>
          <p className="text-sm text-gray-500">Short URL</p>
          <p className="font-mono break-all">{shortUrl}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Target URL</p>
          <a
            href={link.targetUrl}
            className="text-blue-600 break-all"
            target="_blank"
          >
            {link.targetUrl}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total clicks</p>
            <p className="text-xl font-semibold">{link.clicks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last clicked</p>
            <p className="text-sm">
              {link.lastClickedAt
                ? new Date(link.lastClickedAt).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          Created at: {new Date(link.createdAt).toLocaleString()}
        </div>
      </section>
    </main>
  );
}
