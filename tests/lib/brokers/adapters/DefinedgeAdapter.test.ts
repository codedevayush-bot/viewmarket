import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefinedgeAdapter } from '@/lib/brokers/adapters/DefinedgeAdapter';

describe('DefinedgeAdapter', () => {
  const mockConfig = {
    api_key: 'DE123',
    api_secret: 'de_sec',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should trigger OTP (Step 1)', async () => {
    const mockOtpResponse = { otp_token: 'de_otp_token' };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOtpResponse,
    } as Response);

    const adapter = new DefinedgeAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.metadata?.requiresOtp).toBe(true);
    expect(result.metadata?.otpToken).toBe('de_otp_token');
  });

  it('should verify OTP successfully (Step 2)', async () => {
    const mockTokenResponse = {
      stat: 'Ok',
      api_session_key: 'de_sess',
      susertoken: 'de_user_token',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockTokenResponse,
    } as Response);

    const adapter = new DefinedgeAdapter(mockConfig);
    const result = await adapter.authenticate({
      otp: '1234',
      otpToken: 'de_otp_token',
    });

    expect(result.success).toBe(true);
    expect(result.accessToken).toContain('de_sess:::de_user_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      stat: 'Ok',
      uid: 'DE123',
      uname: 'Definedge Tester',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new DefinedgeAdapter({
      ...mockConfig,
      access_token: 'sess:::token:::uid',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('DE123');
    expect(profile.name).toBe('Definedge Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      stat: 'Ok',
      norenordno: 'DE_ORD_999',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new DefinedgeAdapter({
      ...mockConfig,
      access_token: 'sess:::token:::uid',
    });
    const result = await adapter.placeOrder({
      symbol: 'TATASTEEL',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'NRML',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('DE_ORD_999');
  });
});
