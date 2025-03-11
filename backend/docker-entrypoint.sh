#!/bin/bash

cd /var/www/html || exit
composer install

# Clear configuration cache
php artisan config:clear

# Cache configuration
php artisan config:cache

# Wait for database to be ready
echo "Waiting for database connection..."

echo "Database connection successful, running migrations..."

# Run migrations and other Laravel commands
php artisan migrate --force
php artisan db:seed
php artisan db:seed --class=AppsCheckoutSeeder

php artisan storage:link

# Start supervisor
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
