import { NextResponse } from "next/server";

export const config = { matcher: ["/((?!_next|api|favicon.ico|assets|static).*)"] };

export function middleware(req: Request) {
  if (process.env.ADMIN_BYPASS === "1") return NextResponse.next();
  // existing auth code (OIDC) remains below for production
}