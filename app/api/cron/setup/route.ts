import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query(`
      ALTER TABLE broker_connections 
      ADD COLUMN IF NOT EXISTS refresh_token text,
      ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;
    `);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
