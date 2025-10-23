const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const {
      email,
      fullName: { firstName, lastName },
      password,
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).send({
        message: "All fields are required",
        required: [
          "email",
          "fullName.firstName",
          "fullName.lastName",
          "password",
        ],
      });
    }

    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return res.status(400).send({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 8);

    const user = await userModel.create({
      fullName: {
        firstName,
        lastName,
      },
      email,
      password: hashPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    res.status(201).send({
      message: "User registered successfully",
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .send({ message: "Internal server error during registration" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({
      email,
    });
    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(200).send({
      message: "Login successful",
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal server error during login" });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).send({ message: "Logout Successful" });
}

async function getCurrentUser(req, res) {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");
    res.status(200).send({ user });
  } catch (error) {
    res.status(401).send({ message: "Unauthorized" });
  }
}

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
