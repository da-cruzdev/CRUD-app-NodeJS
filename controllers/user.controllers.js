const usersModel = require("../models/users.model");
const multer = require("multer");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
}).single("image");

const validateUserData = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name can not be up to 50 caracters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .matches(/^\S+$/)
    .withMessage("Email can not contain spaces")
    .matches(/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/)
    .withMessage("Email is invalid"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\S+$/)
    .withMessage("Phone can not contain spaces")
    .isMobilePhone()
    .withMessage("Phone number must be valid"),
  body("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image is required");
    }
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const extension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error("Image format is not supported");
    }
    return true;
  }),
];

module.exports = {
  getHome: (req, res) => {
    usersModel.find().exec((err, users) => {
      if (err) {
        res.status(400).json({ message: err.message });
      } else {
        res.render("index", { title: "Home Page", users: users });
      }
    });
  },

  addUsers: (req, res) => {
    res.render("add_users", { title: "Add users" });
  },

  addUser: async (req, res) => {
    const formData = req.flash("formData")[0];
    console.log(formData);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("formData", req.body);
      return res.render("add_users", {
        title: "Add users",
        errors: errors.array(),
        formData: formData || req.body,
      });
    }
    console.log(errors);
    const user = await usersModel.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: Date.now() + "_" + req.file.filename,
    });
    user.save((err) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "User added successfully!",
        };
        res.redirect("/");
      }
    });
  },

  editUsers: (req, res) => {
    const id = req.params.id;
    usersModel.findById(id, (err, user) => {
      if (err) {
        res.redirect("/");
      } else {
        if (user == null) {
          res.redirect("/");
        } else {
          res.render("edit_user", { title: "Edit User", user: user });
        }
      }
    });
  },

  updateUser: async (req, res) => {
    const id = await req.params.id;
    let newImage = "";

    if (req.file) {
      newImage = await req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (error) {
        console.log(error);
      }
    } else {
      newImage = await req.body.old_image;
    }

    const formData = req.flash("formData")[0];
    console.log(formData);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("formData", req.body);
      return res.render("edit_user", {
        title: "Edit user",
        errors: errors.array(),
        formData: formData || req.body,
      });
    }

    usersModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
      },
      (err, result) => {
        if (err) {
          res.json({ message: err.message, type: "danger" });
        } else {
          req.session.message = {
            type: "success",
            message: "User updated successfully",
          };
        }
        res.redirect("/");
      }
    );
  },

  deleteUser: async (req, res) => {
    const id = req.params.id;
    usersModel.findByIdAndRemove(id, (err, result) => {
      if (result.image != "") {
        const imagePath = "./uploads/" + result.image;
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.log(error);
        }
      }

      if (err) {
        res.json({ message: err.message });
      } else {
        req.session.message = {
          type: "info",
          message: "User deleted successfully",
        };
        res.redirect("/");
      }
    });
  },

  upload: upload,
  validateUser: validateUserData,
};
