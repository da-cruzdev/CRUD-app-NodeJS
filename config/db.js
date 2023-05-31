const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.BD_URI, () => {
      console.log("Connected to the database");
    });
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
