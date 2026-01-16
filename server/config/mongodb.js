import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connection successful");
        });

        mongoose.connection.on("error", (error) => {
            console.log("MongoDB connection error:", error);
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;