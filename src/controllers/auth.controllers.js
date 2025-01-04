import User from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadImageToCloudinary = async (localPath) => {
  try {
      const result = await cloudinary.uploader.upload(localPath, {
          resource_type: "auto",
      });
      fs.unlinkSync(localPath);
      return result.url;
  } catch (err) {
      return fs.unlinkSync(localPath);
  };
};


const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({
      message: "no image file uploaded",
  });
  
  try {
      const uploadResult = await uploadImageToCloudinary(req.file.path);
      if (!uploadResult) return res.status(500).json({
          message: "error occured while uploading image"
      });

      res.json({
          message: "image uploaded successfully",
          url: uploadResult,
      });
  }
  catch (error) {
      console.log(error);
      res.status(500).json({ message: "error occured while uploading image" });
  }
}



const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
  expiresIn: "6h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};



const registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });
  const user = await User.findOne({ email: email });
  if (user) return res.status(401).json({ message: "user already exist" });
  const createUser = await User.create({
    email,
    password,
  });
  res.json({ message: "user registered successfully", data: createUser });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "no user found" });
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "incorrect password" });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie("refreshToken", refreshToken, { http: true, secure: false });
  res.json({
    message: "user loggedIn successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};



const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "user logout successfully" });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  const user = await User.findOne({ email: decodedToken.email });
  if (!user) return res.status(404).json({ message: "invalid token" });
  const generateToken = generateAccessToken(user);
  res.json({ message: "access token generated", accesstoken: generateToken });
  res.json({ decodedToken });
};


export {registerUser , loginUser , logoutUser , refreshToken , uploadImage}



// import User from "../models/auth.models.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

// // Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Function to upload image to Cloudinary
// const uploadImageToCloudinary = async (localPath) => {
//   try {
//     const result = await cloudinary.uploader.upload(localPath, {
//       resource_type: "auto",
//     });
//     await fs.promises.unlink(localPath); // Remove local file
//     return result.url;
//   } catch (err) {
//     await fs.promises.unlink(localPath); // Remove file in case of error
//     throw new Error("Failed to upload image");
//   }
// };

// // Generate Access Token
// const generateAccessToken = (user) => {
//   return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
//     expiresIn: "6h",
//   });
// };

// // Generate Refresh Token
// const generateRefreshToken = (user) => {
//   return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

// // Register User
// const registerUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input fields
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   if (!password) return res.status(400).json({ message: "Password is required" });
//   if (!req.file) return res.status(400).json({ message: "Image file is required" });

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(409).json({ message: "User already exists" });

//     // Upload image to Cloudinary
//     const profileImageUrl = await uploadImageToCloudinary(req.file.path);

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = await User.create({
//       email,
//       password: hashedPassword,
//       profileImage: profileImageUrl, // Save profile image URL
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       data: newUser,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error occurred during registration" });
//   }
// };

// // Login User
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input fields
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   if (!password) return res.status(400).json({ message: "Password is required" });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid)
//       return res.status(401).json({ message: "Incorrect password" });

//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.json({
//       message: "User logged in successfully",
//       accessToken,
//       refreshToken,
//       data: user,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error occurred during login" });
//   }
// };

// // Logout User
// const logoutUser = async (req, res) => {
//   res.clearCookie("refreshToken");
//   res.json({ message: "User logged out successfully" });
// };

// // Refresh Token
// const refreshToken = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

//   if (!refreshToken)
//     return res.status(401).json({ message: "No refresh token found!" });

//   try {
//     const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
//     const user = await User.findOne({ email: decodedToken.email });

//     if (!user) return res.status(404).json({ message: "Invalid token" });

//     const newAccessToken = generateAccessToken(user);

//     res.json({
//       message: "Access token generated successfully",
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(403).json({ message: "Invalid refresh token" });
//   }
// };

// export { registerUser, loginUser, logoutUser, refreshToken };
