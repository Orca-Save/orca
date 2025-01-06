#!/bin/bash

# macOS connection script for connecting to usbfluxd running on a Linux host

# Replace with the IP address of the Linux host running usbfluxd
LINUX_HOST_IP="192.168.0.3"
USBFLUXD_PORT="5000"

# Start usbmuxd on macOS
echo "Starting usbmuxd..."
sudo launchctl start usbmuxd

# Set up usbfluxd to connect to the Linux host
echo "Connecting to usbfluxd server on Linux host at ${LINUX_HOST_IP}:${USBFLUXD_PORT}..."
sudo usbfluxd -f -r ${LINUX_HOST_IP}:${USBFLUXD_PORT}

echo "Connection to usbfluxd server established. Your iPhone should now be available in macOS."
