const express = require("express");
const app = express();
const PORT = process.env.PORT || 8800;
const cors = require("cors");
require("dotenv").config();
const path = require('path');

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, "http://localhost:3000","https://tire-sale-frontend.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const connectDB = require("./config/database");
const companyRoutes = require('./routes/companyRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.get("/", (req, res) => {
  res.status(200).json({ message: "server started" });
});
app.use('/api/companies', companyRoutes);
app.use('/api/emails', emailRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server start http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });

  module.exports = app;