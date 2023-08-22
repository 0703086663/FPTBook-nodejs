const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

router.get("/add-to-cart/:id", cartController.addToCart);
router.get("/remove-from-cart/:id", cartController.removeFromCart);
router.post("/checkout", cartController.checkout);

router.get("/", cartController.cart);

module.exports = router;
