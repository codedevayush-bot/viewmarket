import { describe, it, expect, vi, beforeEach } from "vitest";
import { FivePaisaXtsAdapter } from "@/lib/brokers/adapters/FivePaisaXtsAdapter";

describe("FivePaisaXtsAdapter", () => {
  const mockConfig = {
    interactive_api_key: "5p_int_key",
    interactive_api_secret: "5p_int_sec",
    market_data_api_key: "5p_mkt_key",
    market_data_api_secret: "5p_mkt_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockInteractiveResponse = {
      type: "success",
      result: { token: "token_a" },
    };

    const mockMarketResponse = {
      type: "success",
      result: { token: "token_b" },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInteractiveResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResponse,
      } as Response);

    const adapter = new FivePaisaXtsAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("token_a|token_b");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      type: "success",
      result: { clientCode: "FP123", clientName: "FivePaisa User" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new FivePaisaXtsAdapter({
      ...mockConfig,
      access_token: "ta|tb",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("FP123");
    expect(profile.name).toBe("FivePaisa User");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        AppOrderID: "FP_ORD_777",
      },
      description: "Order success",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new FivePaisaXtsAdapter({
      ...mockConfig,
      access_token: "ta|tb",
    });
    const result = await adapter.placeOrder({
      symbol: "999",
      exchange: "NSECM",
      transactionType: "SELL",
      orderType: "LIMIT",
      quantity: 10,
      price: 200,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("FP_ORD_777");
  });
});
