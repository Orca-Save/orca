package com.orcamoney.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
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

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

@CapacitorPlugin(name = "PayPlugin")
public class PayPlugin extends Plugin {

    private BillingClient billingClient;
    private Activity activity;
    private String accessToken;
    private String backendURL;
    private PluginCall pluginCall;

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
                                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                                    // Send the purchaseToken to the backend
                                    sendPurchaseTokenToBackend(purchase.getPurchaseToken());

                                    // Acknowledge the purchase
                                    if (!purchase.isAcknowledged()) {
                                        AcknowledgePurchaseParams acknowledgePurchaseParams =
                                                AcknowledgePurchaseParams.newBuilder()
                                                        .setPurchaseToken(purchase.getPurchaseToken())
                                                        .build();
                                        billingClient.acknowledgePurchase(acknowledgePurchaseParams, ackResult -> {
                                            if (ackResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                                // Purchase acknowledged
                                                pluginCall.resolve();
                                            } else {
                                                // Handle error in acknowledging purchase
                                                pluginCall.reject("Failed to acknowledge purchase");
                                            }
                                        });
                                    } else {
                                        // Purchase already acknowledged
                                        pluginCall.resolve();
                                    }
                                }
                            }
                        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                            // Handle user cancellation
                            pluginCall.reject("User Cancelled");
                        } else {
                            // Handle other errors
                            pluginCall.reject("Error");
                        }
                    }
                })
                .build();
    }

    public void openSubscriptionManagement() {
        String packageName = getContext().getPackageName();
        Uri uri = Uri.parse("https://play.google.com/store/account/subscriptions?package=" + packageName);
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }

    private void acknowledgePurchase(Purchase purchase) {
        AcknowledgePurchaseParams acknowledgePurchaseParams =
                AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchase.getPurchaseToken())
                        .build();
        billingClient.acknowledgePurchase(acknowledgePurchaseParams, ackResult -> {
            if (ackResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                // Purchase acknowledged
            } else {
                // Handle error in acknowledging purchase
            }
        });
    }

    private void showSubscriptionOptions() {
        activity.runOnUiThread(() -> {
            new AlertDialog.Builder(getContext())
                    .setTitle("Subscription Status")
                    .setMessage("Your subscription is inactive. Would you like to reactivate it?")
                    .setPositiveButton("Resubscribe", (dialog, which) -> {
                        proceedToPurchase(pluginCall);
                    })
                    .setNegativeButton("Manage Subscription", (dialog, which) -> {
                        openSubscriptionManagement();
                    })
                    .setNeutralButton("Cancel", null)
                    .show();
        });
    }

    @PluginMethod
    public void manageSubscription(PluginCall call) {
        openSubscriptionManagement();
        call.resolve();
    }

    @PluginMethod
    public void subscribe(PluginCall call) {
        if (call.getString("accessToken") == null) {
            call.reject("Missing accessToken");
            return;
        }
        pluginCall = call;
        backendURL = call.getString("backendURL");
        accessToken = call.getString("accessToken");
        if (billingClient.isReady()) {
            // Query existing purchases
            billingClient.queryPurchasesAsync(BillingClient.ProductType.SUBS, (billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    if (purchases != null && !purchases.isEmpty()) {
                        for (Purchase purchase : purchases) {
                            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                                // Verify the subscription status via backend
                                verifySubscriptionStatus(purchase.getPurchaseToken(), isActive -> {
                                    if (isActive) {
                                        // Subscription is active
                                        showSubscriptionOptions();
                                        call.resolve();
                                    } else {
                                        // Subscription is inactive
                                        proceedToPurchase(call);
                                    }
                                });
                                return;
                            }
                        }
                    } else {
                        // No existing purchases
                        proceedToPurchase(call);
                    }
                } else {
                    call.reject("Failed to query existing purchases");
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

    private void verifySubscriptionStatus(String purchaseToken, Consumer<Boolean> callback) {
        new Thread(() -> {
            try {
                // Your backend endpoint to verify the subscription
                URL url = new URL(backendURL + "/api/google/verifySubscription");
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();

                // Set up the request
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Authorization", "Bearer " + accessToken);
                urlConnection.setRequestProperty("Content-Type", "application/json");
                urlConnection.setDoOutput(true);

                // Build JSON body
                JSONObject jsonBody = new JSONObject();
                jsonBody.put("token", purchaseToken);

                // Send the request
                OutputStream os = urlConnection.getOutputStream();
                os.write(jsonBody.toString().getBytes());
                os.flush();
                os.close();

                // Get the response
                int responseCode = urlConnection.getResponseCode();
                InputStream is = responseCode == HttpURLConnection.HTTP_OK
                        ? urlConnection.getInputStream()
                        : urlConnection.getErrorStream();

                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                // Parse the response
                JSONObject jsonResponse = new JSONObject(response.toString());
                boolean isActive = jsonResponse.getBoolean("isActive");

                // Return to the main thread
                activity.runOnUiThread(() -> callback.accept(isActive));

                urlConnection.disconnect();
            } catch (Exception e) {
                Log.e("PayPlugin", "Error verifying subscription status", e);
                activity.runOnUiThread(() -> callback.accept(false));
            }
        }).start();
    }


    private void sendPurchaseTokenToBackend(String purchaseToken) {
        new Thread(() -> {
            if (accessToken == null) {
                Log.e("PayPlugin", "Access token not found");
                return;
            }

            try {
                // Define the API endpoint (replace with your actual endpoint)
                URL url = new URL(backendURL + "/api/users/setGoogleSubscriptionToken");
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
