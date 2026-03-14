import express from "express";
import connectDB from "./sec/config/db.js";
import "dotenv/config"; 
import router from './sec/features/users/user.router.js'
import AuthRoutes from './sec/features/auth/auth.router.js'// טוען משתני סביבה
import rateLimit from 'express-rate-limit'
import cartRoutes from "./sec/features/Cart/cart.routes.js";
import routerProduct from "./sec/features/products/products.router.js";

const app = express();

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 15 דקות
  limit:100,// מקסימום 100 בקשות
  standardHeaders:true,
  legacyHeaders:false,
  message:"יותר מידי בקשות חקה 15 דקות"

});
// we add this when using rate limit behind proxy
app.set("trust proxy", 1)
app.use(limiter);

app.use("/api/v1/users", router);
app.use("/api/v1/AuthRoutes", AuthRoutes);
app.use("/api/v1/cart",cartRoutes)
app.use("/api/v1/routerProduct",routerProduct)

app.use((_, res) => {
  console.log("404 - Not Found");
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    console.log("DB connected");

    app.listen(PORT, () => 
      console.log(`Server running on port ${PORT}`)
    );

  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();