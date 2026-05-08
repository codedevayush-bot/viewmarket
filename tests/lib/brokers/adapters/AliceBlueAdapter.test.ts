import { describe, it, expect, vi, beforeEach } from "vitest";
import { AliceBlueAdapter } from "@/lib/brokers/adapters/AliceBlueAdapter";

describe("AliceBlueAdapter", () => {
  const mockConfig = {
    client_id: "AB1234",
    api_key: "test_key",
    api_secret: "test_secret",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully with code", async () => {
    const mockAuthResponse = {
      stat: "Ok",
      userSession: "alice_session_789",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new AliceBlueAdapter(mockConfig);
    const result = await adapter.authenticate({ code: "auth_code_123" });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("alice_session_789");
  });

  it("should fetch profile successfully", async () => {
    const adapter = new AliceBlueAdapter(mockConfig);
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("AB1234");
    expect(profile.brokerName).toBe("Alice Blue");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      stat: "Ok",
      availableCash: "50000.00",
      utilizedMargin: "10000.00",
      totalMargin: "60000.00",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new AliceBlueAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(50000);
    expect(funds.utilizedMargin).toBe(10000);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      stat: "Ok",
      data: {
        oms_order_id: "AB_ORD_505",
      },
      emsg: "Order success",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new AliceBlueAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "TATASTEEL-EQ",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 100,
      price: 150,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("AB_ORD_505");
  });
});
