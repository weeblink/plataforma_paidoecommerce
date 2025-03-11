import "./bootstrap"
import express, { ErrorRequestHandler } from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import routes from "./routes"
import AppError from "./errors/AppError";
import {logger} from "./utils/logger";
import "./database";

const app = express();

app.use(bodyParser.json({limit: '100mb'}));

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL
    })
)
app.use(express.json());
app.use( '/api', routes );
app.use(((err, req, res, next) => {
    if (err instanceof AppError) {
        logger.warn(err);
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    logger.error(err);
    res.status(500).json({ error: "ERR_INTERNAL_SERVER_ERROR" });
    return;
}) as ErrorRequestHandler);

export default app;
