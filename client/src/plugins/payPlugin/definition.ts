import { registerPlugin } from '@capacitor/core';

export interface PayPlugin {
  subscribe(options: {
    productId: string;
    backendURL: string;
    accessToken: string;
  }): Promise<string>;
}

const Pay = registerPlugin<PayPlugin>('PayPlugin');

export default Pay;
