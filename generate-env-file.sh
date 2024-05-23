#!/bin/sh
set -e

# Output all environment variables to .env file
eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)

cd /etc/ssh/ \
    ssh-keygen -A

echo "Starting SSH ..."
/usr/sbin/sshd
