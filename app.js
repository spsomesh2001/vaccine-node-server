const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profiles");
const adminRoutes = require("./routes/admins");

mongoose
  .connect(
    "mongodb+srv://testuser001:" +
      process.env.MONGO_ATLAS_PW +
      "@userdb.pyt4w.mongodb.net/UserDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => console.log("Connected to UserDB...."))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);

const app = express();

const whitelist = ["http://localhost:3000", "http://localhost:8080", "https://vaccine-react-app.herokuapp.com", "https://vaccine-node-server.herokuapp.com"]
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(morgan("dev"));
app.use(cors(corsOptions))
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//Handle requests to node app
app.use("/user", userRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res, next) => {
  res.status(200).send({ message: "Server working" });
});

app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
