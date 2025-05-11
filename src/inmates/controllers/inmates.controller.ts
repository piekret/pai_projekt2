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

    res.status(StatusCodes.OK).send(visit);
});

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

    res.status(StatusCodes.NO_CONTENT).send();
});