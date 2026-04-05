import type  { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.js";
import User from "./user.model.js";
import bcrypt from "bcryptjs";

/**
 * @desc    get user by Id
 * @route   GET /users/profile
 * @access  confirmed user
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    update user profile
 * @route   PUT /users/profile
 * @access  confirmed user
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.user!;
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const { name, email } = req.body as { name?: string; email?: string };
    if (name) user.name = name;
    if (email) user.email = email;

    if (req.file) {
      if (user.image) {
        const publicId = user.image.split("/").slice(-3).join("/").split(".")[0];
        if (!publicId) {
          // מטפלים במקרה שאין תמונה (למשל מחזירים שגיאה או פשוט מדלגים)
          return res.status(400).json({ message: "No image ID provided" });
      }
        await cloudinary.uploader.destroy(publicId!);
      }
      user.image = req.file.path;
    }

    await user.save({ validateBeforeSave: true });

    res.status(200).json({
      status: 200,
      message: "Update User Profile successfully",
      data: user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    change user password
 * @route   PUT /users/change-password
 * @access  confirmed user
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { oldPassword, newPassword } = req.body as {
      oldPassword: string;
      newPassword: string;
    };

    if (!oldPassword || !newPassword) {
      res.status(400).json({ status: 400, message: "Missing passwords" });
      return;
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      res.status(404).json({ status: 404, message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password!);
    if (!isMatch) {
      res.status(401).json({ status: 401, message: "Old password is incorrect" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Password updated successfully",
      data: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: 500,
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};

/**
 * @desc    update user address
 * @route   PUT /users/addresses/:addrId
 * @access  confirmed user
 */
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { addrId } = req.params;
    const { city, street, houseNumber, zip } = req.body as {
      city?: string;
      street?: string;
      houseNumber?: number;
      zip?: string;
    };

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
//יש קן איזה שהיא בעיה בלוגיקה
    const address = (user.addresses as any)._id(addrId);
    if (!address) throw new Error("Address not found");

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
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    add new user address
 * @route   POST /users/addresses
 * @access  confirmed user
 */
export const addUserAdress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { city, street, houseNumber, zip } = req.body as {
      city: string;
      street: string;
      houseNumber: number;
      zip: string;
    };

    const user = await User.findByIdAndUpdate(
      { _id: id },
      { $push: { addresses: { city, street, houseNumber, zip } } },
      { new: true, runValidators: true }
    );

    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "Address added successfully",
      data: user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    delete user address
 * @route   DELETE /users/addresses/:addrId
 * @access  confirmed user
 */
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!;
    const { addrId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ status: 404, message: "User not found", data: null });
      return;
    }
    //יש בעיה בליגיקה 
    const addressExists = (user.addresses as any).id(addrId);
    if (!addressExists) {
      res.status(404).json({ status: 404, message: "Address not found", data: null });
      return;
    }

    //בעיה - בלוגיקה
    (user.addresses as any).pull(addrId);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: 500,
      message: err.message || "Internal Server Error",
      data: null,
    });
  }
};

// ============================
// 👑 Admin routes
// ============================

/**
 * @desc    get all users
 * @route   GET /users/
 * @access  Admin
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 200,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: 500,
      message: err.message,
      data: null,
    });
  }
};

/**
 * @desc    update user role [ADMIN/CUSTOMER]
 * @route   PUT /users/role/:id
 * @access  Admin
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    user.role = "admin";
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      data: user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  }
};

/**
 * @desc    delete user by id
 * @route   DELETE /users/:id
 * @access  Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    await user.deleteOne();

    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message,
      data: null,
    });
  }
};