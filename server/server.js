import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//API Endpoints
app.get("/", (req, res) => res.send("Welcome to the Authentication Server!"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/2fa", twoFactorRoutes);

//Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log(`📄 API Documentation available at http://localhost:4000/api-docs`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
