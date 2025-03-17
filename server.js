const express = require("express");
const app = express();

const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");

const cors = require("cors");

const PORT = process.env.PORT || 5500;

connectDb();

app.use(express.json());
app.use(cors("https://final-project-frontend-gamma.vercel.app"));
// app.options("/login", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.send();
// });
app.use(express.static("public"));

app.use("/", require("./routes/user"));
app.use("/recipe", require("./routes/recipe"));

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
