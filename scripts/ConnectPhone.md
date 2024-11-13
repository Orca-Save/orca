https://chatgpt.com/share/672b33b3-423c-8007-8f4e-947145d03fee

### Quick Start

Relevant scripts:
setup_phone_mac.sh
setup_phone_ubuntu.sh

startPassthrough.sh
stopPassthrough.sh
connectUsb.sh

To connect your iPhone to a QEMU macOS 15.1 VM on Ubuntu, you'll need to follow these steps using `usbfluxd` for USB over network passthrough. Here’s a summary of what to install and configure:

### Step 1: Install QEMU and other dependencies

Ensure QEMU and KVM are installed on your Ubuntu system:

```bash
sudo apt update
sudo apt install qemu qemu-kvm libvirt-clients libvirt-daemon-system bridge-utils virt-manager libguestfs-tools
```

### Step 2: Install USB Passthrough Tools

You'll need `usbmuxd`, `socat`, and `usbfluxd`. On Ubuntu, you can install them as follows:

```bash
sudo apt install usbmuxd libusbmuxd avahi-daemon socat
```

For `usbfluxd`, if it’s not available directly, you may need to compile it from the [Corellium GitHub repository](https://github.com/corellium/usbfluxd).

### Step 3: Start the USB Flux Daemon and Required Services

Open three terminals and run the following commands:

**Terminal 1:** Start `usbmuxd` and `avahi-daemon`:

```bash
sudo systemctl start usbmuxd
sudo avahi-daemon
```

**Terminal 2:** Forward `usbmuxd` through `socat`:

```bash
sudo socat tcp-listen:5000,fork unix-connect:/var/run/usbmuxd
```

**Terminal 3:** Run `usbfluxd`:

```bash
sudo usbfluxd -f -n
```

### Step 4: Set up macOS (on the QEMU VM) to Recognize the iPhone

1. **Install Homebrew (if not installed):**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **Install necessary tools via Homebrew:**

   ```bash
   brew install make automake autoconf libtool pkg-config gcc libimobiledevice usbmuxd
   ```

3. **Download and compile `usbfluxd` on the macOS VM:**

   ```bash
   git clone https://github.com/corellium/usbfluxd.git
   cd usbfluxd
   ./autogen.sh
   make
   sudo make install
   ```

4. **Run `usbfluxd` in macOS and connect to your Ubuntu host:**
   Replace `172.17.0.1` with the actual IP of your Ubuntu machine if it’s different.
   ```bash
   sudo launchctl start usbmuxd
   export PATH=/usr/local/sbin:${PATH}
   sudo usbfluxd -f -r 172.17.0.1:5000
   ```

### Step 5: Verify Connection

Open an application like Xcode on your macOS VM, and check if your iPhone appears as a connected device.

### Troubleshooting

If the iPhone isn’t recognized, restart `usbfluxd`, `usbmuxd`, and `socat` with:

```bash
sudo killall usbfluxd
sudo systemctl restart usbmuxd
sudo killall socat
```

It appears that `libusbmuxd` might not be directly available in your current repository or might have a slightly different name. You can try installing the required `usbmuxd` library and related dependencies as follows:

1. **Update Package List**
   Make sure your package lists are up-to-date:

   ```bash
   sudo apt update
   ```

2. **Install usbmuxd and dependencies**
   On some systems, the necessary libraries for `usbmuxd` might be included with just `usbmuxd`. Try the following command without `libusbmuxd`:

   ```bash
   sudo apt install usbmuxd avahi-daemon socat
   ```

3. **Install libimobiledevice** (an alternative to `libusbmuxd`):
   `libimobiledevice` provides similar functionality and should include the necessary libraries for device communication:

   ```bash
   sudo apt install libimobiledevice6 libimobiledevice-utils
   ```

4. **Verify installation**
   After these steps, verify that `usbmuxd` is running by checking its status:
   ```bash
   sudo systemctl status usbmuxd
   ```

These steps should give you the functionality you need to proceed with setting up the iPhone passthrough.
