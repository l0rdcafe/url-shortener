const express = require("express");
const morgan = require("morgan")("short");
const apiRoutes = require("./routes/api");

const app = express();

app.use(morgan);
app.use("/api/v1", apiRoutes);
app.listen(process.env.PORT || 80);
