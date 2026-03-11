import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js"
//user routes
import userRoutes from "./src/routes/User/userRoutes.js";
import driverRouter from "./src/routes/User/driverRoutes.js";

//admin routes
import adminRouts from "./src/routes/adminRoutes.js"


const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
//user api's
app.use('/api/user', userRoutes);
app.use("/api/driver", driverRouter);

//admin
app.use("/api/admin", adminRouts);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});