import express from "express";
import { StatusCodes } from "http-status-codes";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { readData, writeData } from "../../utils";
import { CreateInmateDTO, UpdateInmateDTO, type Inmate } from "../dto/inmate.dto";

export const inmatesController = express.Router();
let currId = 0;


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
        id: currId++,
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