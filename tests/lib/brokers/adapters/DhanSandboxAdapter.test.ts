import { describe, it, expect, vi, beforeEach } from "vitest";
import { DhanSandboxAdapter } from "@/lib/brokers/adapters/DhanSandboxAdapter";

describe("DhanSandboxAdapter", () => {
  const mockConfig = {
    client_id: "sandbox_client",
    access_token: "sandbox_token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should authenticate successfully", async () => {
    const adapter = new DhanSandboxAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("sandbox_token");
  });

  it("should fetch profile from sandbox", async () => {
    const mockProfileResponse = {
      dhanClientName: "Sandbox User",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new DhanSandboxAdapter(mockConfig);
    const profile = await adapter.getProfile();

    expect(profile.name).toBe("Sandbox User");
    expect(profile.brokerName).toBe("dhan_sandbox");
  });
});
