/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/brokers/callback/route';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/encryption';
import { BrokerFactory } from '@/lib/brokers/BrokerFactory';

vi.mock('@/lib/db');
vi.mock('@/lib/encryption');
vi.mock('@/lib/brokers/BrokerFactory');

describe('API: /api/brokers/callback', () => {
  const mockUrl =
    'http://localhost:3000/api/brokers/callback?code=test-code&state=test-conn-id';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(decrypt).mockImplementation(
      (val) => val?.replace('enc_', 'dec_') || ''
    );
    vi.mocked(encrypt).mockImplementation((val) => `enc_${val}`);
  });

  it('should return 400 if code or state is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/brokers/callback');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('should return 404 if connection not found', async () => {
    vi.mocked(query).mockResolvedValue({ rowCount: 0, rows: [] } as any);
    const req = new NextRequest(mockUrl);
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('should exchange code and update database on success', async () => {
    const mockConnection = {
      id: 'test-conn-id',
      broker_name: 'upstox',
      api_key: 'enc_api_key',
      api_secret: 'enc_api_secret',
    };

    vi.mocked(query)
      .mockResolvedValueOnce({ rowCount: 1, rows: [mockConnection] } as any) // Fetch connection
      .mockResolvedValueOnce({ rowCount: 1 } as any); // Update connection

    const mockAdapter = {
      handleOAuthCallback: vi.fn().mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
      }),
    };
    vi.mocked(BrokerFactory.createAdapter).mockReturnValue(mockAdapter as any);

    const req = new NextRequest(mockUrl);
    const res = await GET(req);

    expect(mockAdapter.handleOAuthCallback).toHaveBeenCalledWith('test-code');
    expect(vi.mocked(query)).toHaveBeenCalledTimes(2);

    // Check if query was called with encrypted token
    const lastCall = vi.mocked(query).mock.calls[1];
    expect(lastCall[1]).toContain('enc_new-access-token');

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/user-dashboard');
  });

  it('should return 400 if OAuth callback fails', async () => {
    const mockConnection = {
      id: 'test-conn-id',
      broker_name: 'upstox',
      api_key: 'enc_api_key',
      api_secret: 'enc_api_secret',
    };

    vi.mocked(query).mockResolvedValue({
      rowCount: 1,
      rows: [mockConnection],
    } as any);

    const mockAdapter = {
      handleOAuthCallback: vi.fn().mockResolvedValue({
        success: false,
        message: 'Invalid authorization code',
      }),
    };
    vi.mocked(BrokerFactory.createAdapter).mockReturnValue(mockAdapter as any);

    const req = new NextRequest(mockUrl);
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('OAuth callback failed');
    expect(data.message).toBe('Invalid authorization code');
  });
});
