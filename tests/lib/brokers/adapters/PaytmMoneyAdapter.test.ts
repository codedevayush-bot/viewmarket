import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaytmMoneyAdapter } from "@/lib/brokers/adapters/PaytmMoneyAdapter";

describe("PaytmMoneyAdapter", () => {
  const mockConfig = {
    api_key: "test_key",
    api_secret: "test_secret",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should generate correct auth URL via authenticate()", async () => {
    const adapter = new PaytmMoneyAdapter(mockConfig);
    const result = await adapter.authenticate();
    expect(result.success).toBe(true);
    expect(result.isOAuth).toBe(true);
    expect(result.redirectUrl).toContain("apiKey=test_key");
  });

  it("should handle OAuth callback successfully", async () => {
    const mockResponse = {
      access_token: "mock_jwt_token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const adapter = new PaytmMoneyAdapter(mockConfig);
    const result = await adapter.handleOAuthCallback("valid_code");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/accounts/v2/gettoken"),
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("mock_jwt_token");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      client_id: "PM123",
      user_name: "Paytm User",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new PaytmMoneyAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("PM123");
    expect(profile.name).toBe("Paytm User");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      equity: { available_balance: "1234.56" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new PaytmMoneyAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(1234.56);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      order_id: "PM_ORDER_999",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new PaytmMoneyAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const result = await adapter.placeOrder({
      symbol: "12345",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 1,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("PM_ORDER_999");
  });
});
