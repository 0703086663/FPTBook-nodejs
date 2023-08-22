const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

router.get("/setAdmin/:id", adminController.setAdmin);
router.get("/unlockAccount/:id", adminController.unlockAccount);
router.get("/lockAccount/:id", adminController.lockAccount);
router.get("/accountManagement", adminController.accountManagement);

router.get("/billManagement", adminController.billManagement);

router.get("/authorManagement", adminController.authorManagement);
router.post("/authorCreate", adminController.authorCreate);
router.post("/authorUpdate/:id", adminController.authorUpdate);
router.get("/authorDelete/:id", adminController.authorDelete);

router.get("/bookManagement", adminController.bookManagement);
router.post("/bookCreate", adminController.bookCreate);
router.post("/bookUpdate/:id", adminController.bookUpdate);
router.get("/bookDelete/:id", adminController.bookDelete);

router.get("/", adminController.index);

module.exports = router;
