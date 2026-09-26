import cors from "cors";
import express from "express";
import {urlRouter} from "./routes/url-routes.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(urlRouter);
