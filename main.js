const dotenv = require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const flash = require("express-flash");

const app = express();

connectDB();

const PORT = process.env.PORT || 4000;
const hostname = process.env.HOSTNAME;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);
app.use(flash());

app.use(express.static("uploads"));

app.set("view engine", "ejs", { async: true });

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use("/", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Server is listenning at http://${hostname}:${PORT}`);
});
