import { z } from 'zod';

export const updateTenantSchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  subscriptionPlan: z.enum(['free', 'premium', 'enterprise']).optional(),
});

export const updateUserSchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
});

export const updatePlatformSettingsSchema = z.object({
  settingKey: z.string().min(2, 'Setting key is required'),
  settingValue: z.string().min(1, 'Setting value is required'),
});

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
  permissionIds: z.array(z.string().uuid('Invalid permission ID')),
});
