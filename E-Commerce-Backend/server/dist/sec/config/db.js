import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    }
    catch (err) {
        if (err instanceof Error) {
            // עכשיו TS יודע שזה Error ויש לו message
            console.error(err.message);
        }
        else {
            // למקרה שנזרק משהו שהוא לא אובייקט שגיאה (נדיר אבל קורה)
            console.error("An unknown error occurred", err);
        }
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map