const express = require("express");
const router = express.Router();

const homeController = require("../controllers/HomeController");

router.post("/profile/update/:id", homeController.updateUser);
router.get("/profile", homeController.profile);

router.get("/book/:id", homeController.bookDetail);

router.get("/about", homeController.about);
router.get("/register", homeController.register);
router.post("/store", homeController.store);
router.get("/login", homeController.login);
router.post("/validate", homeController.validate);

router.get("/add-to-cart/:id", homeController.addToCart);
router.get("/cart", homeController.cart);
router.get("/remove-from-cart/:id", homeController.removeFromCart);

router.post("/checkout", homeController.checkout);

router.get("/", homeController.index);

module.exports = router;
