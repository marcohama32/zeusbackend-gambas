const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
var cors = require("cors");
const cookieParser = require("cookie-parser");
const {errorHandler, notFound} = require('./middleware/error');

// Import Socket.IO library
const http = require("http");

app.use(express.json());
app.use(cors());
//import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobTypeRoutes = require("./routes/jobsTypeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const planRoutes = require("./routes/planRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const companyRoutes = require("./routes/companyRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const ctransationRoutes = require("./routes/customertransactionRoutes");
const chatMessage = require("./routes/chatMessageRoutes");
const FilesTemplate = require("./routes/filesTemplateRoutes")
const ussd = require("./routes/ussdRoutes")

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());

// Set the strictQuery option to false
mongoose.set('strictQuery', false);

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
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
  })
);
app.use('/uploads',express.static('uploads'))
app.use(cookieParser())
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Import SSE router and use it
const sseRoutes = require("./routes/sseRoutes");
app.use("/api", sseRoutes.router);

//require socketHandler after create http server
require("./middleware/socketHandler")(server);

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
app.use("/api", chatMessage)
app.use("/api", FilesTemplate)
app.use("/api", ussd)

//error middleware
app.use(notFound)
app.use(errorHandler)


// Place the middleware here
app.use((req, res, next) => {
  console.log("Received headers:", req.headers);
  next();
});
// Port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
