package com.orcamoney.app;

import com.getcapacitor.BridgeActivity;
import com.orcamoney.app.plugins.GooglePay.GooglePayPlugin;

import android.os.Bundle;


public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GooglePayPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
