import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZerodhaAdapter } from "@/lib/brokers/adapters/ZerodhaAdapter";

describe("ZerodhaAdapter", () => {
  const mockConfig = {
    api_key: "test_api_key",
    api_secret: "test_api_secret",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize correctly with credentials", () => {
    const adapter = new ZerodhaAdapter(mockConfig);
    expect(adapter).toBeDefined();
  });

  it("should throw error if credentials are missing", () => {
    expect(() => new ZerodhaAdapter({})).toThrow(
      "Zerodha requires api_key and api_secret",
    );
  });

  it("should authenticate successfully with a request token", async () => {
    const adapter = new ZerodhaAdapter(mockConfig);
    const mockResponse = {
      status: "success",
      data: {
        access_token: "test_access_token",
        public_token: "test_public_token",
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await adapter.authenticate({
      requestToken: "test_request_token",
    });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("test_access_token");
    expect(result.metadata?.publicToken).toBe("test_public_token");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.kite.trade/session/token",
      expect.objectContaining({
        method: "POST",
        body: expect.any(URLSearchParams),
      }),
    );
  });

  it("should handle authentication failure", async () => {
    const adapter = new ZerodhaAdapter(mockConfig);
    const mockError = {
      status: "error",
      message: "Invalid request token",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => mockError,
    });

    const result = await adapter.authenticate({
      requestToken: "invalid_token",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid request token");
  });
});
