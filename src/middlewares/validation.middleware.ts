import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { validate, type ValidatorOptions } from "class-validator";
import { plainToInstance } from "class-transformer";

export const validationMiddleware = (dto: any) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const dtoInstance = plainToInstance(dto, req.body);

            const validOptions: ValidatorOptions = {
                whitelist: true,
                forbidNonWhitelisted: true,
                validationError: { target: false, value: false }
            }

            const errors = await validate(dtoInstance, validOptions);

            if (errors.length > 0) {
                res.status(StatusCodes.BAD_REQUEST).json(errors);
                return;
            }

            next();
        } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        }
    }
}