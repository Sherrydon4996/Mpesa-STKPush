import axios from "axios";

class MpesaService {
  constructor() {
    this.token = "";
    this.baseURL = "http://localhost:5000/api";
  }

  // TOKEN GENERATION
  async getToken() {
    try {
      const response = await axios.get(`${this.baseURL}/token`);
      this.token = response.data.accessToken;
      return { success: true, token: this.token };
    } catch (error) {
      //   console.error("Error getting token:", error.message || error);
      return {
        success: false,
        message: `Failed to get token: ${error.message || "Unknown error"}`,
      };
    }
  }

  // STK PUSH REQUEST
  async initiateSTKPush(phoneNumber, amount) {
    if (!this.token) {
      const tokenResult = await this.getToken();
      if (!tokenResult.success) {
        return {
          success: false,
          message: "No access token available. Please wait or refresh.",
        };
      }
    }

    try {
      const response = await axios.post(`${this.baseURL}/stkPush`, {
        amount: amount,
        phoneNumber: phoneNumber,
        accessToken: this.token,
      });

      //   console.log("Payment response:", response);
      const checkoutRequestId = response?.data?.data?.CheckoutRequestID;

      return {
        success: true,
        checkoutRequestId: checkoutRequestId,
        message: "Payment request sent successfully",
      };
    } catch (error) {
      //   console.error(
      //     "Payment Error:",
      //     error.response?.data || error.message || error
      //   );
      return {
        success: false,
        message: `Payment failed: ${
          error.response?.data?.error || error.message || "Unknown error"
        }`,
      };
    }
  }

  // CHECK PAYMENT STATUS
  async checkPayment(checkoutRequestId) {
    if (!checkoutRequestId) return { completed: false, success: false };

    try {
      const response = await axios.post(`${this.baseURL}/check-payment`, {
        checkoutRequestID: checkoutRequestId,
      });

      const { result } = response.data;
      const resultDesc = result?.ResultDesc || "Unknown status";

      console.log("Payment status response:", response);

      // Categorize the payment status
      if (resultDesc.includes("successfully")) {
        return {
          completed: true,
          success: true,
          message: resultDesc,
          transactionId: result?.TransactionId || `mpesa_${Date.now()}`,
        };
      } else if (
        resultDesc.includes("cancelled") ||
        resultDesc.includes("timeout") ||
        resultDesc.includes("failed")
      ) {
        return {
          completed: true,
          success: false,
          message: resultDesc,
        };
      } else {
        return {
          completed: false,
          success: false,
          message: `Payment status: ${resultDesc}`,
        };
      }
    } catch (error) {
      //   console.error("Payment status check error:", error);
      return {
        completed: false,
        success: false,
        message: `Payment status check failed: ${
          error.response?.data?.details?.errorMessage ||
          error.message ||
          "Unknown error"
        }`,
      };
    }
  }
}

export default MpesaService;
