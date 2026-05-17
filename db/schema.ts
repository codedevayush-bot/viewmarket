import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  bigint,
  index,
} from 'drizzle-orm/pg-core';

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    role: text('role').default('user').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
  },
  (table) => [index('users_created_at_idx').on(table.createdAt)]
);

// ─── Accounts (OAuth) ───────────────────────────────────────────────
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: bigint('expires_at', { mode: 'number' }),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

// ─── Sessions ────────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// ─── Verification Tokens ────────────────────────────────────────────
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// ─── Brokers ─────────────────────────────────────────────────────────
export const brokers = pgTable('brokers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  authType: text('auth_type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  formSchema: jsonb('form_schema'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Broker Connections ─────────────────────────────────────────────
export const brokerConnections = pgTable('broker_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  brokerId: uuid('brokerId')
    .notNull()
    .references(() => brokers.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  encryptedCredentials: jsonb('encrypted_credentials'),
  tokenExpiresAt: timestamp('token_expires_at', { mode: 'date' }),
  isValid: boolean('is_valid').default(true),
  sessionData: jsonb('session_data'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

// ─── Tickets ─────────────────────────────────────────────────────────
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  status: text('status').default('open').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// ─── Ticket Messages ────────────────────────────────────────────────
export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Ticket Attachments ─────────────────────────────────────────────
export const ticketAttachments = pgTable('ticket_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => ticketMessages.id, { onDelete: 'cascade' }),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  fileKey: text('file_key'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Trades ──────────────────────────────────────────────────────────
export const trades = pgTable('trades', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  brokerConnectionId: uuid('broker_connection_id').references(
    () => brokerConnections.id,
    { onDelete: 'set null' }
  ),
  symbol: text('symbol').notNull(),
  side: text('side').notNull(),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  status: text('status').default('pending').notNull(),
  orderId: text('order_id'),
  executedAt: timestamp('executed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Orders (Razorpay) ──────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  razorpayOrderId: text('razorpay_order_id').notNull().unique(),
  plan: text('plan').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').default('INR').notNull(),
  status: text('status').default('created').notNull(),
  receipt: text('receipt'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Payments (Razorpay) ────────────────────────────────────────────
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  razorpayPaymentId: text('razorpay_payment_id').notNull().unique(),
  razorpaySignature: text('razorpay_signature').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  method: text('method'),
  status: text('status').default('captured').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── User Subscriptions ─────────────────────────────────────────────
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  plan: text('plan').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  status: text('status').default('active').notNull(),
  startDate: timestamp('start_date', { mode: 'date' }).defaultNow().notNull(),
  endDate: timestamp('end_date', { mode: 'date' }),
  razorpayOrderId: text('razorpay_order_id'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});
