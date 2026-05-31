param(
  [Parameter(Mandatory = $true)]
  [string]$BucketName,

  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,

  [string]$SocketUrl = $ApiUrl,

  [string]$DistributionId = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $PSScriptRoot
& (Join-Path $scriptDir "build-frontend.ps1") -ApiUrl $ApiUrl -SocketUrl $SocketUrl

$root = Split-Path -Parent $scriptDir
$buildPath = Join-Path $root "client\my-app\build"

aws s3 sync $buildPath "s3://$BucketName" --delete

if ($DistributionId) {
  aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
  Write-Host "CloudFront invalidation started for distribution $DistributionId"
}

Write-Host "Deployed to s3://$BucketName"
