import User from "./user.model.js";
import bcrypt from "bcryptjs";

// Users
export const getUserById = async (id) => {
  return User.findById(id).select("-password");
};

export const updateUserProfile = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
};

export const changePassword = async (id, { currentPassword, newPassword }) => {
  const user = await User.findById(id).select("+password");
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");
  user.password = newPassword;
  await user.save();
};

// Addresses
export const addAddress = async (userId, address) => {
  const user = await User.findById(userId);
  user.addresses.push(address);
  await user.save();
  return user.addresses;
};

export const updateAddress = async (userId, addressId, data) => {
  const user = await User.findById(userId);
  const index = user.addresses.findIndex(addr => addr._id.toString() === addressId);
  if (index === -1) throw new Error("Address not found");
  user.addresses[index] = { ...user.addresses[index]._doc, ...data };
  await user.save();
  return user.addresses;
};

export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
  await user.save();
  return user.addresses;
};

// Admin
export const getAllUsers = async () => {
  return User.find().select("-password").lean();
};

export const updateUserRole = async (id, role) => {
  return User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};