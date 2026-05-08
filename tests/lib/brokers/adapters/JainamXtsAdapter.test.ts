import { describe, it, expect, vi, beforeEach } from "vitest";
import { JainamXtsAdapter } from "@/lib/brokers/adapters/JainamXtsAdapter";

describe("JainamXtsAdapter", () => {
  const mockConfig = {
    interactive_api_key: "int_key",
    interactive_api_secret: "int_sec",
    market_data_api_key: "mkt_key",
    market_data_api_secret: "mkt_sec",
    base_url: "https://test.jainam.in",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockInteractiveResponse = {
      type: "success",
      result: { token: "token1" },
    };

    const mockMarketResponse = {
      type: "success",
      result: { token: "token2" },
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

    const adapter = new JainamXtsAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("token1|token2");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      type: "success",
      result: { clientCode: "JAI001", clientName: "Jainam User" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new JainamXtsAdapter({
      ...mockConfig,
      access_token: "t1|t2",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("JAI001");
    expect(profile.name).toBe("Jainam User");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      type: "success",
      result: {
        balanceList: [
          {
            limitMargin: "10000.00",
            utilizedMargin: "1000.00",
            totalMargin: "11000.00",
          },
        ],
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new JainamXtsAdapter({
      ...mockConfig,
      access_token: "t1|t2",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(10000);
    expect(funds.utilizedMargin).toBe(1000);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        AppOrderID: "JAI_ORD_999",
      },
      description: "Order placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new JainamXtsAdapter({
      ...mockConfig,
      access_token: "t1|t2",
    });
    const result = await adapter.placeOrder({
      symbol: "12345",
      exchange: "NSECM",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 1,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("JAI_ORD_999");
  });
});
