package com.orcamoney.app.plugins.GooglePay;

import android.app.Activity;
import android.content.Intent;

import androidx.activity.result.ActivityResult;
import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.IsReadyToPayRequest;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;
import com.orcamoney.app.BuildConfig;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.PaymentMethodCreateParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "GooglePay",
    permissions = @Permission(strings = {"android.permission.INTERNET"}, alias = "internet")
)
public class GooglePayPlugin extends Plugin {
    private static final int LOAD_PAYMENT_DATA_REQUEST_CODE = 991;
    private PaymentsClient paymentsClient;
    private PluginCall savedCall;

    @Override
    public void load() {
        String stripePublishableKey = BuildConfig.STRIPE_PUBLISHABLE_KEY;
        PaymentConfiguration.init(
                getContext(),
                stripePublishableKey
        );
        paymentsClient = Wallet.getPaymentsClient(
            getContext(),
            new Wallet.WalletOptions.Builder()
                .setEnvironment(WalletConstants.ENVIRONMENT_TEST) // Use ENVIRONMENT_PRODUCTION for production
                .build()
        );
    }

    @PluginMethod
    public void isReadyToPay(PluginCall call) {
        try {
            JSONObject isReadyToPayRequestJson = new JSONObject()
                .put("apiVersion", 2)
                .put("apiVersionMinor", 0)
                .put("allowedPaymentMethods", new JSONArray()
                    .put(new JSONObject()
                        .put("type", "CARD")
                        .put("parameters", new JSONObject()
                            .put("allowedAuthMethods", new JSONArray()
                                .put("PAN_ONLY")
                                .put("CRYPTOGRAM_3DS"))
                            .put("allowedCardNetworks", new JSONArray()
                                .put("AMEX")
                                .put("DISCOVER")
                                .put("JCB")
                                .put("MASTERCARD")
                                .put("VISA")))));

            IsReadyToPayRequest request = IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString());

            paymentsClient.isReadyToPay(request)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        JSObject response = new JSObject();
                        response.put("result", task.getResult());
                        call.resolve(response);
                    } else {
                        call.reject("Google Pay is not available", task.getException());
                    }
                });
        } catch (Exception e) {
            call.reject("Error creating IsReadyToPayRequest", e);
        }
    }

    @PluginMethod
    public void requestPayment(PluginCall call) {
        this.savedCall = call;
        try {
            JSONObject paymentDataRequestJson = new JSONObject()
                    .put("apiVersion", 2)
                    .put("apiVersionMinor", 0)
                    .put("merchantInfo", new JSONObject()
                            .put("merchantName", "Orca"))
                    .put("allowedPaymentMethods", new JSONArray()
                            .put(new JSONObject()
                                    .put("type", "CARD")
                                    .put("tokenizationSpecification", new JSONObject()
                                            .put("type", "PAYMENT_GATEWAY")
                                            .put("parameters", new JSONObject()
                                                    .put("gateway", "stripe")
                                                    .put("stripe:version", "2020-08-27")
                                                    .put("stripe:publishableKey", PaymentConfiguration.getInstance(getContext()).getPublishableKey())))
                                    .put("parameters", new JSONObject()
                                            .put("allowedAuthMethods", new JSONArray()
                                                    .put("PAN_ONLY")
                                                    .put("CRYPTOGRAM_3DS"))
                                            .put("allowedCardNetworks", new JSONArray()
                                                    .put("AMEX")
                                                    .put("DISCOVER")
                                                    .put("JCB")
                                                    .put("MASTERCARD")
                                                    .put("VISA"))
                                            .put("billingAddressRequired", true)
                                            .put("billingAddressParameters", new JSONObject()
                                                    .put("format", "FULL")
                                                    .put("phoneNumberRequired", true)))))
                    .put("transactionInfo", new JSONObject()
                            .put("totalPriceStatus", "FINAL")
                            .put("totalPrice", call.getString("totalPrice"))
                            .put("currencyCode", "USD"))
                    .put("emailRequired", true);

            PaymentDataRequest request = PaymentDataRequest.fromJson(paymentDataRequestJson.toString());
            if (request != null) {
                Task<PaymentData> task = paymentsClient.loadPaymentData(request);
                task.addOnCompleteListener(taskResult -> {
                    try {
                        handlePaymentData(taskResult);
                    } catch (Exception e) {
                        call.reject("Payment failed", e);
                    }
                });
            } else {
                call.reject("PaymentDataRequest is null");
            }
        } catch (Exception e) {
            call.reject("Exception while creating PaymentDataRequest", e);
        }
    }
    private void handlePaymentData(Task<PaymentData> task) throws JSONException {
        try {
            PaymentData paymentData = task.getResult(ApiException.class);
            if (paymentData != null) {
                String paymentInformation = paymentData.toJson();
                JSONObject paymentMethodData = new JSONObject(paymentInformation).getJSONObject("paymentMethodData");
                String token = paymentMethodData
                        .getJSONObject("tokenizationData")
                        .getString("token");
                PaymentMethodCreateParams params = PaymentMethodCreateParams.createFromGooglePay(new JSONObject(token));
                processPayment(params);
                savedCall.resolve();
            } else {
                savedCall.reject("Payment data is null");
            }
        } catch (ResolvableApiException e) {
            // Handle the exception by showing the Google Pay UI
            AutoResolveHelper.resolveTask(
                    task,
                    getActivity(),
                    LOAD_PAYMENT_DATA_REQUEST_CODE // Use the same request code as when starting the payment
            );
        } catch (ApiException e) {
            savedCall.reject("Error in payment processing", e);
        }
    }

    @ActivityCallback
    private void handlePaymentResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                PaymentData paymentData = PaymentData.getFromIntent(data);
                if (paymentData != null) {
                    String paymentInformation = paymentData.toJson();
                    try {
                        JSONObject paymentMethodData = new JSONObject(paymentInformation).getJSONObject("paymentMethodData");
                        String token = paymentMethodData
                            .getJSONObject("tokenizationData")
                            .getString("token");
                        PaymentMethodCreateParams params = PaymentMethodCreateParams.createFromGooglePay(new JSONObject(token));
                        processPayment(params);
                    } catch (Exception e) {
                        call.reject("Error processing payment", e);
                    }
                }
            }
        } else if (result.getResultCode() == Activity.RESULT_CANCELED) {
            call.reject("Payment was canceled");
        } else {
            call.reject("Payment failed with an error");
        }
    }

    private void processPayment(PaymentMethodCreateParams params) {
        // Initialize Stripe object
        Stripe stripe = new Stripe(
            getContext(),
            PaymentConfiguration.getInstance(getContext()).getPublishableKey()
        );

        // Confirm PaymentIntent specifically for Google Pay
        stripe.confirmPayment(
            getActivity(),
            ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(params, savedCall.getString("clientSecret"))
        );
    }
}
