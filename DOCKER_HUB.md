# Publish Images To Docker Hub

This project publishes two images:

- `backoffice-backend`
- `backoffice-frontend`

## 1. Login

```bash
docker login
```

## 2. Set Your Docker Hub Username

PowerShell:

```powershell
$env:DOCKERHUB_NAMESPACE="samadimed"
$env:IMAGE_TAG="latest"
```

Git Bash / Linux / macOS:

```bash
export DOCKERHUB_NAMESPACE=samadimed
export IMAGE_TAG=latest
```

## 3. Build Images

```bash
docker compose -f docker-compose.yml -f docker-compose.publish.yml build
```

## 4. Push Images

```bash
docker compose -f docker-compose.yml -f docker-compose.publish.yml push
```

## 5. Pull On Another Machine

```bash
docker pull samadimed/backoffice-backend:latest
docker pull samadimed/backoffice-frontend:latest
```

For production, do not keep the local `APP_KEY`, database passwords, or debug settings from `docker-compose.yml`. Create a production compose file or server environment variables with secure values.
