const express = require("express");
const morgan = require("morgan")("short");
const apiRoutes = require("./routes/api");

const app = express();

app.use(morgan);
app.use("/api/v1", apiRoutes);
app.use((req, res, next) => {
  res.status(404).json({ msg: "Resource not found" });
});
app.listen(process.env.PORT || 80);
