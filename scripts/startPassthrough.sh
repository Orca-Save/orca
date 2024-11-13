#!/bin/bash

echo "Starting iPhone USB passthrough for QEMU macOS VM..."

# Start usbmuxd
echo "Starting usbmuxd..."
sudo systemctl start usbmuxd

# Start avahi-daemon
echo "Starting avahi-daemon..."
sudo avahi-daemon &

# Start socat forwarding for usbmuxd
echo "Starting socat to forward usbmuxd over TCP..."
sudo socat tcp-listen:5000,fork unix-connect:/var/run/usbmuxd &

# Start usbfluxd in the foreground
echo "Starting usbfluxd to handle USB over network..."
sudo usbfluxd -f -n

echo "USB passthrough setup complete. You can now connect your macOS VM to the iPhone."
