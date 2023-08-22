const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/book/:id", homeController.bookDetail);

router.get("/about", homeController.about);
router.get("/register", homeController.register);
router.post("/store", homeController.store);
router.get("/login", homeController.login);
router.post("/validate", homeController.validate);
router.get("/logout", homeController.logout);

router.get("/", homeController.index);

module.exports = router;
