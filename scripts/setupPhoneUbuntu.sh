#!/bin/bash

# Linux setup script for iPhone passthrough with QEMU macOS VM

echo "Updating package lists..."
sudo apt update

echo "Installing dependencies..."
sudo apt install -y usbmuxd avahi-daemon socat libimobiledevice6 libimobiledevice-utils
sudo apt install -y libtool automake libplist-dev autoconf pkg-config build-essential
echo "Cloning usbfluxd repository..."
if [ ! -d "usbfluxd" ]; then
    git clone https://github.com/corellium/usbfluxd.git
    cd usbfluxd || exit
    ./autogen.sh
    make
    sudo make install
    cd ..
else
    echo "usbfluxd repository already cloned. Skipping..."
fi

echo "Configuring avahi-daemon and usbmuxd services..."
# Ensure usbmuxd and avahi-daemon can be manually started
sudo systemctl disable usbmuxd avahi-daemon

echo "Setup complete. To start passthrough, use the start script."
