import { describe, it, expect, vi, beforeEach } from "vitest";
import { IBullsAdapter } from "@/lib/brokers/adapters/IBullsAdapter";

describe("IBullsAdapter", () => {
  const mockConfig = {
    interactive_app_key: "ib_int_key",
    interactive_secret_key: "ib_int_sec",
    market_app_key: "ib_mkt_key",
    market_secret_key: "ib_mkt_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockIntResponse = {
      type: "success",
      result: { token: "token_int" },
    };

    const mockMktResponse = {
      type: "success",
      result: { token: "token_mkt", userID: "IB123" },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMktResponse,
      } as Response);

    const adapter = new IBullsAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("token_int");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      type: "success",
      result: { userId: "IB123", userName: "IBulls Tester" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new IBullsAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("IB123");
    expect(profile.name).toBe("IBulls Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        AppOrderID: "IB_ORD_111",
      },
      description: "Order OK",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new IBullsAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "54321",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 1,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("IB_ORD_111");
  });
});
