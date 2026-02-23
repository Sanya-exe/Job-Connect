import express from "express";
import cors from "cors";
import user from "./routes/authRoutes.js";
import job from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/user', user);
app.use('/api/v1/job', job); 
app.use('/api/v1/application', applicationRoutes);



export default app;
