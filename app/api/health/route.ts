import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    // Verify database connectivity
    await pool.query("SELECT 1");
    return Response.json(
      { status: "healthy", db: "connected" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      {
        status: "unhealthy",
        db: "disconnected",
        error: "Database connection failed",
      },
      { status: 503 },
    );
  }
}
