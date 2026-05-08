import { describe, it, expect, vi, beforeEach } from "vitest";
import { IIFLAdapter } from "@/lib/brokers/adapters/IIFLAdapter";

describe("IIFLAdapter", () => {
  const mockConfig = {
    app_key: "key1",
    api_secret: "sec1",
    app_key_market: "key2",
    api_secret_market: "sec2",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully with interactive and market sessions", async () => {
    const mockInteractiveResponse = {
      type: "success",
      result: { token: "int_token" },
    };

    const mockMarketResponse = {
      type: "success",
      result: { token: "mkt_token", userID: "IIFL_USER_1" },
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

    const adapter = new IIFLAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("int_token:::mkt_token:::IIFL_USER_1");
  });

  it("should fetch profile successfully", async () => {
    const adapter = new IIFLAdapter({
      ...mockConfig,
      access_token: "int:::mkt:::USER123",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("USER123");
    expect(profile.brokerName).toBe("IIFL");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      type: "success",
      result: [
        {
          availableMargin: "75000.00",
          utilizedMargin: "5000.00",
          totalMargin: "80000.00",
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new IIFLAdapter({
      ...mockConfig,
      access_token: "int:::mkt:::USER123",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(75000);
    expect(funds.utilizedMargin).toBe(5000);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      type: "success",
      result: {
        orderID: "IIFL_ORD_888",
      },
      message: "Order placed successfully",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new IIFLAdapter({
      ...mockConfig,
      access_token: "int:::mkt:::USER123",
    });
    const result = await adapter.placeOrder({
      symbol: "INFY-EQ",
      exchange: "NSE",
      transactionType: "SELL",
      orderType: "MARKET",
      quantity: 2,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("IIFL_ORD_888");
  });
});
