# Giantess

Full project containing the Angular frontend and Laravel API backend.

- `giantess/`: Angular application, public assets, product catalog data, and scripts.
- `giantess-backend/`: Laravel API, migrations, seeders, and tests.

## Frontend

```sh
cd giantess
npm ci
npm start
```

Set the API URL in `src/environments/` for your environment. Build with `npm run build`.

## Backend

```sh
cd giantess-backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure the database and application settings in `.env`, then run:

```sh
php artisan migrate
php artisan storage:link
php artisan serve
```

Local credentials, installed dependencies, generated build output, and runtime logs are excluded from version control.
