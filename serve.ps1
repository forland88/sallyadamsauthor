# Minimal static HTTP server for Sally Adams site
param([int]$Port = 0)

# Honour PORT env variable (set by preview tools / launch.json)
if ($Port -eq 0) {
    $envPort = $env:PORT
    $Port = if ($envPort) { [int]$envPort } else { 3000 }
}

$root = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $root) { $root = (Get-Location).Path }
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()

Write-Host "Server running at http://localhost:$Port"

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.webp' = 'image/webp'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
    '.json' = 'application/json'
    '.txt'  = 'text/plain; charset=utf-8'
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($urlPath -eq '/') { $urlPath = '/index.html' }

    $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentType = $contentType
        $res.ContentLength64 = $bytes.Length
        $res.StatusCode = 200
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>$urlPath</p>")
        $res.ContentType = 'text/html; charset=utf-8'
        $res.ContentLength64 = $body.Length
        $res.StatusCode = 404
        $res.OutputStream.Write($body, 0, $body.Length)
    }

    $res.OutputStream.Close()
}
