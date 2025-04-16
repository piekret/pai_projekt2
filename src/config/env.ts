import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    PORT: process.env.PORT ?? 3000,
    DATABASE: {
        URI: process.env.DB_URI ?? ''
    }
};