/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeltaExchangeAdapter } from '@/lib/brokers/adapters/DeltaExchangeAdapter';

describe('DeltaExchangeAdapter', () => {
  const mockConfig = {
    api_key: 'test_key',
    api_secret: 'test_secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully by verifying profile', async () => {
    const mockResponse = {
      success: true,
      result: { id: 12345, email: 'test@example.com' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const adapter = new DeltaExchangeAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v2/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'api-key': 'test_key',
          signature: expect.any(String),
        }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('test_key');
  });

  it('should handle invalid credentials', async () => {
    const mockResponse = {
      success: false,
      error: { message: 'Invalid API Key' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const adapter = new DeltaExchangeAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid API credentials');
  });

  it('should calculate correct signature', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const adapter = new DeltaExchangeAdapter(mockConfig);
    await adapter.getProfile();

    const lastCall = vi.mocked(fetch).mock.calls[0];
    const headers = lastCall[1]?.headers as any;
    expect(headers['signature']).toBeDefined();
    expect(headers['signature'].length).toBe(64); // SHA256 hex length
  });
});
