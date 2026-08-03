const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

const salesHandler = require("./api/sales");
app.get("/api/sales", (req, res) => salesHandler(req, res));

const statusHandler = require("./api/status");
app.get("/api/status", (req, res) => statusHandler(req, res));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
});
