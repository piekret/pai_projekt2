import express from "express";
import { connectDB } from "./config/database";
import { inmatesController } from "./inmates/controllers/inmates.controller";
import { staffController } from "./staff/controllers/staff.controller";
import bodyParser from "body-parser";
import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./swaggerOptions";

const app = express();

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(bodyParser.json());
app.use('/staff', staffController);
app.use('/inmates', inmatesController);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get("/", (req, res) => {
	console.log("Hello world");
	res.send("Hello world");
});

app.listen(3000, () => {
	console.log(`Server is running on port: 3000`);
});
