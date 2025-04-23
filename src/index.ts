import express from "express";
import { connectDB } from "./config/database";
import { inmatesController } from "./inmates/controllers/inmates.controller";
import { staffController } from "./staff/controllers/staff.controller";
import bodyParser from "body-parser";

connectDB();

const app = express();

app.use(bodyParser.json());
app.use('/staff', staffController);
app.use('/inmates', inmatesController);

app.get("/", (request, response, next) => {
	console.log("Hello world");
	response.send("Hello world");
});

app.listen(3000, () => {
	console.log(`Server is running on port: 3000`);
});
