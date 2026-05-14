import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZebuAdapter } from '@/lib/brokers/adapters/ZebuAdapter';

describe('ZebuAdapter', () => {
  const mockConfig = {
    api_key: 'test_key',
    api_secret: 'test_secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should return redirect URL via authenticate()', async () => {
    const adapter = new ZebuAdapter(mockConfig);
    const result = await adapter.authenticate();
    expect(result.success).toBe(true);
    expect(result.isOAuth).toBe(true);
    expect(result.redirectUrl).toContain('test_key');
  });

  it('should handle OAuth callback successfully', async () => {
    const mockResponse = {
      stat: 'Ok',
      access_token: 'mock_access_token',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const adapter = new ZebuAdapter(mockConfig);
    const result = await adapter.handleOAuthCallback('valid_code');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/NorenWClientAPI/GenAcsTok'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: expect.stringContaining('jData='),
      })
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('mock_access_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      stat: 'Ok',
      actid: 'ZEBU123',
      uname: 'Zebu User',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new ZebuAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('ZEBU123');
    expect(profile.name).toBe('Zebu User');
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      stat: 'Ok',
      cash: '1000.00',
      margin_used: '200.00',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new ZebuAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(1000);
    expect(funds.utilizedMargin).toBe(200);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      stat: 'Ok',
      norenordno: 'ZEBU_ORD_555',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new ZebuAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'RELIANCE-EQ',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 10,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('ZEBU_ORD_555');
  });
});
