import Foundation
import Capacitor
import StoreKit

@objc(PayPlugin)
public class PayPlugin: CAPPlugin, SKProductsRequestDelegate, SKPaymentTransactionObserver {
    private var accessToken: String?
    private var backendURL: String?
    private var productId: String?
    private var pluginCall: CAPPluginCall?
    private var productsRequest: SKProductsRequest?

    public override func load() {
        SKPaymentQueue.default().add(self)
    }

    @objc func subscribe(_ call: CAPPluginCall) {
        guard let accessToken = call.getString("accessToken"),
              let backendURL = call.getString("backendURL"),
              let productId = call.getString("productId") else {
            call.reject("Missing parameters")
            return
        }

        self.accessToken = accessToken
        self.backendURL = backendURL
        self.productId = productId
        self.pluginCall = call

        if SKPaymentQueue.canMakePayments() {
            let productIdentifiers = Set([productId])
            self.productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
            self.productsRequest?.delegate = self
            self.productsRequest?.start()
        } else {
            call.reject("In-app purchases are disabled on this device.")
        }
    }

    @objc func manageSubscription(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                call.resolve()
            } else {
                call.reject("Unable to open subscription management URL.")
            }
        }
    }

    // MARK: - SKProductsRequestDelegate

    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        guard let product = response.products.first else {
            self.pluginCall?.reject("Product not found.")
            return
        }
        self.purchaseProduct(product)
    }

    // MARK: - Purchase Product

    private func purchaseProduct(_ product: SKProduct) {
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }

    // MARK: - SKPaymentTransactionObserver

    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                self.handlePurchasedTransaction(transaction)
            case .failed:
                SKPaymentQueue.default().finishTransaction(transaction)
                self.pluginCall?.reject("Purchase failed.")
            case .restored:
                SKPaymentQueue.default().finishTransaction(transaction)
            default:
                break
            }
        }
    }

    private func handlePurchasedTransaction(_ transaction: SKPaymentTransaction) {
        // Get the transaction identifier
        guard let transactionIdentifier = transaction.transactionIdentifier else {
            SKPaymentQueue.default().finishTransaction(transaction)
            self.pluginCall?.reject("Unable to retrieve transaction identifier.")
            return
        }

        // Send the transaction identifier to the backend for verification
        self.verifySubscriptionStatus(transactionIdentifier: transactionIdentifier) { isActive in
            SKPaymentQueue.default().finishTransaction(transaction)
            if isActive {
                self.pluginCall?.resolve()
            } else {
                self.pluginCall?.reject("Subscription verification failed.")
            }
        }
    }

    // MARK: - Verify Subscription Status

    private func verifySubscriptionStatus(transactionIdentifier: String, completion: @escaping (Bool) -> Void) {
        guard let backendURL = self.backendURL, let accessToken = self.accessToken else {
            completion(false)
            return
        }

        let url = URL(string: "\(backendURL)/api/apple/verifySubscription")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = ["transactionId": transactionIdentifier,"accessToken": accessToken ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

        let session = URLSession(configuration: .default)
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error verifying subscription: \(error)")
                completion(false)
                return
            }

            guard let data = data else {
                print("No data received from subscription verification.")
                completion(false)
                return
            }

            do {
                if let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let isActive = jsonResponse["isActive"] as? Bool {
                    completion(isActive)
                } else {
                    completion(false)
                }
            } catch {
                print("Error parsing subscription verification response: \(error)")
                completion(false)
            }
        }
        task.resume()
    }
}
