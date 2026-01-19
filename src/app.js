require("dotenv").config();

console.log("URI :", process.env.MONGO_URI);

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/database");

const categoryRoutes = require("./routes/category.routes");
const nomineRoutes = require("./routes/nomine.routes");
const voteRoutes = require("./routes/vote.routes");
const settingRoutes = require("./routes/setting.routes");

const app = express();

connectDB();

app.use(cors({
  origin: "https://frontend-lkh.onrender.com", // ton domaine
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/contact", require("./routes/contact.routes"));

app.use("/api/categories", categoryRoutes);
app.use("/api/nomines", nomineRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/settings", settingRoutes);

app.get("/", (req, res) => {
  res.send("Backend LKH opérationnel 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

