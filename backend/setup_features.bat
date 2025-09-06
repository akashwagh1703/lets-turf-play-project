@echo off
echo Setting up Features System...

echo Running features migration...
php artisan migrate --path=database/migrations/2024_01_01_000009_create_features_table.php --force

echo Running revenue models update migration...
php artisan migrate --path=database/migrations/2024_01_01_000010_update_revenue_models_for_dynamic_features.php --force

echo Seeding features...
php artisan db:seed --class=FeatureSeeder --force

echo Features setup completed!
pause