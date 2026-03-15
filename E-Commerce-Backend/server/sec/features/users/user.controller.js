// user.service.js
import cloudinary from "../../config/cloudinary.js";
import User from "./user.model.js";
import bcrypt from "bcryptjs";


// ============================
// 👤 Regular users
// ============================

export const getUserById = async (req,res) => {
  try{
    const id = req.user.userId;
        const user = await User.findById(id)
    if (!user) throw new Error("User not found");
    res.status(200).json({
      status: 200,
      message: "User fetched successfully",
      data: user
  })
  }catch(error){
    console.log("User not found")
    console.log(error);
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null
  })
  }
};

export const updateUserProfile = async (req,res) => {
try {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  // עדכון שדות פרופיל (למשל שם ואימייל)
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;

  if (req.file) {
    // delete old image from Cloudinary if one exists
    if (user.image) {
      const publicId = user.image.split('/').slice(-2).join('/').split('.')[0]; // extracts "ecommerce/avatars/filename"
      await cloudinary.uploader.destroy(publicId);
    }

    user.image = req.file.path;
  }

  await user.save({ validateBeforeSave: true });
  res.status(200).json({
    status: 200,
    message: " update User Profile successfully",
    data: user
})
} catch (error) {
  console.log(error);
  res.status(400).json({
    status: 400,
    message: error.message || error,
    data: null
})
}
};

export const changePassword = async (req, res) => {
  try {
    const {userId} = req.user;
    // 1. חילוץ הסיסמאות מגוף הבקשה
    const { oldPassword, newPassword } = req.body;

    // בדיקה בסיסית שהערכים נשלחו
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: 400, message: "Missing passwords" });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // 2. השוואת הסיסמה הישנה
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: "Old password is incorrect" });
    }

    // 3. עדכון הסיסמה (ה-Hashing יקרה ב-pre-save כפי שציינת)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // 4. החזרת תשובה תקינה
    res.status(200).json({
      status: 200,
      message: "Password updated successfully",
      data: null
    });

  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};

// ============================
// 🏠 Addresses
// ============================

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addrId } = req.params;
    const { city, street, houseNumber, zip } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const address = user.addresses.id(addrId); //find subdoc by id
    if (!address) throw new Error("Address not found");

    //only update fields that were provided
    if (city) address.city = city;
    if (street) address.street = street;
    if (houseNumber) address.houseNumber = houseNumber;
    if (zip) address.zip = zip;

    await user.save({ validateBeforeSave: true });

    res.status(200).json({
      status: 200,
      message: "Address updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null,
    });
  }
};
 
export const addUserAdress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { city, street, houseNumber, zip } = req.body;

    const user = await User.findByIdAndUpdate(
      {_id: userId},
      {
        $push: {         //push adds to the addresses array
          addresses: { city, street, houseNumber, zip }
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "Address added successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message || error,
      data: null,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. חילוץ ה-ID מהפרמטרים (שים לב לשם addrId כמו בראוטר)
    const { addrId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    // 2. בדיקה אם הכתובת קיימת לפני שמנסים למחוק
    const addressExists = user.addresses.id(addrId);
    if (!addressExists) {
      return res.status(404).json({
        status: 404,
        message: "Address not found",
        data: null,
      });
    }

    // 3. שימוש ב-pull כדי להסיר את הכתובת הספציפית מהמערך
    user.addresses.pull(addrId);
    
    // 4. שמירת השינויים במסד הנתונים
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Address deleted successfully",
      data: user.addresses, // מחזירים את רשימת הכתובות המעודכנת
    });

  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};

// ============================
// 👑 Admin routes
// ============================

// קבלת כל המשתמשים
export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");         
    return res.status(200).json({
      status: 200,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};

// שינוי תפקיד משתמש
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    user.role = "admin";
    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
    });
  }
};

// מחיקת משתמש
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.deleteOne();

    return res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
    });
  }
};