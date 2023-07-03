const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
var cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require('./middleware/error');

//import routes
const  authRoutes  = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes")
const jobTypeRoutes = require("./routes/jobsTypeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const planRoutes = require("./routes/planRoutes");
const serviceRoutes = require("./routes/serviceRoutes")
const companyRoutes = require("./routes/companyRoutes")
const partnerRoutes = require("./routes/partnerRoutes")
const ctransationRoutes = require("./routes/customertransactionRoutes")

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

// Database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5m" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
  })
);
app.use(cookieParser())
app.use(cors());

//Routes middleware
app.use("/api", authRoutes);

//routes
app.use("/api", userRoutes);
app.use("/api", jobTypeRoutes);
app.use("/api", jobRoutes);
app.use("/api", planRoutes)
app.use("/api", serviceRoutes)
app.use("/api", companyRoutes)
app.use("/api", partnerRoutes)
app.use("/api", ctransationRoutes)

//error middleware
app.use(errorHandler)

// Port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
