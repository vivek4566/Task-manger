# Step 1.3 — local Docker test (run from repo root)
# Requires Docker Desktop running (Linux engine)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed."
}

$null = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker daemon is not running. Start Docker Desktop, wait until it says Running, then run this script again." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path "server/.env")) {
  Write-Error "Missing server/.env - copy server/.env.example and fill in values."
}

Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "Waiting for API health..." -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $r = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3
    if ($r.status -eq "ok") { $ok = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}

if ($ok) {
  Write-Host "API health: OK" -ForegroundColor Green
  Write-Host "Open in browser:" -ForegroundColor Green
  Write-Host "  http://localhost:3000  (app)"
  Write-Host "  http://localhost:5000/api/health  (API)"
} else {
  Write-Host "API not healthy yet. Check logs:" -ForegroundColor Yellow
  Write-Host "  docker compose logs api"
  exit 1
}
