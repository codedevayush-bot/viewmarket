import { describe, it, expect, vi, beforeEach } from "vitest";
import { FyersAdapter } from "@/lib/brokers/adapters/FyersAdapter";

describe("FyersAdapter", () => {
  const mockConfig = {
    api_key: "FY123",
    api_secret: "fy_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockAuthResponse = {
      s: "ok",
      access_token: "fy_access_token",
      refresh_token: "fy_refresh_token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new FyersAdapter(mockConfig);
    const result = await adapter.authenticate({ code: "fy_code" });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("fy_access_token");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      s: "ok",
      data: { fy_id: "FY123", name: "Fyers Tester", email_id: "test@fyers.in" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new FyersAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("FY123");
    expect(profile.name).toBe("Fyers Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      s: "ok",
      id: "FY_ORD_2020",
      message: "Placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new FyersAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "NSE:RELIANCE-EQ",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 1,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("FY_ORD_2020");
  });
});
