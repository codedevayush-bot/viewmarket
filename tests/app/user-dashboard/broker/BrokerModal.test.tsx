import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrokerModal from '@/app/user-dashboard/broker/BrokerModal';

describe('BrokerModal', () => {
  const mockBroker = {
    id: 'broker-1',
    name: 'zerodha',
    display_name: 'Zerodha',
    form_schema: {
      fields: [
        { name: 'account_id', label: 'User ID', type: 'text', required: true },
        { name: 'api_key', label: 'API Key', type: 'text', required: true },
        {
          name: 'api_secret',
          label: 'API Secret',
          type: 'password',
          required: true,
        },
      ],
    },
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('renders correctly with form fields', () => {
    render(
      <BrokerModal
        broker={mockBroker}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Zerodha')).toBeInTheDocument();
    expect(screen.getByLabelText('User ID')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByLabelText('API Secret')).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <BrokerModal
        broker={mockBroker}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('User ID'), {
      target: { value: 'user123', name: 'account_id' },
    });
    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'key123', name: 'api_key' },
    });
    fireEvent.change(screen.getByLabelText('API Secret'), {
      target: { value: 'secret123', name: 'api_secret' },
    });

    fireEvent.click(screen.getByText('Connect Account'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/brokers/connect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            broker_id: 'broker-1',
            account_id: 'user123',
            credentials: {
              account_id: 'user123',
              api_key: 'key123',
              api_secret: 'secret123',
            },
          }),
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Connection failed' }),
    });

    render(
      <BrokerModal
        broker={mockBroker}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('User ID'), {
      target: { value: 'user123', name: 'account_id' },
    });
    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'key123', name: 'api_key' },
    });
    fireEvent.change(screen.getByLabelText('API Secret'), {
      target: { value: 'secret123', name: 'api_secret' },
    });

    fireEvent.click(screen.getByText('Connect Account'));

    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });
});
