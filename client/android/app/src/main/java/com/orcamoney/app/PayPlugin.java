package com.orcamoney.app;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginMethod;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails.SubscriptionOfferDetails;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "PayPlugin")
public class PayPlugin extends Plugin {

    private BillingClient billingClient;
    private Activity activity;
    private String accessToken;
    private String backendURL;

    @Override
    public void load() {
        activity = getActivity();
        billingClient = BillingClient.newBuilder(getContext())
                .enablePendingPurchases()
                .setListener(new PurchasesUpdatedListener() {
                    @Override
                    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                            for (Purchase purchase : purchases) {
                                String purchaseToken = purchase.getPurchaseToken();

                                // Send the purchaseToken to the backend
                                sendPurchaseTokenToBackend(purchaseToken);
                            }
                        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                            // Handle user cancellation
                        } else {
                            // Handle other errors
                        }
                    }
                })
                .build();
    }

    @PluginMethod
    public void subscribe(PluginCall call) {
        if (call.getString("accessToken") == null) {
            call.reject("Missing accessToken");
            return;
        }
        backendURL = call.getString("backendURL");
        accessToken = call.getString("accessToken");
        if (billingClient.isReady()) {
            // Query existing purchases
            billingClient.queryPurchasesAsync(BillingClient.ProductType.SUBS, new PurchasesResponseListener() {
                @Override
                public void onQueryPurchasesResponse(BillingResult billingResult, List<Purchase> purchases) {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        if (purchases != null && !purchases.isEmpty()) {
                            // Existing purchase found
                            for (Purchase purchase : purchases) {
                                String purchaseToken = purchase.getPurchaseToken();
                                // Send the existing purchaseToken to the backend
                                sendPurchaseTokenToBackend(purchaseToken);
                                // Notify the user or handle as needed
                                call.reject("Existing subscription detected");
                                return; // Exit the method to prevent starting a new purchase flow
                            }
                        } else {
                            // No existing purchases, proceed to purchase
                            proceedToPurchase(call);
                        }
                    } else {
                        // Handle error in querying purchases
                        call.reject("Failed to query existing purchases");
                    }
                }
            });
        } else {
            // Billing client is not ready, reconnecting
            billingClient.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingServiceDisconnected() {
                    // Try reconnecting if needed
                }

                @Override
                public void onBillingSetupFinished(BillingResult billingResult) {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        // Billing client is ready, retry subscription
                        subscribe(call);
                    } else {
                        call.reject("Failed to set up billing");
                    }
                }
            });
        }
    }

    private void proceedToPurchase(PluginCall call) {
        List<String> productIdList = new ArrayList<>();
        productIdList.add(call.getString("productId"));  // Pass product ID from JS

        // Create a ProductDetails query
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(call.getString("productId"))
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(List.of(product))
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
            try {

                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null) {
                    for (ProductDetails productDetails : productDetailsList) {
                        // Get available subscription offers
                        List<SubscriptionOfferDetails> offerDetailsList = productDetails.getSubscriptionOfferDetails();
                        if (offerDetailsList != null && !offerDetailsList.isEmpty()) {
                            // Get the first available offer and its offerToken
                            SubscriptionOfferDetails offerDetails = offerDetailsList.get(0);
                            String offerToken = offerDetails.getOfferToken();

                            // Create the billing flow params with product details and offerToken
                            BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                                    .setProductDetailsParamsList(
                                            List.of(BillingFlowParams.ProductDetailsParams.newBuilder()
                                                    .setProductDetails(productDetails)
                                                    .setOfferToken(offerToken)  // Required for subscription
                                                    .build()
                                            )
                                    )
                                    .build();

                            // Launch the billing flow
                            billingClient.launchBillingFlow(activity, billingFlowParams);
                        } else {
                            // Handle no available offers
                            call.reject("No subscription offers available");
                        }
                    }
                } else {
                    // Handle errors in querying product details
                    call.reject("Failed to query subscription details");
                }
            } catch (Exception e) {
                System.out.println("Error" + e.getMessage());
                call.reject("Failed to query subscription details");
            }
        });
    }

    private void sendPurchaseTokenToBackend(String purchaseToken) {
        new Thread(() -> {
            if (accessToken == null) {
                Log.e("PayPlugin", "Access token not found");
                return;
            }

            try {
                // Define the API endpoint (replace with your actual endpoint)
                URL url = new URL(backendURL);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();

                // Configure the connection
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Authorization", "Bearer " + accessToken);
                urlConnection.setRequestProperty("Content-Type", "application/json");
                urlConnection.setDoOutput(true);

                // Create the JSON body with the purchaseToken
                JSONObject jsonBody = new JSONObject();
                jsonBody.put("token", purchaseToken);

                // Send the JSON body
                OutputStream os = urlConnection.getOutputStream();
                os.write(jsonBody.toString().getBytes());
                os.flush();
                os.close();

                // Check the response
                int responseCode = urlConnection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    Log.i("PayPlugin", "Purchase token sent successfully");
                } else {
                    Log.e("PayPlugin", "Failed to send purchase token. Response code: " + responseCode);
                }

                urlConnection.disconnect();
            } catch (Exception e) {
                Log.e("PayPlugin", "Error sending purchase token to backend", e);
            }
        }).start();
    }
}
