import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KotakNeoAdapter } from '@/lib/brokers/adapters/KotakNeoAdapter';
import { generateTOTP } from '@/lib/brokers/utils/totp';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '654321'),
}));

describe('KotakNeoAdapter', () => {
  const mockConfig = {
    ucc: 'KOTAK123',
    api_key: 'test_key',
    api_secret: 'test_secret',
    mobile_number: '9876543210',
    mpin: '1234',
    totp_secret: 'KOTAKSECRET',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully through two steps', async () => {
    const mockLoginResponse = {
      data: {
        status: 'success',
        token: 'view_token',
        sid: 'view_sid',
      },
    };

    const mockValidateResponse = {
      data: {
        status: 'success',
        token: 'trading_token',
        sid: 'trading_sid',
        baseUrl: 'https://actual.kotak.com',
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidateResponse,
      } as Response);

    const adapter = new KotakNeoAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(generateTOTP).toHaveBeenCalledWith('KOTAKSECRET');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe(
      'trading_token:::trading_sid:::https://actual.kotak.com'
    );
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      status: 'success',
      data: {
        availableMargin: '15000.75',
        marginUsed: '3000.00',
        totalMargin: '18000.75',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new KotakNeoAdapter({
      ...mockConfig,
      access_token: 'token:::sid:::https://api.kotak.com',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(15000.75);
    expect(funds.utilizedMargin).toBe(3000);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: 'success',
      data: {
        orderId: 'KOTAK_ORD_999',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new KotakNeoAdapter({
      ...mockConfig,
      access_token: 'token:::sid:::https://api.kotak.com',
    });
    const result = await adapter.placeOrder({
      symbol: 'HDFC-EQ',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'CNC',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('KOTAK_ORD_999');
  });
});
