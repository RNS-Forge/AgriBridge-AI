import { AuthService } from '../service/auth.service.js';
import { registerTenantSchema, registerUserSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from '../validation/auth.validation.js';
export class AuthController {
    authService = new AuthService();
    registerTenant = async (req, res, next) => {
        try {
            const validated = registerTenantSchema.parse(req.body);
            const result = await this.authService.registerTenant({
                tenantName: validated.tenantName,
                licenseNumber: validated.licenseNumber,
                email: validated.email,
                passwordHash: validated.password,
                firstName: validated.firstName,
                lastName: validated.lastName,
            });
            res.status(201).json({
                success: true,
                message: 'Tenant registered successfully. Verification OTP sent.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    registerUser = async (req, res, next) => {
        try {
            const validated = registerUserSchema.parse(req.body);
            const result = await this.authService.registerUser({
                tenantId: validated.tenantId,
                email: validated.email,
                passwordHash: validated.password,
                firstName: validated.firstName,
                lastName: validated.lastName,
                roleName: validated.roleName,
            });
            res.status(201).json({
                success: true,
                message: 'User registered successfully under tenant.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validated = loginSchema.parse(req.body);
            const result = await this.authService.login({
                email: validated.email,
                passwordPlain: validated.password,
            });
            res.status(200).json({
                success: true,
                message: 'Login successful.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    verifyEmail = async (req, res, next) => {
        try {
            const validated = verifyEmailSchema.parse(req.body);
            await this.authService.verifyEmail(validated.email, validated.otp);
            res.status(200).json({
                success: true,
                message: 'Email verified successfully. Account is now active.',
            });
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const validated = forgotPasswordSchema.parse(req.body);
            await this.authService.sendForgotPasswordOtp(validated.email);
            res.status(200).json({
                success: true,
                message: 'Password reset OTP sent successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const validated = resetPasswordSchema.parse(req.body);
            await this.authService.resetPassword({
                email: validated.email,
                otp: validated.otp,
                newPasswordPlain: validated.newPassword,
            });
            res.status(200).json({
                success: true,
                message: 'Password reset successful.',
            });
        }
        catch (error) {
            next(error);
        }
    };
    refreshTokens = async (req, res, next) => {
        try {
            const validated = refreshTokenSchema.parse(req.body);
            const result = await this.authService.refreshTokens(validated.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Tokens refreshed successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const validated = refreshTokenSchema.parse(req.body);
            await this.authService.logout(validated.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Logout successful.',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
