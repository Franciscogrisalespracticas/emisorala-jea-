Set-Location $PSScriptRoot
if (-not (Test-Path "$PSScriptRoot\assets\img\municipalities\pereira.jpg")) {
  & "$PSScriptRoot\PREPARAR_MEDIA_LOCAL.ps1" -NoPause
}
Start-Process "http://localhost:8080"
if (Get-Command py -ErrorAction SilentlyContinue) { py -m http.server 8080 } else { python -m http.server 8080 }
