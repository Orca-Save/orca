export interface GooglePayPlugin {
  isReadyToPay(): Promise<void>;
  requestPayment(options: {
    totalPrice: string;
    currencyCode: string;
  }): Promise<void>;
}
