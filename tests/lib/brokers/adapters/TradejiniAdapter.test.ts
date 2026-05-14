import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradejiniAdapter } from '@/lib/brokers/adapters/TradejiniAdapter';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '112233'),
}));

describe('TradejiniAdapter', () => {
  const mockConfig = {
    api_secret: 'tj_sec',
    password: 'tj_password',
    totp_secret: 'tj_totp_sec',
    client_id: 'TJ123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockAuthResponse = {
      access_token: 'tj_access_token',
      expires_in: 3600,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new TradejiniAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('tj_access_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      clientCode: 'TJ123',
      clientName: 'Tradejini Tester',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new TradejiniAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('TJ123');
    expect(profile.name).toBe('Tradejini Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      orderId: 'TJ_ORD_1414',
      message: 'Placed',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new TradejiniAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'HINDALCO',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('TJ_ORD_1414');
  });
});
