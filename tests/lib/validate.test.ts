import { describe, it, expect } from 'vitest';
import { schemas } from '@/lib/validate';

describe('Validation schemas', () => {
  describe('brokerConnect', () => {
    it('accepts valid broker connect payload', () => {
      const result = schemas.brokerConnect.safeParse({
        broker_id: 'broker-123',
        account_id: 'acc-456',
        credentials: { api_key: 'key', api_secret: 'secret' },
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing broker_id', () => {
      const result = schemas.brokerConnect.safeParse({
        account_id: 'acc-456',
        credentials: { api_key: 'key' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty broker_id', () => {
      const result = schemas.brokerConnect.safeParse({
        broker_id: '',
        account_id: 'acc-456',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ticketCreate', () => {
    it('accepts valid ticket payload', () => {
      const result = schemas.ticketCreate.safeParse({
        title: 'Test ticket',
        description: 'This is a test ticket description',
        category: 'general',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = schemas.ticketCreate.safeParse({
        title: '',
        description: 'Description',
      });
      expect(result.success).toBe(false);
    });

    it('rejects title over 200 chars', () => {
      const result = schemas.ticketCreate.safeParse({
        title: 'a'.repeat(201),
        description: 'Description',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing description', () => {
      const result = schemas.ticketCreate.safeParse({
        title: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ticketMessage', () => {
    it('accepts valid message', () => {
      const result = schemas.ticketMessage.safeParse({
        message: 'Hello, this is a message',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty message', () => {
      const result = schemas.ticketMessage.safeParse({
        message: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
