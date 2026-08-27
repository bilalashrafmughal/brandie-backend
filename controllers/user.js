// User controller - handles business logic for user routes
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /api/users - get all users
const getUser = async (req, res) => {
  const users = await prisma.admin.findMany();
  res.status(200).json({
    status: "success",
    message: "Get all users",
    data: users,
  });
};

// POST /api/users - create a new user
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and password are required",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: { id: user.id, name: user.name, email: user.email },
  });
};

// POST /api/users/signin - sign in a user
const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  const user = await prisma.admin.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(200).json({
    status: "success",
    message: "Signed in successfully",
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    },
  });
};

module.exports = {
  getUser,
  createUser,
  signIn,
};
