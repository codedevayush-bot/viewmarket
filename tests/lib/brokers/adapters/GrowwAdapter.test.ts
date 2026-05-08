import { describe, it, expect, vi, beforeEach } from "vitest";
import { GrowwAdapter } from "@/lib/brokers/adapters/GrowwAdapter";

describe("GrowwAdapter", () => {
  const mockConfig = {
    api_key: "groww_key",
    api_secret: "groww_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockAuthResponse = {
      token: "groww_access_token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new GrowwAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("groww_access_token");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      available_margin: "5000.50",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new GrowwAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(5000.5);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      order_id: "GRW_ORD_555",
      message: "Placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new GrowwAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "RELIANCE",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 1,
      price: 2500,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("GRW_ORD_555");
  });
});
