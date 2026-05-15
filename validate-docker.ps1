# 🧪 Docker Setup Validation (PowerShell)
# Teste si la configuration Docker est correcte sous Windows

$ErrorActionPreference = "Continue"

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 Docker Setup Validation (Windows)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$testCount = 0
$passCount = 0

# Fonction pour tester l'existence d'un fichier
function Test-File {
    param(
        [string]$Path,
        [string]$Name
    )

    $script:testCount++

    if (Test-Path $Path) {
        Write-Host "✅ $Name existe" -ForegroundColor Green
        $script:passCount++
        return $true
    } else {
        Write-Host "❌ $Name manque: $Path" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester une commande
function Test-Command {
    param(
        [string]$Command,
        [string]$Name
    )

    $script:testCount++

    try {
        if (Get-Command $Command -ErrorAction Stop) {
            Write-Host "✅ $Name installé" -ForegroundColor Green
            $script:passCount++
            return $true
        }
    } catch {
        Write-Host "❌ $Name n'est pas installé" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester une image Docker
function Test-DockerImage {
    param(
        [string]$Image,
        [string]$Name
    )

    $script:testCount++

    try {
        $output = docker image inspect $Image 2>&1
        if ($?) {
            Write-Host "✅ Image Docker $Name pullée" -ForegroundColor Green
            $script:passCount++
            return $true
        }
    } catch {}

    Write-Host "⚠️  Image Docker $Name n'est pas local (sera pullée à la build)" -ForegroundColor Yellow
    return $false
}

# ═══════════════════════════════════════════════════════════
Write-Host "📋 Vérification des fichiers..." -ForegroundColor Yellow
Test-File "docker-compose.yml" "docker-compose.yml"
Test-File "backend\Dockerfile" "Backend Dockerfile"
Test-File "backend\docker\entrypoint.sh" "Backend entrypoint.sh"
Test-File "backend\docker\nginx.conf" "Backend nginx.conf"
Test-File "backend\docker\supervisord.conf" "Backend supervisord.conf"
Test-File "frontend\Dockerfile" "Frontend Dockerfile"
Test-File "frontend\docker\entrypoint.sh" "Frontend entrypoint.sh"
Test-File "frontend\docker\nginx.conf" "Frontend nginx.conf"

Write-Host ""
Write-Host "🛠️  Vérification des outils..." -ForegroundColor Yellow
Test-Command "docker" "Docker"
Test-Command "docker-compose" "Docker Compose"

Write-Host ""
Write-Host "🐳 Vérification des images Docker de base..." -ForegroundColor Yellow
Test-DockerImage "mysql:8.0" "MySQL 8.0"
Test-DockerImage "nginx:alpine" "Nginx Alpine"
Test-DockerImage "node:20-alpine" "Node.js 20 Alpine"
Test-DockerImage "php:8.2-fpm-alpine" "PHP 8.2 FPM Alpine"

# ═══════════════════════════════════════════════════════════
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 Résumé" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Passés: $passCount/$testCount" -ForegroundColor Cyan
Write-Host ""

if ($passCount -eq $testCount) {
    Write-Host "✨ Tout est prêt !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Démarrer avec :" -ForegroundColor Green
    Write-Host "  docker compose up --build" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Certaines vérifications n'ont pas passé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vérifications échouées : $($testCount - $passCount)/$testCount" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "À faire :" -ForegroundColor Yellow
    Write-Host "1. Installer Docker Desktop (https://www.docker.com/products/docker-desktop)" -ForegroundColor Yellow
    Write-Host "2. S'assurer que Docker & Docker Compose fonctionnent" -ForegroundColor Yellow
    Write-Host "3. Réexécuter ce script" -ForegroundColor Yellow
}
