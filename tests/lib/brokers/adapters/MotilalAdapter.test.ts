import { describe, it, expect, vi, beforeEach } from "vitest";
import { MotilalAdapter } from "@/lib/brokers/adapters/MotilalAdapter";
import { generateTOTP } from "@/lib/brokers/utils/totp";

vi.mock("@/lib/brokers/utils/totp", () => ({
  generateTOTP: vi.fn(() => "111222"),
}));

describe("MotilalAdapter", () => {
  const mockConfig = {
    api_key: "test_key",
    user_id: "MO123",
    password: "password123",
    dob: "19900101",
    totp_secret: "MOSECRET",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockResponse = {
      status: "SUCCESS",
      AuthToken: "mo_token_123",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const adapter = new MotilalAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(generateTOTP).toHaveBeenCalledWith("MOSECRET");
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("mo_token_123");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      status: "SUCCESS",
      ClientName: "Motilal Tester",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new MotilalAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.name).toBe("Motilal Tester");
    expect(profile.id).toBe("MO123");
  });

  it("should fetch funds successfully", async () => {
    const mockFundsResponse = {
      status: "SUCCESS",
      AvailableMargin: "25000.50",
      UtilizedMargin: "5000.00",
      TotalMargin: "30000.50",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new MotilalAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(25000.5);
    expect(funds.utilizedMargin).toBe(5000);
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      status: "SUCCESS",
      OrderId: "MO_ORD_101",
      message: "Order placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new MotilalAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "SBIN-EQ",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 10,
      price: 500,
      product: "MIS",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("MO_ORD_101");
  });
});
