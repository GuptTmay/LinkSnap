import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';

import linksRouter from "./routers/links";
import authRouter from "./routers/auth";
import openRouter from "./routers/open";
import tagsRouter from "./routers/tags";
import analyticsRouter from "./routers/analytics";
import { API_PREFIX } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { originValidator } from "./middlewares/originValidator";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, // if you're using cookies
  })
);

// app.use(cookieParser()); // Parses incoming request header cookies into req.cookies
app.use(express.json()); // Parse incoming JSON requests 
app.use(express.urlencoded({ extended: true })); // Accept URL-encoded data from traditional HTML forms
app.use(originValidator); // Validate the origin of incoming requests to prevent CSRF attacks
app.set("trust proxy", true);

app.use("/", openRouter); // Open routes that don't require authentication or prefix
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/links`, linksRouter);
app.use(`${API_PREFIX}/tags`, tagsRouter);
app.use(`${API_PREFIX}/analytics`, analyticsRouter);

app.use(errorHandler); // Error handling middleware should be the last middleware in the stack

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + (process.env.PORT || 3000));
}); 
