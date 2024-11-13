#!/bin/bash

# macOS setup script for iPhone passthrough with QEMU macOS VM

echo "Checking for Homebrew installation..."
if ! command -v brew &>/dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew is already installed. Skipping..."
fi

echo "Installing dependencies with Homebrew..."
brew install libimobiledevice usbmuxd socat automake autoconf libtool pkg-config gcc

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

echo "Setup complete. You can now use the start script to start services."
