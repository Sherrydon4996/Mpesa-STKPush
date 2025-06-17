// Corrected version of InitiateMpesaController.js
const axios = require("axios");

const initiateSTKPush = async (req, res) => {
  try {
    const { amount, phoneNumber, accessToken } = req.body;

    // Create timestamp dynamically when function is called - USING EXACT FORMAT
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Fixed: use 'minutes' not 'minute'
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // Get credentials from env - MUST be correct
    const shortCode = process.env.SHORT_CODE;
    const passkey = process.env.PASSKEY;

    // Create password using the exact formula expected by M-Pesa
    // Format: Base64(Shortcode+Passkey+Timestamp)
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
      "base64"
    );

    // Format phone number correctly (this is critical)
    let formattedPhone = phoneNumber.toString().replace(/^254/, "");
    formattedPhone = formattedPhone.replace(/^0/, "");
    formattedPhone = `254${formattedPhone}`;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    console.log("Making STK push request with:");
    console.log("- Timestamp:", timestamp);
    console.log("- Shortcode:", shortCode);
    console.log("- Phone:", formattedPhone);
    console.log("- Amount:", Math.round(amount));
    console.log("- Callback URL:", process.env.CALLBACK_URL);

    // Make request to M-Pesa API
    const response = await axios.post(
      `${process.env.INITIATE_STKPUSH_URL}`,
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: shortCode,
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

module.exports = { initiateSTKPush };
// const axios = require("axios");

// const axios = require("axios");

// const initiateSTKPush = async (req, res) => {
//   try {
//     const { amount, phoneNumber, accessToken } = req.body;

//     // Create timestamp dynamically when function is called - USING EXACT FORMAT
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");
//     const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

//     // Get credentials from env - MUST be correct
//     const shortCode = "174379";
//     const passkey =
//       "bfb279f9aa9bdbcf15e97dd71a467cd2c2c66a15d15b58c5e5b9d6c152f3c3ab";

//     // Create password using the exact formula expected by M-Pesa
//     // Format: Base64(Shortcode+Passkey+Timestamp)
//     const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
//       "base64"
//     );

//     // Format phone number correctly (this is critical)
//     let formattedPhone = phoneNumber
//       .toString()
//       .replace(/^254/, "")
//       .replace(/^0/, "");
//     formattedPhone = `254${formattedPhone}`;

//     // Validate amount
//     if (!amount || isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }

//     // Make request to M-Pesa API
//     const response = await axios.post(
//       process.env.INITIATE_STKPUSH_URL,
//       {
//         BusinessShortCode: shortCode,
//         Password: password,
//         Timestamp: timestamp,
//         TransactionType: "CustomerPayBillOnline",
//         Amount: Math.round(amount),
//         PartyA: formattedPhone,
//         PartyB: shortCode,
//         PhoneNumber: formattedPhone,
//         CallBackURL: "https://webhook.site/",
//         AccountReference: "FoodDelivery",
//         TransactionDesc: "Food Order Payment",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.status(200).json({
//       success: true,
//       data: response.data,
//       message:
//         "Payment request sent successfully. Check your phone to complete the payment.",
//     });
//   } catch (error) {
//     // Handle and return M-Pesa error response details
//     if (error.response?.data) {
//       return res.status(500).json({
//         error: "Payment request failed, please try again",
//         details: error.response.data,
//       });
//     }

//     res.status(500).json({
//       error: "Payment request failed, please try again",
//       details: error.message || "Unknown error",
//     });
//   }
// };

// module.exports = { initiateSTKPush };
