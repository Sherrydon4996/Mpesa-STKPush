const axios = require("axios");
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
// const auth2 = btoa(`${consumerKey}:${consumerSecret}`) only for browsers cannot be used in node js

const generateTokenRaw = async () => {
  const response = await axios.get(process.env.TOKEN_GENERATE_URL, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return response.data.access_token;
};

const generateToken = async (req, res) => {
  try {
    const access_token = await generateTokenRaw();
    // Return only the necessary data from the response
    res.status(200).json({
      accessToken: access_token,
    });
  } catch (error) {
    console.error(
      "Token generation error:",
      error.response ? error.response.data : error.message
    );

    res.status(500).json({
      error: "There was an error generating the token",
      details: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = { generateToken, generateTokenRaw };
