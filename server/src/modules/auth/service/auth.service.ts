import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { AuthRepository } from '../repository/auth.repository.js';
import { config } from '../../../config/index.js';
import { emailService } from '../../../services/email.service.js';
import { 
  RegisterTenantDto, 
  RegisterUserDto, 
  LoginDto, 
  AuthResponseDto,
  ResetPasswordDto
} from '../dto/auth.dto.js';
import { JwtPayload } from '../types/auth.types.js';

// Initialize Redis client using the configured URL
class RedisFallback {
  private redis: any = null;
  private memoryCache = new Map<string, { value: string; expiry: number }>();
  private useMemory = false;

  constructor() {
    try {
      this.redis = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });
      this.redis.on('error', (err: any) => {
        if (!this.useMemory) {
          console.warn(`[Redis] Connection failed. Falling back to local in-memory store.`);
          this.useMemory = true;
        }
      });
    } catch (err: any) {
      console.warn(`[Redis] Initialization failed. Falling back to local in-memory store.`);
      this.useMemory = true;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory) {
      const entry = this.memoryCache.get(key);
      if (!entry) return null;
      if (entry.expiry < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      return entry.value;
    }
    try {
      return await this.redis.get(key);
    } catch {
      this.useMemory = true;
      return this.get(key);
    }
  }

  async set(key: string, value: string, mode?: string, durationSeconds?: number): Promise<string> {
    if (this.useMemory) {
      const expiry = durationSeconds ? Date.now() + durationSeconds * 1000 : Infinity;
      this.memoryCache.set(key, { value, expiry });
      return 'OK';
    }
    try {
      if (mode === 'EX' && durationSeconds) {
        return await this.redis.set(key, value, 'EX', durationSeconds);
      }
      return await this.redis.set(key, value);
    } catch {
      this.useMemory = true;
      return this.set(key, value, mode, durationSeconds);
    }
  }

  async del(key: string): Promise<number> {
    if (this.useMemory) {
      const existed = this.memoryCache.has(key);
      this.memoryCache.delete(key);
      return existed ? 1 : 0;
    }
    try {
      return await this.redis.del(key);
    } catch {
      this.useMemory = true;
      return this.del(key);
    }
  }

  async quit(): Promise<void> {
    if (!this.useMemory && this.redis) {
      await this.redis.quit().catch(() => {});
    }
  }
}

export const redis = new RedisFallback();

export class AuthService {
  private authRepository = new AuthRepository();

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: payload.userId }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async registerTenant(dto: RegisterTenantDto): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    // 1. Create Tenant (FPO)
    const tenant = await this.authRepository.createTenant({
      name: dto.tenantName,
      licenseNumber: dto.licenseNumber || null,
      status: 'active',
    });

    // 2. Create User
    const passwordHash = this.hashPassword(dto.passwordHash);
    const user = await this.authRepository.createUser({
      tenantId: tenant.id,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName || null,
      lastName: dto.lastName || null,
      status: 'pending', // Pending email verification
    });

    // 3. Ensure role exists & assign FPO Admin role
    let fpoAdminRole = await this.authRepository.findRoleByName('FPO_ADMIN');
    if (!fpoAdminRole) {
      fpoAdminRole = await this.authRepository.createRole({
        name: 'FPO_ADMIN',
        description: 'FPO Tenant Administrator with full rights within the tenant scope',
      });
    }
    await this.authRepository.assignRoleToUser(user.id, fpoAdminRole.id);

    // 4. Generate OTP for email verification (stored in Redis for 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:verify:${dto.email}`, otp, 'EX', 600);

    // Send OTP via email
    await emailService.sendOtpEmail(dto.email, otp, 'verification');

    const tokens = this.generateTokens({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      roles: ['FPO_ADMIN'],
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: tenant.id,
        roles: ['FPO_ADMIN'],
      },
    };
  }

  async registerUser(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const tenant = await this.authRepository.findTenantById(dto.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const passwordHash = this.hashPassword(dto.passwordHash);
    const user = await this.authRepository.createUser({
      tenantId: tenant.id,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName || null,
      lastName: dto.lastName || null,
      status: 'active', // Default to active for invited/added users
    });

    const roleName = dto.roleName || 'FARMER';
    let role = await this.authRepository.findRoleByName(roleName);
    if (!role) {
      role = await this.authRepository.createRole({
        name: roleName,
        description: `${roleName} role`,
      });
    }
    await this.authRepository.assignRoleToUser(user.id, role.id);

    const tokens = this.generateTokens({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      roles: [roleName],
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: tenant.id,
        roles: [roleName],
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new Error('User account is suspended');
    }

    const isValid = this.verifyPassword(dto.passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const roles = await this.authRepository.getUserRoles(user.id);
    const tokens = this.generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles,
      },
    };
  }

  async verifyEmail(email: string, otp: string): Promise<boolean> {
    const storedOtp = await redis.get(`otp:verify:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    await this.authRepository.updateUser(user.id, { status: 'active' });
    await redis.del(`otp:verify:${email}`);
    return true;
  }

  async sendForgotPasswordOtp(email: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:reset:${email}`, otp, 'EX', 600); // 10 minutes

    // Send OTP via email
    await emailService.sendOtpEmail(email, otp, 'password_reset');
  }

  async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    const storedOtp = await redis.get(`otp:reset:${dto.email}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new Error('User not found');
    }

    const newPasswordHash = this.hashPassword(dto.newPasswordPlain);
    await this.authRepository.updateUser(user.id, { passwordHash: newPasswordHash });
    await redis.del(`otp:reset:${dto.email}`);
    return true;
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };
      const user = await this.authRepository.findUserById(decoded.userId);
      if (!user || user.status === 'suspended') {
        throw new Error('User not found or suspended');
      }

      const roles = await this.authRepository.getUserRoles(user.id);
      const tokens = this.generateTokens({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roles,
      });

      return tokens;
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Standard logout would blacklist the refresh token in Redis if caching them
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 7 * 24 * 3600); // Blacklist for 7 days
    } catch {
      // Ignore if token is already expired/invalid
    }
  }
}
