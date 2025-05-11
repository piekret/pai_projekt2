import express from "express";
import { StatusCodes } from "http-status-codes";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { readData, writeData } from "../../utils";
import { CreateInmateDTO, UpdateInmateDTO, type Inmate } from "../dto/inmate.dto";
import { CreateVisitDTO, UpdateVisitDTO, type Visit } from "../dto/visits.dto";

export const inmatesController = express.Router();

let lastId = 0;

const getUniqueId = () => {
    const now = Date.now();
    if (now <= lastId) {
        lastId += 1;
    } else {
        lastId = now;
    }
    return lastId;
};

inmatesController.get('/', async (req, res) => {
    const data = await readData();
    res.status(StatusCodes.OK).send(data.inmates);
});

inmatesController.get('/:id', async (req, res) => {
    const data = await readData();
    const inmate = (data.inmates).find((i: Inmate) => i.id === parseInt(req.params.id));

    if (!inmate) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
    }

    res.status(StatusCodes.OK).send(inmate);
});


inmatesController.post('/', validationMiddleware(CreateInmateDTO), async (req, res) => {
    const data = await readData();
    const body = req.body;

    const newInmate: Inmate = {
        id: getUniqueId(),
        ...body,
    };

    data.inmates.push(newInmate);
    await writeData(data);

    res.status(StatusCodes.CREATED).send({newInmate});
})


inmatesController.put('/:id', validationMiddleware(UpdateInmateDTO), async (req, res) => {
    const data = await readData();
    const i = data.inmates.findIndex((i: Inmate) => i.id === parseInt(req.params.id));

    if (i === -1) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
    }

    const updatedInmate = {
        ...data.inmates[i],
        ...req.body,
    };

    data.inmates[i] = updatedInmate;
    await writeData(data);

    res.status(StatusCodes.OK).send(updatedInmate);
});

inmatesController.delete('/:id', async (req, res) => {
    const data = await readData();
    const i = data.inmates.findIndex((i: Inmate) => i.id === parseInt(req.params.id));

    if (i === -1) {
        res.status(StatusCodes.NOT_FOUND).send();
        return;
    }

    data.inmates.splice(i, 1);
    await writeData(data);

    res.status(StatusCodes.NO_CONTENT).send();
});

// Część Tomasza Zająca

inmatesController.use(authMiddleware(true));

/**
 * @swagger
 * /inmates/{id}/visits:
 *   get:
 *     summary: Wszystkie wizyty więźnia
 *     tags: [Inmates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID więźnia
 *     responses:
 *       200:
 *         description: Lista wizyt
 *         content:
 *           application/json:
 *             example:
 *               - id: 101
 *                 visitDate: "2025-05-10"
 *                 visitorName: "Anna Manna"
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono więźnia o podanym ID
 *         content:
 *           application/json:
 *             example:
 *               Nie znaleziono więźnia o podanym ID

 */

inmatesController.get('/:id/visits', async (req, res) => {
    const data = await readData();
    const inmateIndex = data.inmates.findIndex((i: Inmate) => i.id === Number.parseInt(req.params.id));

    if (inmateIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono więźnia o podanym ID");
        return;
    }

    const visits = data.inmates[inmateIndex].visits;

    res.status(StatusCodes.OK).send(visits);
})

/**
 * @swagger
 * /inmates/{id}/visits:
 *   post:
 *     summary: Dodaj wizytę do więźnia
 *     tags: [Inmates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID więźnia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVisitDTO'
 *           example:
 *              visitDate: "2025-05-11"
 *              visitorName: "Kamil Ślimak"
 *     responses:
 *       201:
 *         description: Wizyta dodana
 *         content:
 *           application/json:
 *             example:
 *               id: 102
 *               visitDate: "2025-05-11"
 *               visitorName: "Kamil Ślimak"
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono więźnia lub wizyty o podanym ID 
 *         content:
 *           application/json:
 *             example:
 *               Nie znaleziono więźnia o podanym ID

 */


inmatesController.post('/:id/visits', validationMiddleware(CreateVisitDTO), async (req, res) => {
    const data = await readData();
    const inmateIndex = data.inmates.findIndex((i: Inmate) => i.id === Number.parseInt(req.params.id));

    if (inmateIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono więźnia o podanym ID");
        return;
    }

    const newVisit = {
        id: getUniqueId(),
        ...req.body
    };

    if (!data.inmates[inmateIndex].visits) {
        data.inmates[inmateIndex].visits = [];
    }

    data.inmates[inmateIndex].visits.push(newVisit);
    await writeData(data);

    res.status(StatusCodes.CREATED).send(newVisit);
});

/**
 * @swagger
 * /inmates/{inmateId}/visits/{visitId}:
 *   get:
 *     summary: Wyświetl specyficzną wizytę więźnia
 *     tags: [Inmates]
 *     parameters:
 *       - in: path
 *         name: inmateId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wizyta znaleziona
 *         content:
 *           application/json:
 *             example:
 *               id: 103
 *               visitDate: "2025-05-12"
 *               visitorName: "Piotr Pidżama"
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono więźnia lub wizyty o podanym ID
 *         content:
 *           application/json:
 *             example:
 *               Nie znaleziono więźnia o podanym ID

 */

inmatesController.get('/:inmateId/visits/:visitId', async (req, res) => {
    const data = await readData();
    
    const inmate = data.inmates.find((i: Inmate) => i.id === Number.parseInt(req.params.inmateId));

    if (!inmate) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono więźnia o podanym ID");
        return;
    }

    if (!inmate.visits || !Array.isArray(inmate.visits)) {
        res.status(StatusCodes.NOT_FOUND).send("Brak wizyt dla tego więźnia");
        return;
    }

    const visit = inmate.visits.find((v: Visit) => v.id === Number.parseInt(req.params.visitId));

    if (!visit) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono wizyty o podanym ID");
        return;
    }

    res.
    status(StatusCodes.OK).send(visit);
});

/**
 * @swagger
 * /inmates/{inmateId}/visits/{visitId}:
 *   put:
 *     summary: Zaaktualizuj wizytę więźnia
 *     tags: [Inmates]
 *     parameters:
 *       - in: path
 *         name: inmateId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVisitDTO'
 *           example:
 *             date: "2025-05-13"
 *             visitorName: "John Doe"
 *     responses:
 *       200:
 *         description: Wizyta zaktualizowana
 *         content:
 *           application/json:
 *             example:
 *               id: 103
 *               date: "2025-05-13"
 *               visitorName: "John Doe"
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono więźnia lub wizyty o podanym ID
 *         content:
 *           application/json:
 *             example:
 *               Nie znaleziono więźnia o podanym ID

 */

inmatesController.put('/:inmateId/visits/:visitId', validationMiddleware(UpdateVisitDTO), async (req, res) => {
    const data = await readData();

    const inmateId = parseInt(req.params.inmateId);
    if (isNaN(inmateId)) {
        res.status(StatusCodes.BAD_REQUEST).send("Nieprawidłowe ID więźnia");
        return;
    }

    const inmateIndex = data.inmates.findIndex((i: Inmate) => i.id === inmateId);

    if (inmateIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono więźnia o podanym ID");
        return;
    }

    if (!data.inmates[inmateIndex].visits || !Array.isArray(data.inmates[inmateIndex].visits)) {
        res.status(StatusCodes.NOT_FOUND).send("Brak wizyt dla tego więźnia");
        return;
    }

    const visitId = parseInt(req.params.visitId);
    if (isNaN(visitId)) {
        res.status(StatusCodes.BAD_REQUEST).send("Nieprawidłowe ID wizyty");
        return;
    }

    const visitIndex = data.inmates[inmateIndex].visits.findIndex((v: Visit) => v.id === visitId);

    if (visitIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send(`Nie znaleziono wizyty o podanym ID dla więźnia o ID ${req.params.inmateId}`);
        return;
    }

    const updatedVisit = {
        ...data.inmates[inmateIndex].visits[visitIndex],
        ...req.body,
        id: data.inmates[inmateIndex].visits[visitIndex].id 
    };

    data.inmates[inmateIndex].visits[visitIndex] = updatedVisit;
    await writeData(data);

    res.status(StatusCodes.OK).send(updatedVisit);
});

/**
 * @swagger
 * /inmates/{inmateId}/visits/{visitId}:
 *   delete:
 *     summary: Usuń wizytę więźnia
 *     tags: [Inmates]
 *     parameters:
 *       - in: path
 *         name: inmateId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Wizyta usunięta
 *         content:
 *           application/json:
 *             example:
 *               Usunięto wizytę
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono więźnia lub wizyty o podanym ID
 *         content:
 *           application/json:
 *             example:
 *               Nie znaleziono więźnia o podanym ID
 */

inmatesController.delete('/:inmateId/visits/:visitId', async (req, res) => {
    const data = await readData();
    const inmateIndex = data.inmates.findIndex((i: Inmate) => i.id === parseInt(req.params.inmateId));

    if (inmateIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send("Nie znaleziono więźnia o podanym ID");
        return;
    }

    const visitIndex = data.inmates[inmateIndex].visits.findIndex((v: Visit) => v.id === Number.parseInt(req.params.visitId));

    if (visitIndex === -1) {
        res.status(StatusCodes.NOT_FOUND).send(`Nie znaleziono wizyty o podanym ID dla więźnia o ID ${req.params.inmateId}`);
        return;
    }

    data.inmates[inmateIndex].visits.splice(visitIndex, 1);
    await writeData(data);

    res.status(StatusCodes.NO_CONTENT).send("Usunięto wizytę");
});