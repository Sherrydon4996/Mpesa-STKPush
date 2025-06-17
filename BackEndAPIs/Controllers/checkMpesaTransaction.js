const axios = require("axios");
const { generateTokenRaw } = require("./tokenController");
const {
  generatePassword,
  generateTimestamp,
} = require("./InitiateMpesaController");

const checkMpesaTransaction = async (req, res) => {
  const { checkoutRequestID } = req.body;

  if (!checkoutRequestID) {
    return res.status(400).json({ error: "Missing CheckoutRequestID" });
  }

  try {
    const accessToken = await generateTokenRaw(); // your token generator
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    console.log("password", password);
    console.log("timstamp", timestamp);
    console.log("token", accessToken);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: process.env.SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

    if (result.ResultCode === "0") {
      res.status(200).json({ message: "Payment successful✅✅", result });
    } else {
      res.status(200).json({ message: "Payment failed❌❌", result });
    }
  } catch (error) {
    console.error(
      "Transaction check failed:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to check transaction status",
      details: error?.response?.data || error.message,
    });
  }
};

module.exports = { checkMpesaTransaction };
