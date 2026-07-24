export interface RegisterTenantDto {
  tenantName: string;
  licenseNumber?: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterUserDto {
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
}

export interface LoginDto {
  email: string;
  passwordPlain: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPasswordPlain: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    tenantId: string | null;
    roles: string[];
  };
}
