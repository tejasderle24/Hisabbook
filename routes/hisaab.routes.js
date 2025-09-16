const express = require("express");
const router = express.Router();
const {
  getAllHisaab,
  renderCreateForm,
  createHisaab,
  renderEditForm,
  updateHisaab,
  deleteHisaab
} = require("../controllers/hisaab.controller");

// GET all hisaab records
router.get("/", getAllHisaab);

// GET create form
router.get("/create", renderCreateForm);

// POST create new hisaab
router.post("/createHisab", createHisaab);

// GET edit form
router.get("/edit/:filename", renderEditForm);

// POST update hisaab
router.post("/update/:filename", updateHisaab);

// GET delete hisaab
router.get("/delete/:filename", deleteHisaab);

module.exports = router;