$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$networkIp = (
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress
)

function Test-Port {
  param([int]$Port)

  $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    Select-Object -First 1

  return $null -ne $connection
}

Write-Host ""
Write-Host "Eco-Huella dev"
Write-Host "Frontend: http://localhost:8080"
if ($networkIp) {
  Write-Host "Red local: http://$($networkIp):8080"
}
Write-Host "Backend:  http://localhost:5000/api/health"
Write-Host ""
Write-Host "Para compartir un link publico temporal, publica solo el puerto 8080 desde la pestaña Ports/Puertos de VS Code."
Write-Host "No hace falta publicar el puerto 5000: el frontend usa /api y Vite lo redirige al backend."
Write-Host ""

if (Test-Port 8080) {
  Write-Host "El puerto 8080 ya esta ocupado. Cierra el servidor anterior o libera ese puerto." -ForegroundColor Yellow
  exit 1
}

if (Test-Port 5000) {
  Write-Host "El puerto 5000 ya esta ocupado. Cierra el backend anterior o cambia PORT en backend/.env." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Faltan dependencias del frontend. Ejecuta: npm install" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
  Write-Host "Faltan dependencias del backend. Ejecuta: cd backend; npm install" -ForegroundColor Yellow
  exit 1
}

$backendJob = Start-Job -Name "eco-huella-backend" -ScriptBlock {
  param($Path)
  Set-Location $Path
  npm.cmd run dev
} -ArgumentList $backendPath

$frontendJob = Start-Job -Name "eco-huella-frontend" -ScriptBlock {
  param($Path)
  Set-Location $Path
  npm.cmd run dev
} -ArgumentList $root

try {
  while ($true) {
    foreach ($job in @($backendJob, $frontendJob)) {
      Receive-Job $job

      if ($job.State -in @("Failed", "Stopped", "Completed")) {
        Write-Host ""
        Write-Host "$($job.Name) termino con estado: $($job.State)" -ForegroundColor Red
        exit 1
      }
    }

    Start-Sleep -Seconds 1
  }
}
finally {
  Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
  Remove-Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
}
