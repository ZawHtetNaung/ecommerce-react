#!/bin/zsh
set -euo pipefail
exec > /tmp/repair-local-mysql.log 2>&1
set -x

echo "Stopping any Homebrew MySQL service state..."
brew services stop mysql || true
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/homebrew.mxcl.mysql.plist" || true

echo "Killing leftover MySQL processes..."
pkill -9 -f '/opt/homebrew/opt/mysql/bin/mysqld' || true
pkill -9 -f '/opt/homebrew/Cellar/mysql/.*/bin/mysqld' || true
pkill -9 -f 'mysql.server start' || true
pkill -9 -f 'mysqld_safe' || true

echo "Removing stale pid/socket files..."
find /opt/homebrew/var/mysql -maxdepth 1 -name '*.pid' -delete || true
rm -f /tmp/mysql.sock /tmp/mysqlx.sock

echo "Starting MySQL again..."
brew services start mysql

echo "Waiting for port 3306..."
for _ in {1..30}; do
  if nc -z 127.0.0.1 3306 >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! nc -z 127.0.0.1 3306 >/dev/null 2>&1; then
  echo
  echo "MySQL did not come up on port 3306."
  echo "Check these logs:"
  echo "  /opt/homebrew/var/mysql/Mac.err"
  echo "  /opt/homebrew/var/mysql/ZawHtetNaungs-MacBook-Air.local.err"
  exit 1
fi

echo
echo "MySQL is listening on 127.0.0.1:3306"
echo "Next: log in and run these SQL statements:"
echo
cat <<'SQL'
CREATE DATABASE IF NOT EXISTS messaraliving CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'messara'@'127.0.0.1' IDENTIFIED BY 'messara123';
CREATE USER IF NOT EXISTS 'messara'@'localhost' IDENTIFIED BY 'messara123';
GRANT ALL PRIVILEGES ON messaraliving.* TO 'messara'@'127.0.0.1';
GRANT ALL PRIVILEGES ON messaraliving.* TO 'messara'@'localhost';
FLUSH PRIVILEGES;
SQL
