export interface UserPayload {
  id: string;
  email: string;
  role: 'SuperAdmin' | 'FPOAdmin' | 'QualityInspector' | 'Farmer';
  tenantId?: string;
}
