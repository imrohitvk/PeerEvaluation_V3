// import express from "express";
// import dotenv from "dotenv";
// import { connectDB } from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import cors from "cors";

// dotenv.config();

// const app = express();

// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);

// app.listen(PORT, () => {
//     connectDB();
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
// // This code sets up an Express server with MongoDB connection, environment variables, and routes for user authentication.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Uncomment when admin routes are implemented

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // Uncomment when admin routes are implemented

// Connect to DB and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();
