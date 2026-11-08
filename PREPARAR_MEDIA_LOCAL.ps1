param([switch]$NoPause)
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path "$root\assets\img\municipalities" | Out-Null
New-Item -ItemType Directory -Force -Path "$root\assets\audio\open" | Out-Null

$images = @{
  "pereira.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Plaza%20Bolivar%20Pereira.JPG"
  "dosquebradas.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vista%20de%20Dosquebradas%20y%20Pereira%20desde%20el%20alto%20del%20Boquer%C3%B3n%20-%20Flickr%20-%20Alejandro%20Bayer.jpg"
  "santa-rosa-de-cabal.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Santa%20Rosa%20de%20Cabal%20-%20Desde%20Don%20Lolo.jpg"
  "la-virginia.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Paisaje%20La%20Virginia%2C%20Risaralda.jpg"
  "la-celia.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Panoramico%20-%20La%20Celia%20Risaralda%20-%20panoramio.jpg"
  "apia.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ap%C3%ADa%20-%20Risaralda%20%2813961150287%29.jpg"
  "balboa.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Balboa%20risaralda%20-%20panoramio.jpg"
  "belen-de-umbria.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Belen%20de%20umbria.jpg"
  "guatica.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gu%C3%A1tica%20visto%20desde%20la%20Via%20Anserma%20-%20Riosucio%20-%20panoramio.jpg"
  "marsella.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Marsella.jpg"
  "mistrato.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Iglesia%20de%20San%20Antonio%20del%20Cham%C3%AD.JPG"
  "pueblo-rico.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pueblo%20Rico%20Rda.jpg"
  "quinchia.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Cerro%20Batero%20Quinch%C3%ADa.jpg"
  "santuario.jpg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Santuario%20%28Risaralda%29.jpg"
}

$audio = @{
  "pereira.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Cachiri.ogg"
  "dosquebradas.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flor%20de%20Romero..ogg"
  "santa-rosa-de-cabal.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ojito%20de%20Agua.ogg"
  "la-virginia.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/La%20Guayabita.ogg"
  "la-celia.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/%C3%81ngela.ogg"
  "apia.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Siquele.ogg"
  "balboa.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rub%20a%20Dub.ogg"
  "belen-de-umbria.mp3" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jorge%20%C3%81%C3%B1ez%20Avenda%C3%B1o%20and%20Alcides%20Brice%C3%B1o%20performing%20%22Coplas%20del%20Terru%C3%B1o%22%20in%20December%201927.mp3"
  "guatica.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Cumbia%20Paname%C3%B1a.ogg"
  "marsella.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/La%20aparici%C3%B3n.ogg"
  "mistrato.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Llano%20de%20piedra%20colaco%20cortez~1.ogg"
  "pueblo-rico.oga" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/National%20anthem%20of%20Gran%20Colombia.oga"
  "quinchia.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Song.ogg"
  "santuario.ogg" = "https://commons.wikimedia.org/wiki/Special:Redirect/file/La%20puya%20rebelde.ogg"
}

function Download-Set($set, $folder) {
  foreach ($name in $set.Keys) {
    $dest = Join-Path $folder $name
    if (Test-Path $dest) { Write-Host "Ya existe: $name"; continue }
    try {
      Write-Host "Descargando $name..."
      Invoke-WebRequest -Uri $set[$name] -OutFile $dest -MaximumRedirection 10 -UseBasicParsing
    } catch { Write-Warning "No se pudo descargar $name : $($_.Exception.Message)" }
  }
}
Download-Set $images "$root\assets\img\municipalities"
Download-Set $audio "$root\assets\audio\open"
Write-Host "Proceso terminado. Revisa docs\MEDIA_CREDITS.md y docs\AUDIO_LICENSES.md."
if (-not $NoPause) { Read-Host "Presiona Enter para cerrar" }
