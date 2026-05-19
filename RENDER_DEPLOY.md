# Deploy To Render For Testing

Render does not run `docker compose` as one app. Deploy this project as:

- one backend Web Service from `samadimed/backoffice-backend:latest`
- one frontend Web Service from `samadimed/backoffice-frontend:latest`
- one external MySQL database

Render free services are good for testing, but they can sleep when idle.

## 1. Prepare A MySQL Database

Render free databases are PostgreSQL, while this Laravel app currently uses MySQL.

For a quick test, create a free remote MySQL database from a provider such as:

- https://freedb.tech/
- https://remotemysql.com/
- Oracle Cloud MySQL HeatWave Free Tier

Keep these values:

```text
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

## 2. Deploy Backend On Render

In Render:

1. Click `New`.
2. Choose `Web Service`.
3. Choose `Deploy an existing image from a registry`.
4. Image URL:

```text
samadimed/backoffice-backend:latest
```

5. Add environment variables:

```text
APP_NAME=Backoffice
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:REPLACE_WITH_REAL_KEY
APP_URL=https://YOUR_BACKEND_SERVICE.onrender.com

DB_CONNECTION=mysql
DB_HOST=YOUR_MYSQL_HOST
DB_PORT=YOUR_MYSQL_PORT
DB_DATABASE=YOUR_MYSQL_DATABASE
DB_USERNAME=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none

SANCTUM_STATEFUL_DOMAINS=YOUR_FRONTEND_SERVICE.onrender.com
CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND_SERVICE.onrender.com

RUN_MIGRATIONS=true
RUN_SEEDERS=true
```

Generate a real Laravel app key locally:

```bash
docker compose exec backend php artisan key:generate --show
```

Use the printed value for `APP_KEY`.

## 3. Deploy Frontend On Render

In Render:

1. Click `New`.
2. Choose `Web Service`.
3. Choose `Deploy an existing image from a registry`.
4. Image URL:

```text
samadimed/backoffice-frontend:latest
```

5. Add environment variables:

```text
API_URL=
API_PROXY_URL=https://YOUR_BACKEND_SERVICE.onrender.com
```

## 4. After Both Services Are Created

Update backend environment variables with the final frontend/backend URLs:

```text
APP_URL=https://YOUR_BACKEND_SERVICE.onrender.com
SANCTUM_STATEFUL_DOMAINS=YOUR_FRONTEND_SERVICE.onrender.com
CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND_SERVICE.onrender.com
```

Then redeploy the backend.

Example with real Render URLs:

```text
APP_URL=https://backoffice-backend-latest.onrender.com
SANCTUM_STATEFUL_DOMAINS=backoffice-frontend-latest-2.onrender.com
CORS_ALLOWED_ORIGINS=https://backoffice-frontend-latest-2.onrender.com
```

For the frontend service:

```text
API_URL=
API_PROXY_URL=https://backoffice-backend-latest.onrender.com
```

Do not keep `YOUR_BACKEND_SERVICE` or `YOUR_FRONTEND_SERVICE` literally in Render variables. Replace them with your real service URLs.

Open:

```text
https://YOUR_FRONTEND_SERVICE.onrender.com
```

## Notes

- Free Render services sleep after inactivity, so the first request can be slow.
- Do not expose MySQL publicly except to the backend service if your database provider supports IP restrictions.
- For a real production deployment, use a paid service or Oracle Cloud/VPS with Docker Compose.

## Troubleshooting

### `SQLSTATE[HY000] [2002] Connection refused`

If Render shows an error like:

```text
SQLSTATE[HY000] [2002] No connection could be made because the target machine actively refused it
Connection: mysql
```

It means the backend cannot connect to MySQL.

On Render, do not use these local Docker values:

```text
DB_HOST=mysql
DB_HOST=db
DB_HOST=localhost
```

Use the real database host from your remote MySQL provider:

```text
DB_CONNECTION=mysql
DB_HOST=YOUR_REAL_MYSQL_HOST
DB_PORT=3306
DB_DATABASE=YOUR_REAL_MYSQL_DATABASE
DB_USERNAME=YOUR_REAL_MYSQL_USERNAME
DB_PASSWORD=YOUR_REAL_MYSQL_PASSWORD
```

After changing backend environment variables in Render, click `Manual Deploy` -> `Deploy latest commit/image`.
