import express from "express";
import { StatusCodes } from "http-status-codes";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { authMiddleware, JWT_SECRET } from "../../middlewares/auth.middleware";
import { readData, writeData } from "../../utils";
import { CreateStaffDTO, LoginStaffDTO, UpdateStaffDTO, type Staff } from "../dto/staff.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const staffController = express.Router();


staffController.post('/register', validationMiddleware(CreateStaffDTO), async (req, res) => {
    const data = await readData();
    const body = req.body;

    if (data.staff.some((m: Staff) => m.email === body.email)) {
        res.status(StatusCodes.BAD_REQUEST).send({
            error: "Staff member with this email already exists"
        });
        return;
    }

    const maxId = data.staff.length > 0 ? Math.max(...data.staff.map((m: Staff) => m.id)) : -1;
    const newId = maxId + 1;

        

    const hashed = await bcrypt.hash(body.password, 10);
    const newMember = {
        ...{ id: newId },
        ...body,
        ...{ password: hashed },
        ...{ joinDate: new Date().toISOString() },
    };

    data.staff.push(newMember);
    await writeData(data);

    const token = jwt.sign(
        { id: newMember.id, role: newMember.role },
        JWT_SECRET,
        { expiresIn: "24h" }
    )

    const { password, ...memberNoPass } = newMember;

    res.status(StatusCodes.CREATED).send({
        ...memberNoPass,
        token
    });
})


staffController.post('/login', validationMiddleware(LoginStaffDTO), async (req, res) => {
    const data = await readData();
    const body = req.body;
    
    console.log("staff from file:", data.staff);
    console.log("body:", req.body);

    const member = data.staff.find((m: Staff) => m.email === body.email);
    if (!member) {
        res.status(StatusCodes.BAD_REQUEST).send({ error: "Invalid credentials" });
        return;
    }

    const match = await bcrypt.compare(body.password, member.password);
    if (!match) {
        res.status(StatusCodes.BAD_REQUEST).send({ error: "Invalid credentials" });
        return;
    }

    const token = jwt.sign(
        { id: member.id, role: member.role },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    const { password: pwd, ...memberNoPass } = member;
    res.status(StatusCodes.OK).send({ ...memberNoPass, token });
})

staffController.use(authMiddleware());

staffController.get('/me', async (req, res) => {
    const data = await readData();
    const user = (req as any).user as Staff;

    const member = data.staff.find((m: Staff) => m.id === user.id);
    if (!member) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    const { password, ...memberNoPass } = member;
    res.status(StatusCodes.OK).send(memberNoPass);
})

staffController.put('/me', validationMiddleware(UpdateStaffDTO), async (req, res) => {
    const data = await readData();
    const user = (req as any).user as Staff;
    const i = data.staff.findIndex((m: Staff) => m.id === user.id);

    if (i === -1) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
    }

    const updatedMember = {
        ...data.staff[i],
        ...req.body
    }

    data.staff[i] = updatedMember;
    await writeData(data);

    const { password, ...memberNoPass } = updatedMember;
    res.status(StatusCodes.OK).send(memberNoPass);
})

staffController.delete('/me', async (req, res) => {
    const data = await readData();
    const user = (req as any).user as Staff;
    const i = data.staff.findIndex((m: Staff) => m.id === user.id);

    if (i === -1) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    data.staff.splice(i, 1);
    await writeData(data);
    res.status(StatusCodes.NO_CONTENT).send();
})

staffController.delete('/fire/:id', authMiddleware(true), async (req, res) => {
    const idToDelete = req.params.id;
    const data = await readData();

    const idx = data.staff.findIndex(
      (m: Staff) => m.id.toString() === idToDelete
    );

    if (idx === -1) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    data.staff.splice(idx, 1);
    await writeData(data);

    res.status(StatusCodes.NO_CONTENT).send();
})