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

export const changePlanSchema = z.object({
  newPlanId: uuidSchema
})

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional()
})

// ============================================
// AFFILIATE SCHEMAS
// ============================================

export const affiliateRegisterSchema = z.object({
  coupon_code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/i),
  cpf: cpfSchema
})

export const affiliateWithdrawSchema = z.object({
  amount: z.number().positive().min(50),
  pix_key: z.string().min(3).max(100)
})

export const checkCouponSchema = z.object({
  code: z.string().min(1).max(50)
})

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  planId: uuidSchema
})

export const trackClickSchema = z.object({
  affiliateId: uuidSchema
})

export const approveWithdrawSchema = z.object({
  withdrawId: uuidSchema,
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().max(500).optional()
})

// ============================================
// MINDMAP SCHEMAS
// ============================================

export const mindmapNodeSchema = z.object({
  id: z.string().optional(),
  parent_id: z.union([uuidSchema, z.string()]).nullable().optional(),
  text: z.string().min(1).max(500),
  position_x: z.number().default(0),
  position_y: z.number().default(0),
  color: colorSchema.optional().default('#3b82f6')
})

export const createMindmapSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  nodes: z.array(mindmapNodeSchema).optional()
})

export const addMindmapNodeSchema = z.object({
  parent_id: uuidSchema.nullable().optional(),
  text: z.string().min(1).max(500),
  position_x: z.number().default(0),
  position_y: z.number().default(0),
  color: colorSchema.optional().default('#3b82f6')
})

export const generateMindmapFromTextSchema = z.object({
  text: z.string().min(10).max(50000),
  title: z.string().min(1).max(200).optional()
})

// ============================================
// WEBHOOK SCHEMAS
// ============================================

export const asaasWebhookSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    customer: z.string(),
    subscription: z.string().optional(),
    value: z.number(),
    status: z.string(),
    dueDate: z.string(),
    invoiceUrl: z.string().optional(),
    bankSlipUrl: z.string().optional()
  }).passthrough()
})

// ============================================
// HELPER FUNCTION
// ============================================

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed'
      throw createError({
        statusCode: 400,
        message: `Validation error: ${messages}`
      })
    }
    throw error
  }
}

// ============================================
// USER PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  avatar_url: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().url('URL inválida').nullable().optional()
  )
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(8, 'Senha atual deve ter no mínimo 8 caracteres'),
  new_password: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
  confirm_password: z.string().min(8, 'Confirmação de senha deve ter no mínimo 8 caracteres')
}).refine(data => data.new_password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
})

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  push_notifications_enabled: z.boolean().optional(),
  email_notifications_enabled: z.boolean().optional()
})
