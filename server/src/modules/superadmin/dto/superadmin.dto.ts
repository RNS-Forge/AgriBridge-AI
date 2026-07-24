export interface TenantUpdateDto {
  status?: 'active' | 'suspended';
  subscriptionPlan?: 'free' | 'premium' | 'enterprise';
}

export interface UserUpdateDto {
  status?: 'active' | 'suspended';
}

export interface PlatformSettingsUpdateDto {
  settingKey: string;
  settingValue: string;
}

export interface SuperAdminDashboardDto {
  totalTenants: number;
  totalUsers: number;
  totalHarvestsKg: number;
  totalOrdersCount: number;
  premiumSubscriptionsCount: number;
  activeSettings: Array<{ settingKey: string; settingValue: string }>;
}

export interface RolePermissionMappingDto {
  roleId: string;
  permissionIds: string[];
}
