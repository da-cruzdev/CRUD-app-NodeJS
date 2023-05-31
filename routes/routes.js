const express = require("express");
const router = express.Router();
const {
  getHome,
  addUsers,
  upload,
  addUser,
  editUsers,
  updateUser,
  deleteUser,
  validateUser,
} = require("../controllers/user.controllers");

router.get("/", getHome);

router.get("/add", addUsers);

router.get("/edit/:id", editUsers);

router.post("/add", upload, validateUser, addUser);

router.post("/update/:id", upload, validateUser, updateUser);

router.get("/delete/:id", deleteUser);

module.exports = router;
