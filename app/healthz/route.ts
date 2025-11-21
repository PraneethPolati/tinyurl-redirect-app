export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const startTime = Date.now();

export async function GET() {
  try {
    // Check DB connection
    await prisma.link.count();

    return NextResponse.json(
      {
        ok: true,
        version: "1.0",
        system: {
          status: "healthy",
          environment: process.env.NODE_ENV,
          uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
          timestamp: new Date().toISOString(),
        },
        database: {
          status: "connected",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        version: "1.0",
        system: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
        },
        database: {
          status: "disconnected",
          error: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
