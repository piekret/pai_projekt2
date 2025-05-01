import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { readData } from "../utils";
import jwt from "jsonwebtoken";
import { Staff } from "../staff/dto/staff.dto";

export const JWT_SECRET = "skibidi_amongus_sigma_eyeofrah";

export const authMiddleware =  (admin: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const auth = req.header("Authorization");
        if (!auth) {
            res.status(StatusCodes.UNAUTHORIZED).send();
            return;
        }

        const [scheme, token] = auth.split(" ");
        if (scheme !== "Bearer" || !token) {
            res.status(StatusCodes.UNAUTHORIZED).send();
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
            const data = await readData();
            const staffMember = data.staff.find((m: Staff) => m.id.toString() == decoded.id)

            if (!staffMember) {
                res.status(StatusCodes.UNAUTHORIZED).send();
                return;
            }

            if (admin && staffMember.role !== "admin") {
                res.status(StatusCodes.FORBIDDEN).send();
                return;
            }

            (req as any).user = staffMember;
            next();
        } catch (e) {
            res.status(StatusCodes.UNAUTHORIZED).send();
        }
    }
}

