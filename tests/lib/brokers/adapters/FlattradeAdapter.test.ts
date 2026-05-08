import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlattradeAdapter } from "@/lib/brokers/adapters/FlattradeAdapter";

describe("FlattradeAdapter", () => {
  const mockConfig = {
    api_key: "FT123",
    api_secret: "ft_sec",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const mockAuthResponse = {
      stat: "Ok",
      token: "ft_session_token",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new FlattradeAdapter(mockConfig);
    const result = await adapter.authenticate({ code: "ft_request_code" });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("ft_session_token");
  });

  it("should fetch profile successfully", async () => {
    const mockProfileResponse = {
      stat: "Ok",
      actid: "FT123",
      uname: "Flattrade Tester",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new FlattradeAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe("FT123");
    expect(profile.name).toBe("Flattrade Tester");
  });

  it("should place order successfully", async () => {
    const mockOrderResponse = {
      stat: "Ok",
      norenordno: "FT_ORD_1111",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new FlattradeAdapter({
      ...mockConfig,
      access_token: "valid_token",
    });
    const result = await adapter.placeOrder({
      symbol: "ZOMATO",
      exchange: "NSE",
      transactionType: "BUY",
      orderType: "LIMIT",
      quantity: 10,
      price: 150,
      product: "CNC",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("FT_ORD_1111");
  });
});
