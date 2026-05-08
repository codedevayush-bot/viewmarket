import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompositeAdapter } from "@/lib/brokers/adapters/CompositeAdapter";

describe("CompositeAdapter", () => {
  const mockConfig = {
    interactive_api_key: "ce_int_key",
    interactive_api_secret: "ce_int_sec",
    market_data_api_key: "ce_mkt_key",
    market_data_api_secret: "ce_mkt_sec",
    base_url: "https://composite-test.xts.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockIntResponse = {
      type: "success",
      result: { token: "ce_token_int" },
    };

    const mockMktResponse = {
      type: "success",
      result: { token: "ce_token_mkt" },
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

    const adapter = new CompositeAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("ce_token_int|ce_token_mkt");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      type: "success",
      result: { clientCode: "CE123", clientName: "Composite Tester" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new CompositeAdapter({
      ...mockConfig,
      access_token: "it|mt",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("CE123");
    expect(profile.name).toBe("Composite Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        AppOrderID: "CE_ORD_444",
      },
      description: "Order OK",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new CompositeAdapter({
      ...mockConfig,
      access_token: "it|mt",
    });
    const result = await adapter.placeOrder({
      symbol: "13579",
      exchange: "NSECM",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 1,
      price: 100,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("CE_ORD_444");
  });
});
