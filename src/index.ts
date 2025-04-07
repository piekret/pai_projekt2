import express from "express";
const app = express();

app.get("/", (request, response, next) => {
	console.log("Hello world");
	response.send("Hello world");
});

app.listen(3000, () => {
	console.log(`Server is running on port: 3000`);
});
