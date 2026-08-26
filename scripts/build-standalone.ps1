$ErrorActionPreference = 'Stop'

function Get-MimeType([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.webp' { 'image/webp' }
    '.svg' { 'image/svg+xml' }
    '.woff' { 'font/woff' }
    '.woff2' { 'font/woff2' }
    default { 'application/octet-stream' }
  }
}

function Get-DataUri([string]$Path) {
  $mime = Get-MimeType $Path
  $bytes = [IO.File]::ReadAllBytes($Path)
  'data:' + $mime + ';base64,' + [Convert]::ToBase64String($bytes)
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = Join-Path $projectRoot 'dist'
$artifactRoot = Join-Path $projectRoot 'artifacts'
$indexPath = Join-Path $distRoot 'index.html'
$html = [IO.File]::ReadAllText($indexPath)

$scriptMatch = [regex]::Match($html, '<script type="module" crossorigin src="(?<path>[^"]+)"></script>')
$styleMatch = [regex]::Match($html, '<link rel="stylesheet" crossorigin href="(?<path>[^"]+)">')
if (-not $scriptMatch.Success -or -not $styleMatch.Success) { throw 'Built script or stylesheet was not found.' }

$scriptPath = Join-Path $distRoot $scriptMatch.Groups['path'].Value.TrimStart('.', '/')
$stylePath = Join-Path $distRoot $styleMatch.Groups['path'].Value.TrimStart('.', '/')
$script = [IO.File]::ReadAllText($scriptPath)
$style = [IO.File]::ReadAllText($stylePath)

$style = [regex]::Replace($style, 'url\((?<quote>["'']?)(?<path>(?:\.\/|\/)assets\/[^)"'']+)(?:\k<quote>)\)', {
  param($match)
  $assetRef = $match.Groups['path'].Value
  if ($assetRef.StartsWith('./')) {
    $assetPath = Join-Path (Split-Path -Parent $stylePath) $assetRef.Substring(2)
  } else {
    $assetPath = Join-Path $distRoot $assetRef.TrimStart('/')
  }
  if (Test-Path -LiteralPath $assetPath) { 'url("' + (Get-DataUri $assetPath) + '")' } else { $match.Value }
})

$script = [regex]::Replace($script, '/assets/(?<path>[A-Za-z0-9_./-]+)', {
  param($match)
  $assetPath = Join-Path (Join-Path $projectRoot 'public\assets') $match.Groups['path'].Value
  if (Test-Path -LiteralPath $assetPath) { Get-DataUri $assetPath } else { $match.Value }
})

$html = $html.Replace($scriptMatch.Value, '<script>' + $script + '</script>')
$html = $html.Replace($styleMatch.Value, '<style>' + $style + '</style>')
$html = $html.Replace('<script type="module"', '<script')
$html = $html -replace "`r`n?", "`n"

if (-not (Test-Path -LiteralPath $artifactRoot)) {
  New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
}

$primaryOutput = Join-Path $artifactRoot 'AttractiveMen.html'
$legacyOutput = Join-Path $projectRoot 'attractiveme.html'
[IO.File]::WriteAllText($primaryOutput, $html, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($legacyOutput, $html, [Text.UTF8Encoding]::new($false))

Write-Output "Created $primaryOutput"
Write-Output "Created $legacyOutput"
