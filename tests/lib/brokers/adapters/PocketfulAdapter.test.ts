import { describe, it, expect, vi, beforeEach } from "vitest";
import { PocketfulAdapter } from "@/lib/brokers/adapters/PocketfulAdapter";

describe("PocketfulAdapter", () => {
  const mockConfig = {
    api_key: "pf_key",
    api_secret: "pf_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockAuthResponse = {
      access_token: "pf_access_token",
      expires_in: 3600,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new PocketfulAdapter(mockConfig);
    const result = await adapter.authenticate({ code: "pf_code" });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("pf_access_token");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      data: { client_id: "PF123", name: "Pocketful Tester" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new PocketfulAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("PF123");
    expect(profile.name).toBe("Pocketful Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      status: "success",
      data: { order_id: "PF_ORD_888" },
      message: "Placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new PocketfulAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "SBIN",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 1,
      price: 500,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("PF_ORD_888");
  });
});
