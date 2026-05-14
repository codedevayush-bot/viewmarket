import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirstockAdapter } from '@/lib/brokers/adapters/FirstockAdapter';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '999888'),
}));

describe('FirstockAdapter', () => {
  const mockConfig = {
    client_id: 'FS123',
    password: 'fs_password',
    totp_secret: 'fs_totp_sec',
    api_key: 'fs_key',
    api_secret: 'fs_vendor',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockAuthResponse = {
      status: 'success',
      data: { susertoken: 'fs_token_abc' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new FirstockAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('fs_token_abc');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      status: 'success',
      data: { userName: 'Firstock Tester' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new FirstockAdapter({
      ...mockConfig,
      access_token: 'fs_jkey',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('FS123');
    expect(profile.name).toBe('Firstock Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: 'success',
      data: { orderNumber: 'FS_ORD_1010' },
      message: 'Placed',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new FirstockAdapter({
      ...mockConfig,
      access_token: 'fs_jkey',
    });
    const result = await adapter.placeOrder({
      symbol: 'INFY',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'CNC',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('FS_ORD_1010');
  });
});
