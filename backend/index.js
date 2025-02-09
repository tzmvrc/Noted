/** @format */

require("dotenv").config();
const express = require("express");
const dbConnect = require("./Utilities/dbConnect");
const cors = require("cors");

const userRoutes = require("./Routes/userRoutes");
const noteRoutes = require("./Routes/noteRoutes");

const app = express();

dbConnect();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.json({ data: "Hello from server" });
});

app.listen(8000);
