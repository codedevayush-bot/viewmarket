import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IIFLCapitalAdapter } from '@/lib/brokers/adapters/IIFLCapitalAdapter';

describe('IIFLCapitalAdapter', () => {
  const mockConfig = {
    api_key: 'test_key',
    api_secret: 'test_secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should return redirect URL via authenticate()', async () => {
    const adapter = new IIFLCapitalAdapter(mockConfig);
    const result = await adapter.authenticate();
    expect(result.success).toBe(true);
    expect(result.isOAuth).toBe(true);
    expect(result.redirectUrl).toContain('test_key');
  });

  it('should handle OAuth callback successfully', async () => {
    const mockResponse = {
      status: 'ok',
      userSession: 'mock_session_token',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const adapter = new IIFLCapitalAdapter(mockConfig);
    const result = await adapter.handleOAuthCallback('valid_code');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/getusersession'),
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('mock_session_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      status: 'ok',
      clientCode: 'IIFL123',
      clientName: 'IIFL User',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new IIFLCapitalAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('IIFL123');
    expect(profile.name).toBe('IIFL User');
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      status: 'ok',
      availableMargin: '5000.00',
      utilizedMargin: '1000.00',
      totalMargin: '6000.00',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new IIFLCapitalAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(5000);
    expect(funds.utilizedMargin).toBe(1000);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: 'ok',
      orderId: 'IIFL_ORDER_001',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new IIFLCapitalAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'SBIN-EQ',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('IIFL_ORDER_001');
  });
});
