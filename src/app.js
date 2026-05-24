import dotenv from "dotenv"
dotenv.config()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_, // reads http://localhost:5173 from .env
    credentials: true, // REQUIRED for cookies/auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import passengerRouter from "./routes/passenger.routes.js"
import driverRouter from "./routes/driver.routes.js"
//routes declaration
app.use("/api/v1/users", userRouter); // when /api/v1/users, pass onto userRouter(its path is defined)
app.use("/api/v1/passenger", passengerRouter); //passenger endpoints
app.use("/api/v1/driver", driverRouter); //driver endpoints
export { app };
