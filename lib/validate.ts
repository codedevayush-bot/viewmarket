import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Validate request body against a zod schema.
 * Returns the parsed data or a 400 error response.
 */
export async function validateRequest<T extends z.ZodType>(
  req: Request,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_JSON' },
        { status: 400 }
      ),
    };
  }
}

/** Common validation schemas — field names match actual API route payloads */
export const schemas = {
  brokerConnect: z.object({
    broker_id: z.string().min(1),
    account_id: z.string().min(1),
    credentials: z.record(z.string(), z.string()).optional(),
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
  }),

  ticketCreate: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    category: z.string().optional(),
    attachments: z
      .array(
        z.object({
          fileName: z.string(),
          fileUrl: z.string().url(),
          fileType: z.string(),
          fileSize: z.number(),
          fileKey: z.string(),
        })
      )
      .optional(),
  }),

  ticketMessage: z.object({
    message: z.string().min(1).max(5000),
  }),

  brokerTest: z.object({
    connectionId: z.string().min(1),
  }),

  tokenExchange: z.object({
    connectionId: z.string().min(1),
    requestToken: z.string().min(1),
  }),
} as const;
