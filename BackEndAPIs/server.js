const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./Routes/tokenRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("API server is running");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// app.use((req, res) => {
//   res.status(400).send(`cannot ${req.method} ${req.url}`);
// });
