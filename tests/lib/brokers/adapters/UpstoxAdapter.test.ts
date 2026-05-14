import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpstoxAdapter } from '@/lib/brokers/adapters/UpstoxAdapter';

describe('UpstoxAdapter', () => {
  const mockConfig = {
    client_id: 'test_client_id',
    client_secret: 'test_client_secret',
    redirect_uri: 'http://localhost:3000/callback',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize correctly with credentials', () => {
    const adapter = new UpstoxAdapter(mockConfig);
    expect(adapter).toBeDefined();
  });

  it('should generate a correct redirect URL in authenticate()', async () => {
    const adapter = new UpstoxAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.isOAuth).toBe(true);
    expect(result.redirectUrl).toContain(
      'https://api.upstox.com/v2/login/authorization/dialog'
    );
    expect(result.redirectUrl).toContain('client_id=test_client_id');
    expect(result.redirectUrl).toContain(
      'redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback'
    );
  });

  it('should handle OAuth callback successfully', async () => {
    const adapter = new UpstoxAdapter(mockConfig);
    const mockResponse = {
      access_token: 'test_access_token',
      user_id: 'test_user',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await adapter.handleOAuthCallback('test_code');

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('test_access_token');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.upstox.com/v2/login/authorization/token',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams),
      })
    );
  });

  it('should handle OAuth callback failure', async () => {
    const adapter = new UpstoxAdapter(mockConfig);
    const mockError = {
      errors: [{ message: 'Invalid code' }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => mockError,
    });

    const result = await adapter.handleOAuthCallback('invalid_code');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid code');
  });
});
