import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/omdb";

const IMDB_ID_PATTERN = /^tt\d{6,10}$/i;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(clientIp);

  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIp, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(clientIp, current);
  return false;
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("imdbId")?.trim() ?? "";

  if (!imdbId) {
    return NextResponse.json(
      { error: "Missing imdbId query parameter." },
      { status: 400 },
    );
  }
  if (!IMDB_ID_PATTERN.test(imdbId)) {
    return NextResponse.json(
      { error: "Invalid imdbId format." },
      { status: 400 },
    );
  }

  try {
    const movie = await getMovieDetails(imdbId);
    return NextResponse.json({ movie }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movie details." },
      { status: 502 },
    );
  }
}
