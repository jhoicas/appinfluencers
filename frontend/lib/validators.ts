/**
 * Zod validation schemas
 * These schemas MUST match the Pydantic schemas in the backend
 */
import { z } from 'zod';

// User Roles
export const UserRole = z.enum(['EMPRESA', 'INFLUENCER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

// Campaign Status
export const CampaignStatus = z.enum([
  'PENDIENTE',
  'ACTIVA',
  'NEGOCIACION',
  'RECHAZADA',
  'FINALIZADA',
  'CANCELADA',
]);
export type CampaignStatus = z.infer<typeof CampaignStatus>;

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: UserRole,
});
export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// USER SCHEMAS
// ============================================

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  full_name: z.string(),
  role: UserRole,
  is_active: z.boolean(),
  is_approved: z.boolean(),
  trial_start_time: z.string().nullable(),
  trial_profile_viewed_id: z.number().nullable(),
  has_active_subscription: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const trialStatusSchema = z.object({
  has_trial: z.boolean(),
  is_active: z.boolean(),
  trial_start: z.string().nullable(),
  trial_end: z.string().nullable(),
  hours_remaining: z.number().nullable(),
  has_viewed_free_profile: z.boolean(),
  can_view_more_profiles: z.boolean(),
});
export type TrialStatus = z.infer<typeof trialStatusSchema>;

// ============================================
// PROFILE SCHEMAS
// ============================================

export const profileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  bio: z.string().nullable(),
  instagram_handle: z.string().nullable(),
  instagram_followers: z.number().nullable(),
  tiktok_handle: z.string().nullable(),
  tiktok_followers: z.number().nullable(),
  youtube_handle: z.string().nullable(),
  youtube_subscribers: z.number().nullable(),
  suggested_rate_per_post: z.number().nullable(),
  average_engagement_rate: z.number().nullable(),
  total_campaigns_completed: z.number(),
  average_rating: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;

export const createProfileSchema = z.object({
  bio: z.string().min(10, 'La biografía debe tener al menos 10 caracteres').max(500),
  instagram_handle: z.string().optional(),
  instagram_followers: z.number().min(0).optional(),
  tiktok_handle: z.string().optional(),
  tiktok_followers: z.number().min(0).optional(),
  youtube_handle: z.string().optional(),
  youtube_subscribers: z.number().min(0).optional(),
  suggested_rate_per_post: z.number().min(0).optional(),
});
export type CreateProfileFormData = z.infer<typeof createProfileSchema>;

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

export const campaignSchema = z.object({
  id: z.number(),
  empresa_id: z.number(),
  influencer_id: z.number(),
  title: z.string(),
  description: z.string(),
  proposed_budget: z.number(),
  final_budget: z.number().nullable(),
  status: CampaignStatus,
  created_at: z.string(),
  updated_at: z.string(),
});
export type Campaign = z.infer<typeof campaignSchema>;

export const createCampaignSchema = z.object({
  influencer_id: z.number().min(1, 'Debes seleccionar un influencer'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').max(2000),
  proposed_budget: z.number().min(1, 'El presupuesto debe ser mayor a 0'),
});
export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;

export const negotiateCampaignSchema = z.object({
  counter_budget: z.number().min(1, 'El presupuesto debe ser mayor a 0'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
});
export type NegotiateCampaignFormData = z.infer<typeof negotiateCampaignSchema>;

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  message: z.string(),
  notification_type: z.string(),
  is_read: z.boolean(),
  created_at: z.string(),
});
export type Notification = z.infer<typeof notificationSchema>;
