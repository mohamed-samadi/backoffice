# Run This Project With Docker

This setup starts:

- `frontend`: React/Vite build served by nginx on http://localhost:3000
- `backend`: Laravel served by nginx + PHP-FPM on http://localhost:8000
- `db`: MySQL 8 on localhost:3307

## Start

```bash
docker compose up --build
```

Open the app:

```text
http://localhost:3000
```

Default test login:

```text
Email: reda.dev@example.com
Password: password123
```

The frontend proxies these paths to Laravel:

- `/api`
- `/sanctum`
- `/storage`

## Development With Live Code Updates

Use this when you want containers to update while you edit files:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

In this mode:

- `./backend` is mounted into the Laravel container.
- `./frontend` is mounted into a Vite dev container.
- Frontend hot reload stays on http://localhost:3000.
- Composer dependencies stay in the `backend_vendor` volume.
- npm dependencies stay in the `frontend_node_modules` volume.
- The backend runs `composer install` on startup in this dev mode.

If you change `backend/composer.json`, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend composer install
```

If you change `frontend/package.json`, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm install
```

## Useful Commands

Run Laravel artisan:

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan tinker
```

Open MySQL from inside Docker:

```bash
docker compose exec db mysql -ubackoffice -pbackoffice backoffice
```

Stop containers:

```bash
docker compose down
```

Stop containers and delete database data:

```bash
docker compose down -v
```

## Database Credentials

```text
Host from Laravel: db
Host from your computer: 127.0.0.1
Port from your computer: 3307
Port inside Docker: 3306
Database: backoffice
User: backoffice
Password: backoffice
Root password: root
```

For production, change `APP_KEY`, database passwords, `APP_ENV`, and `APP_DEBUG` in `docker-compose.yml`.
