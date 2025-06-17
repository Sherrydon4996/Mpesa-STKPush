import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import MpesaService from "./MpesaServices";
import styles from "./MpesaPayment.module.css";
import { setPaymentFailed, setPaymentSuccess } from "./stateSlice";

const MpesaPayment = ({
  totalAmount = 1,
  onPaymentSuccess = null,
  onPaymentError = null,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const mpesaService = useMemo(() => new MpesaService(), []);

  useEffect(() => {
    mpesaService.getToken();
  }, [mpesaService]);

  const handlePayment = async () => {
    // Clear previous notification and checkout ID
    setNotification({ message: "", type: "" });
    setCheckoutRequestId("");
    setLoading(true);

    try {
      const result = await mpesaService.initiateSTKPush(
        phoneNumber,
        totalAmount || 1
      );

      if (result.success) {
        setCheckoutRequestId(result.checkoutRequestId);
        setNotification({
          message:
            "Payment request sent successfully. Check your phone to complete the payment.",
          type: "info",
        });
      } else {
        setNotification({
          message:
            result.message || "Payment request failed. Please try again.",
          type: "error",
        });
        dispatch(
          setPaymentFailed({
            reason: result.message || "Unknown error",
            amount: totalAmount,
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
          })
        );
        onPaymentError && onPaymentError(result.message);
      }
    } catch (error) {
      setNotification({
        message: `Payment failed: ${error.message || "Unknown error"}`,
        type: "error",
      });
      dispatch(
        setPaymentFailed({
          reason: error.message || "Unknown error",
          amount: totalAmount,
          phoneNumber: phoneNumber,
          timestamp: new Date().toISOString(),
        })
      );
      onPaymentError && onPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Monitor payment status
  useEffect(() => {
    if (!checkoutRequestId) return;

    let attempts = 0;
    const maxAttempts = 6;

    const intervalId = setInterval(async () => {
      attempts += 1;

      try {
        const statusResult = await mpesaService.checkPayment(checkoutRequestId);

        if (statusResult.completed) {
          clearInterval(intervalId);

          if (statusResult.success) {
            setNotification({
              message: `Payment successful: ${statusResult.message}`,
              type: "success",
            });
            dispatch(
              setPaymentSuccess({
                transactionId: statusResult.transactionId,
                amount: totalAmount,
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString(),
                status: "success",
              })
            );
            onPaymentSuccess && onPaymentSuccess(statusResult.message);
          } else {
            setNotification({
              message: `Payment failed: ${statusResult.message}`,
              type: "error",
            });
            dispatch(
              setPaymentFailed({
                reason: statusResult.message,
                amount: totalAmount,
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString(),
              })
            );
            onPaymentError && onPaymentError(statusResult.message);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setNotification({
            message: "Payment status check timed out. Please try again.",
            type: "error",
          });
          dispatch(
            setPaymentFailed({
              reason: "Payment status check timed out",
              amount: totalAmount,
              phoneNumber: phoneNumber,
              timestamp: new Date().toISOString(),
            })
          );
          onPaymentError && onPaymentError("Payment status check timed out");
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setNotification({
            message: "Unable to verify payment status. Please contact support.",
            type: "error",
          });
          dispatch(
            setPaymentFailed({
              reason: "Unable to verify payment status",
              amount: totalAmount,
              phoneNumber: phoneNumber,
              timestamp: new Date().toISOString(),
            })
          );
          onPaymentError && onPaymentError("Unable to verify payment status");
        }
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [
    checkoutRequestId,
    dispatch,
    totalAmount,
    phoneNumber,
    onPaymentSuccess,
    onPaymentError,
    mpesaService,
  ]);

  const closeNotification = () => {
    setNotification({ message: "", type: "" });
  };

  return (
    <div className={styles.mpesaContainer}>
      <div className={styles.header}>
        <div className={styles.mpesaLogo}>
          <span className={styles.logoText}>M-PESA</span>
        </div>
        <h3 className={styles.title}>Pay with M-Pesa</h3>
      </div>

      <div className={styles.amountDisplay}>
        <span className={styles.amountLabel}>Amount to Pay:</span>
        <span className={styles.amountValue}>
          KSh {(totalAmount || 1).toLocaleString()}
        </span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber" className={styles.label}>
          Phone Number
        </label>
        <input
          type="number"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number (07XX)"
          className={styles.phoneInput}
          disabled={disabled || loading}
        />
      </div>

      {notification.message && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.notificationSuccess
              : notification.type === "error"
              ? styles.notificationError
              : styles.notificationInfo
          }`}
        >
          <span className={styles.notificationMessage}>
            {notification.message}
          </span>
          <button
            onClick={closeNotification}
            className={styles.closeNotification}
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={disabled || loading || !phoneNumber.trim()}
        className={`${styles.payButton} ${loading ? styles.loading : ""}`}
      >
        {loading ? (
          <>
            <span className={styles.spinner}></span>
            Processing...
          </>
        ) : (
          <>
            <span className={styles.mpesaIcon}>📱</span>
            Pay KSh {(totalAmount || 1).toLocaleString()}
          </>
        )}
      </button>

      <div className={styles.instructions}>
        <h4>How to complete your payment:</h4>
        <ol>
          <li>Enter your M-Pesa phone number above</li>
          <li>Click "Pay" to initiate the payment</li>
          <li>Check your phone for the M-Pesa prompt</li>
          <li>Enter your M-Pesa PIN to confirm</li>
          <li>Wait for confirmation</li>
        </ol>
      </div>
    </div>
  );
};

export default MpesaPayment;
