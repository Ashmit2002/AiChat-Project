const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
// Routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.route");

//server instance
const app = express();

//middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

//creating routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Catch-all handler for client-side routing (should be last)
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
module.exports = app;
