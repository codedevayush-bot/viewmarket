import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShoonyaAdapter } from "@/lib/brokers/adapters/ShoonyaAdapter";

describe("ShoonyaAdapter", () => {
  const mockConfig = {
    user_id: "SH123",
    api_key: "test_key",
    api_secret: "test_secret",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockAuthResponse = {
      stat: "Ok",
      access_token: "mock_access_token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new ShoonyaAdapter(mockConfig);
    const result = await adapter.authenticate({ code: "valid_code" });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/NorenWClientAPI/GenAcsTok"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("jData="),
      }),
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("mock_access_token");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      stat: "Ok",
      uname: "Shoonya User",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new ShoonyaAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("SH123");
    expect(profile.name).toBe("Shoonya User");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      stat: "Ok",
      cash: "2000.00",
      margin_used: "500.00",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new ShoonyaAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(2000);
    expect(funds.utilizedMargin).toBe(500);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      stat: "Ok",
      norenordno: "SHOONYA_ORD_777",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new ShoonyaAdapter({
      ...mockConfig,
      access_token: "mock_token",
    });
    const result = await adapter.placeOrder({
      symbol: "TCS-EQ",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 2,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("SHOONYA_ORD_777");
  });
});
