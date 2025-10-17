/**
 * Validation Schemas with Zod
 *
 * Comprehensive validation for all API endpoints
 * Prevents injection attacks and data corruption
 *
 * @author Claude Code
 * @date 2025-10-16
 */

import { z } from 'zod'

// ============================================
// COMMON SCHEMAS
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const emailSchema = z.string().email('Invalid email format')

export const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'Invalid CPF format')
  .transform(val => val.replace(/\D/g, ''))

export const phoneSchema = z.string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/, 'Invalid phone format')
  .transform(val => val.replace(/\D/g, ''))

export const dateSchema = z.string().datetime('Invalid ISO 8601 date')

export const colorSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')

// ============================================
// AI SCHEMAS
// ============================================

export const geminiProxySchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  model: z.string().optional().default('gemini-pro'),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxTokens: z.number().min(1).max(8192).optional().default(2048),
  systemInstruction: z.string().optional()
})

// ============================================
// SUBSCRIPTION SCHEMAS
// ============================================

export const customerDataSchema = z.object({
  name: z.string().min(3).max(100),
  email: emailSchema,
  cpfCnpj: cpfSchema,
  phone: phoneSchema.optional(),
  mobilePhone: phoneSchema,
  address: z.string().min(3).max(200),
  addressNumber: z.string().min(1).max(10),
  province: z.string().min(2).max(100),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/).transform(val => val.replace(/\D/g, ''))
})

export const creditCardSchema = z.object({
  holderName: z.string().min(3).max(100),
  number: z.string().regex(/^\d{13,19}$/),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^\d{4}$/),
  ccv: z.string().regex(/^\d{3,4}$/)
})

export const createSubscriptionSchema = z.object({
  planId: uuidSchema,
  customerData: customerDataSchema,
  paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX']).optional(),
  creditCardData: creditCardSchema.optional(),
  couponCode: z.string().max(50).optional(),
  affiliateId: uuidSchema.optional()
})

// ============================================
// HELPER FUNCTION
// ============================================

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw createError({
        statusCode: 400,
        message: `Validation error: ${messages}`
      })
    }
    throw error
  }
}
