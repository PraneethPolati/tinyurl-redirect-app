export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (!code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
  });

  return NextResponse.redirect(link.targetUrl, 302);
}
