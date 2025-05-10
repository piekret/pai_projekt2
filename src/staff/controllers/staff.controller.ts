import express from "express";
import { StatusCodes } from "http-status-codes";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { authMiddleware, JWT_SECRET } from "../../middlewares/auth.middleware";
import { readData, writeData } from "../../utils";
import {
  CreateStaffDTO,
  LoginStaffDTO,
  UpdateStaffDTO,
  type Staff,
} from "../dto/staff.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const staffController = express.Router();

/**
 * @swagger
 * /staff/register:
 *   post:
 *     summary: Register a new staff member
 *     tags:
 *       - Staff
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffDTO'
 *     responses:
 *       201:
 *         description: New staff member created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request – validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
staffController.post(
  "/register",
  validationMiddleware(CreateStaffDTO),
  async (req, res) => {
    const data = await readData();
    const body = req.body;

    if (data.staff.some((m: Staff) => m.email === body.email)) {
      res.status(StatusCodes.BAD_REQUEST).send({
        error: "Staff member with this email already exists",
      });
      return;
    }

    const maxId =
      data.staff.length > 0
        ? Math.max(...data.staff.map((m: Staff) => m.id))
        : -1;
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
    );

    const { password, ...memberNoPass } = newMember;

    res.status(StatusCodes.CREATED).send({
      ...memberNoPass,
      token,
    });
  }
);


/**
 * @swagger
 * /staff/login:
 *   post:
 *     summary: Log in a staff member
 *     tags:
 *       - Staff
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginStaffDTO'
 *     responses:
 *       200:
 *         description: Successful login, returns staff data and JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
staffController.post(
  "/login",
  validationMiddleware(LoginStaffDTO),
  async (req, res) => {
    const data = await readData();
    const body = req.body;

    console.log("staff from file:", data.staff);
    console.log("body:", req.body);

    const member = data.staff.find((m: Staff) => m.email === body.email);
    if (!member) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(body.password, member.password);
    if (!match) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: member.id, role: member.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const { password: pwd, ...memberNoPass } = member;
    res.status(StatusCodes.OK).send({ ...memberNoPass, token });
  }
);

staffController.use(authMiddleware());


/**
 * @swagger
 * /staff/me:
 *   get:
 *     summary: Get current staff profile
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update current staff profile
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStaffDTO'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete own staff account
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully (no content)
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
staffController.get("/me", async (req, res) => {
  const data = await readData();
  const user = (req as any).user as Staff;

  const member = data.staff.find((m: Staff) => m.id === user.id);
  if (!member) {
    res.status(StatusCodes.NOT_FOUND).send();
    return;
  }

  const { password, ...memberNoPass } = member;
  res.status(StatusCodes.OK).send(memberNoPass);
});

staffController.put(
  "/me",
  validationMiddleware(UpdateStaffDTO),
  async (req, res) => {
    const data = await readData();
    const user = (req as any).user as Staff;
    const i = data.staff.findIndex((m: Staff) => m.id === user.id);

    if (i === -1) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }

    const updatedMember = {
      ...data.staff[i],
      ...req.body,
    };

    data.staff[i] = updatedMember;
    await writeData(data);

    const { password, ...memberNoPass } = updatedMember;
    res.status(StatusCodes.OK).send(memberNoPass);
  }
);

staffController.delete("/me", async (req, res) => {
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
});


/**
 * @swagger
 * /staff/fire/{id}:
 *   delete:
 *     summary: Fire (delete) a staff member by ID
 *     description: Requires admin privileges.
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the staff member to remove
 *     responses:
 *       204:
 *         description: Staff member deleted successfully (no content)
 *       401:
 *         description: Unauthorized – missing or invalid JWT or not an admin
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
staffController.delete("/fire/:id", authMiddleware(true), async (req, res) => {
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
});
