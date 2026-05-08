import { describe, it, expect, vi, beforeEach } from "vitest";
import { MStockAdapter } from "@/lib/brokers/adapters/MStockAdapter";

vi.mock("@/lib/brokers/utils/totp", () => ({
  generateTOTP: vi.fn(() => "123456"),
}));

describe("MStockAdapter", () => {
  const mockConfig = {
    api_key: "MS123",
    api_secret: "ms_sec",
    password: "ms_password",
    totp_secret: "ms_totp_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockLoginResponse = {
      status: true,
      data: { jwtToken: "ms_jwt_token" },
    };

    const mockVerifyResponse = {
      status: true,
      data: { jwtToken: "ms_jwt_token_final" },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockVerifyResponse,
      } as Response);

    const adapter = new MStockAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("ms_jwt_token_final");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      status: true,
      data: { clientName: "MStock Tester" },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new MStockAdapter({
      ...mockConfig,
      access_token: "valid_jwt",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("MS123");
    expect(profile.name).toBe("MStock Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      status: true,
      data: { orderNumber: "MS_ORD_777" },
      message: "Placed",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new MStockAdapter({
      ...mockConfig,
      access_token: "valid_jwt",
    });
    const result = await adapter.placeOrder({
      symbol: "INFY",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "MARKET",
      quantity: 1,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("MS_ORD_777");
  });
});
