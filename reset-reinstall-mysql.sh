#!/bin/zsh
set -euo pipefail
exec > /tmp/mysql-full-reset.log 2>&1
set -x
echo "RUN_VERSION=v2"

BACKUP_FILE="/Users/zawhtetnaung/Documents/Webprojects/mysql-backups/mysql-homebrew-backup-20260422-174803.tar.gz"
[ -f "$BACKUP_FILE" ]

launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/homebrew.mxcl.mysql.plist" || true
pkill -9 -f '/opt/homebrew/opt/mysql/bin/mysqld' || true
pkill -9 -f 'mysqld_safe' || true
rm -f /tmp/mysql.sock /tmp/mysqlx.sock || true
find /opt/homebrew/var/mysql -maxdepth 1 -name '*.pid' -delete || true

rm -rf /opt/homebrew/Cellar/mysql
rm -f /opt/homebrew/opt/mysql
rm -rf /opt/homebrew/var/mysql
rm -f "$HOME/Library/LaunchAgents/homebrew.mxcl.mysql.plist"
rm -f /opt/homebrew/etc/my.cnf

HOMEBREW_NO_AUTO_UPDATE=1 /opt/homebrew/bin/brew install mysql
HOMEBREW_NO_AUTO_UPDATE=1 /opt/homebrew/bin/brew services start mysql

for _ in {1..60}; do
  if nc -z 127.0.0.1 3306 >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

nc -z 127.0.0.1 3306

mysql -h127.0.0.1 -P3306 -uroot <<'SQL'
CREATE DATABASE IF NOT EXISTS messaraliving CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'messara'@'127.0.0.1' IDENTIFIED BY 'messara123';
CREATE USER IF NOT EXISTS 'messara'@'localhost' IDENTIFIED BY 'messara123';
GRANT ALL PRIVILEGES ON messaraliving.* TO 'messara'@'127.0.0.1';
GRANT ALL PRIVILEGES ON messaraliving.* TO 'messara'@'localhost';
FLUSH PRIVILEGES;
SQL

cd /Users/zawhtetnaung/Documents/Webprojects/ecommerce-api
php artisan config:clear
php artisan migrate
