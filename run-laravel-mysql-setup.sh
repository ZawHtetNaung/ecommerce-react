#!/bin/zsh
set -euo pipefail
exec > /tmp/laravel-mysql-setup.log 2>&1
set -x
cd /Users/zawhtetnaung/Documents/Webprojects/ecommerce-api
php artisan config:clear
php artisan migrate
