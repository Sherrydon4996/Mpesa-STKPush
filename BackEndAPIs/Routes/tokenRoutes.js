const express = require("express");

const router = express.Router();

const { generateToken } = require("../Controllers/tokenController");
const { initiateSTKPush } = require("../Controllers/InitiateMpesaController");
const {
  checkMpesaTransaction,
} = require("../Controllers/checkMpesaTransaction");

router.get("/token", generateToken);
router.post("/stkPush", initiateSTKPush);
router.post("/check-payment", checkMpesaTransaction);

module.exports = router;
