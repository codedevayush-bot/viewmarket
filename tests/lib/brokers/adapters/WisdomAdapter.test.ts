import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WisdomAdapter } from '@/lib/brokers/adapters/WisdomAdapter';

describe('WisdomAdapter', () => {
  const mockConfig = {
    interactive_api_key: 'w_int_key',
    interactive_api_secret: 'w_int_sec',
    market_data_api_key: 'w_mkt_key',
    market_data_api_secret: 'w_mkt_sec',
    base_url: 'https://wisdom-test.xts.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockIntResponse = {
      type: 'success',
      result: { token: 'w_token_int' },
    };

    const mockMktResponse = {
      type: 'success',
      result: { token: 'w_token_mkt' },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMktResponse,
      } as Response);

    const adapter = new WisdomAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('w_token_int|w_token_mkt');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      type: 'success',
      result: { clientCode: 'W123', clientName: 'Wisdom Tester' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new WisdomAdapter({ ...mockConfig, access_token: 'it|mt' });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('W123');
    expect(profile.name).toBe('Wisdom Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      type: 'success',
      result: {
        AppOrderID: 'W_ORD_333',
      },
      description: 'Order OK',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new WisdomAdapter({ ...mockConfig, access_token: 'it|mt' });
    const result = await adapter.placeOrder({
      symbol: '12345',
      exchange: 'NSECM',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 10,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('W_ORD_333');
  });
});
