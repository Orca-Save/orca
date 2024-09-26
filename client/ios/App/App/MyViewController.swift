import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController  {
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PayPlugin())
    }
}
