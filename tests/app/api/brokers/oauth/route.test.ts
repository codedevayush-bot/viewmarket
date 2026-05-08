/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/brokers/oauth/route";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import { BrokerFactory } from "@/lib/brokers/BrokerFactory";

vi.mock("@/auth");
vi.mock("@/lib/db");
vi.mock("@/lib/encryption");
vi.mock("@/lib/brokers/BrokerFactory");

describe("API: /api/brokers/oauth", () => {
  const mockSession = { user: { id: "test-user-id" } };
  const mockUrl =
    "http://localhost:3000/api/brokers/oauth?connectionId=test-conn-id";

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth as any).mockResolvedValue(mockSession as any);
    vi.mocked(encrypt).mockImplementation((val) => `enc_${val}`);
  });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);
    const req = new NextRequest(mockUrl);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if connectionId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/brokers/oauth");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 if connection not found", async () => {
    vi.mocked(query).mockResolvedValue({ rowCount: 0, rows: [] } as any);
    const req = new NextRequest(mockUrl);
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("should redirect to broker OAuth URL on success", async () => {
    const mockConnection = {
      id: "test-conn-id",
      broker_name: "upstox",
      api_key: "enc_key",
      api_secret: "enc_secret",
    };

    vi.mocked(query).mockResolvedValue({
      rowCount: 1,
      rows: [mockConnection],
    } as any);
    vi.mocked(decrypt).mockImplementation((val) => val.replace("enc_", "dec_"));

    const mockAdapter = {
      authenticate: vi.fn().mockResolvedValue({
        success: true,
        isOAuth: true,
        redirectUrl: "https://broker.com/auth?client_id=dec_key",
      }),
    };
    vi.mocked(BrokerFactory.createAdapter).mockReturnValue(mockAdapter as any);

    const req = new NextRequest(mockUrl);
    const res = await GET(req);

    expect(res.status).toBe(307); // Next.js NextResponse.redirect uses 307 by default
    expect(res.headers.get("location")).toContain("https://broker.com/auth");
    expect(res.headers.get("location")).toContain("state=enc_test-conn-id");
  });
});
