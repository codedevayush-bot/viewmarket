import { describe, it, expect, vi, beforeEach } from "vitest";
import { RMoneyAdapter } from "@/lib/brokers/adapters/RMoneyAdapter";

describe("RMoneyAdapter", () => {
  const mockConfig = {
    interactive_app_key: "rm_int_key",
    interactive_secret_key: "rm_int_sec",
    market_app_key: "rm_mkt_key",
    market_secret_key: "rm_mkt_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockIntResponse = {
      type: "success",
      result: { token: "rm_token_int" },
    };

    const mockMktResponse = {
      type: "success",
      result: { token: "rm_token_mkt", userID: "RM123" },
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

    const adapter = new RMoneyAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("rm_token_int");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      type: "success",
      result: { userId: "RM123", userName: "RMoney Tester" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new RMoneyAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("RM123");
    expect(profile.name).toBe("RMoney Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        AppOrderID: "RM_ORD_222",
      },
      description: "Order OK",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new RMoneyAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "67890",
      exchange: "NSE",
      transactionType: "SELL",
      orderType: "LIMIT",
      quantity: 5,
      price: 150,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("RM_ORD_222");
  });
});
