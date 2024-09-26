#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(PayPlugin, "PayPlugin",
  CAP_PLUGIN_METHOD(subscribe, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(manageSubscription, CAPPluginReturnPromise);
)
