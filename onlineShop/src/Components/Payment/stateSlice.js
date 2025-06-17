import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentSuccess: {
    status: "idle",
    transactionId: "",
    amount: "",
    phoneNumber: "",
    timestamp: "",
    success: false,
    error: null,
  },
  paymentFailed: {
    status: "idle",
    reason: "",
    amount: "",
    phoneNumber: "",
    timestamp: "",
    success: false,
    error: "",
  },
};

const mpesaSlice = createSlice({
  name: "mpesa",
  initialState,
  reducers: {
    setPaymentSuccess(state, action) {
      state.paymentSuccess = {
        status: "completed",
        transactionId: action.payload.transactionId,
        amount: action.payload.amount,
        phoneNumber: action.payload.phoneNumber,
        timestamp: action.payload.timestamp,
        success: true,
        error: null,
      };
      state.paymentFailed = initialState.paymentFailed; // Reset failed state
    },

    setPaymentFailed(state, action) {
      state.paymentFailed = {
        status: "failed",
        reason: action.payload.reason,
        amount: action.payload.amount,
        phoneNumber: action.payload.phoneNumber,
        timestamp: action.payload.timestamp,
        success: false,
        error: action.payload.reason,
      };
      state.paymentSuccess = initialState.paymentSuccess; // Reset success state
    },
  },
});

export const { setPaymentSuccess, setPaymentFailed } = mpesaSlice.actions;
export default mpesaSlice.reducer;
