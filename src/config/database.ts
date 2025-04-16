import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
    try {
        await mongoose.connect(ENV.DATABASE.URI);
        console.log("DB connected");
    } catch (e) {
        console.error("DB error: ", e);
        process.exit(1);
    }
}