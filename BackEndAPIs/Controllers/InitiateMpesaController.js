const axios = require("axios");

const businessShortCode = process.env.SHORT_CODE;
const passkey = process.env.PASSKEY;
//generate timestamp with a function to make it re-usable
const generateTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const generatePassword = (timestamp) => {
  return Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString(
    "base64"
  );
};

//SEND REQUEST FUNCTION
const initiateSTKPush = async (req, res) => {
  try {
    const { amount, phoneNumber, accessToken } = req.body;

    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    let formattedPhone = phoneNumber.toString().replace(/^254/, "");
    formattedPhone = formattedPhone.replace(/^0/, "");
    formattedPhone = `254${formattedPhone}`;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Make request to M-Pesa API
    const response = await axios.post(
      process.env.INITIATE_STKPUSH_URL,
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "FoodDelivery",
        TransactionDesc: "Food Order Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STK Push Success Response:", response.data);

    res.status(200).json({
      success: true,
      data: response.data,
      message:
        "Payment request sent successfully. Check your phone to complete the payment.",
      timeStamp: timestamp,
    });
  } catch (error) {
    console.error("==== STK PUSH ERROR DETAILS ====");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    // If we have specific M-Pesa error info, return it to the client
    if (error.response?.data) {
      return res.status(500).json({
        error: "Payment request failed, please try again",
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: "Payment request failed, please try again",
      details: error.message || "Unknown error",
    });
  }
};

module.exports = { initiateSTKPush, generateTimestamp, generatePassword };
