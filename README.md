# 💰 M-Pesa STK Push Integration (Safaricom Daraja API)

This project implements M-Pesa STK Push functionality using Safaricom's [Daraja API](https://developer.safaricom.co.ke/daraja/apis/post/safaricom.safaricom). It allows users to initiate real-time mobile payments directly from your web or mobile application via a seamless experience.

---

## ⚙️ Features

- 🔐 Secure authentication using consumer key and secret
- 📱 STK Push trigger for payment requests
- ✅ Transaction response handling (success/failure)
- 🛠️ Easy integration into any frontend (React, Vue, etc.)
- 🌍 Built with Node.js and Express

---

## 📦 Technologies Used

- Node.js
- Express.js
- Axios
- dotenv
- Safaricom Daraja API (v1)

---

## 🚀 How It Works

1. The user initiates a payment via your frontend (e.g., clicks a “Pay with M-Pesa” button).
2. A request is sent to the backend with their phone number and amount.
3. The backend generates a timestamp, encodes the password, and gets an access token.
4. The backend triggers the STK Push request to the Safaricom API.
5. The user receives a payment prompt on their phone.
6. Payment result is logged and optionally handled via callback.

---

## 🧪 Sample Request (Frontend)

```js
await fetch("http://localhost:5000/api/stkpush", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    phone: "254712345678",
    amount: 100
  })
});
