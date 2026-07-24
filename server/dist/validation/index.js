import { ZodError } from 'zod';
import { AppError } from '../common/index.js';
export const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                next(new AppError('Validation failed', 400, error.errors));
            }
            else {
                next(error);
            }
        }
    };
};
