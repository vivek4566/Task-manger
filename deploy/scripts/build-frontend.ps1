param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [string]$SocketUrl = $ApiUrl
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$client = Join-Path $root "client\my-app"

Push-Location $client
$env:REACT_APP_API_URL = $ApiUrl
$env:REACT_APP_SOCKET_URL = $SocketUrl
npm ci
npm run build
Pop-Location

Write-Host "Build complete: $client\build"
