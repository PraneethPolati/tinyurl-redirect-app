export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, isValidCode, isValidUrl } from "@/lib/links";

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUrl, code: rawCode } = body as {
      targetUrl?: string;
      code?: string;
    };

    if (!targetUrl || !isValidUrl(targetUrl)) {
      return NextResponse.json(
        { error: "Invalid or missing URL" },
        { status: 400 }
      );
    }

    let code = rawCode?.trim();

    if (code) {
      if (!isValidCode(code)) {
        return NextResponse.json(
          { error: "Code must match [A-Za-z0-9]{6,8}" },
          { status: 400 }
        );
      }

      const exists = await prisma.link.findUnique({ where: { code } });
      if (exists) {
        return NextResponse.json(
          { error: "Code already exists" },
          { status: 409 }
        );
      }
    } else {
      let attempts = 0;
      while (!code && attempts < 5) {
        const candidate = generateCode(6);
        const exists = await prisma.link.findUnique({
          where: { code: candidate },
        });
        if (!exists) code = candidate;
        attempts++;
      }

      if (!code) {
        return NextResponse.json(
          { error: "Failed to generate unique code" },
          { status: 500 }
        );
      }
    }

    const link = await prisma.link.create({
      data: { code, targetUrl },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
