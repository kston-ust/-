$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$LogDir = Join-Path $ProjectRoot "runtime-logs"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message" -ForegroundColor Cyan
}

function Test-ListeningPort($Port) {
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Find-FreePort($PreferredPort, $LastPort) {
  for ($port = $PreferredPort; $port -le $LastPort; $port++) {
    if (-not (Test-ListeningPort $port)) {
      return $port
    }
  }
  throw "没有找到可用端口：$PreferredPort - $LastPort"
}

function Wait-HttpReady($Url, $Name) {
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Write-Host "$Name 已就绪：$Url" -ForegroundColor Green
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "$Name 未能按时启动：$Url"
}

function Open-AppUrl($Url, $Name) {
  try {
    Start-Process $Url | Out-Null
    Write-Host "$Name 已自动打开：$Url" -ForegroundColor Green
  } catch {
    Write-Host "$Name 自动打开失败，请手动打开：$Url" -ForegroundColor Yellow
  }
}

function Resolve-Python() {
  $parent = Split-Path -Parent $ProjectRoot
  $candidates = @(
    (Join-Path $ProjectRoot ".venv\Scripts\python.exe"),
    (Join-Path $parent "xiyu-yangdu-trading-publish\.venv\Scripts\python.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
  if ($pythonCommand) {
    return $pythonCommand.Source
  }

  throw "未找到 Python。请先安装 Python，或准备 .venv 虚拟环境。"
}

if (-not (Test-Path (Join-Path $BackendDir "app\main.py"))) {
  throw "未找到后端入口：$BackendDir\app\main.py"
}

if (-not (Test-Path (Join-Path $FrontendDir "package.json"))) {
  throw "未找到前端入口：$FrontendDir\package.json"
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Python = Resolve-Python
$NpmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $NpmCommand) {
  $NpmCommand = Get-Command npm -ErrorAction SilentlyContinue
}
if (-not $NpmCommand) {
  throw "未找到 npm。请先安装 Node.js。"
}

$BackendPort = Find-FreePort 8000 8099
$FrontendPort = Find-FreePort 5173 5273
$BackendUrl = "http://127.0.0.1:$BackendPort"
$FrontendUrl = "http://127.0.0.1:$FrontendPort"
$AdminUrl = "$BackendUrl/admin"

Write-Step "准备前端依赖"
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
  Write-Host "未检测到 node_modules，正在执行 npm install..." -ForegroundColor Yellow
  Push-Location $FrontendDir
  try {
    & $NpmCommand.Source install
  } finally {
    Pop-Location
  }
} else {
  Write-Host "已检测到 node_modules，跳过 npm install。" -ForegroundColor DarkGray
}

$BackendOut = Join-Path $LogDir "backend-$Stamp.out.log"
$BackendErr = Join-Path $LogDir "backend-$Stamp.err.log"
$FrontendOut = Join-Path $LogDir "frontend-$Stamp.out.log"
$FrontendErr = Join-Path $LogDir "frontend-$Stamp.err.log"

Write-Step "启动后端"
Start-Process `
  -WindowStyle Hidden `
  -FilePath $Python `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$BackendPort" `
  -WorkingDirectory $BackendDir `
  -RedirectStandardOutput $BackendOut `
  -RedirectStandardError $BackendErr

Write-Step "启动前端"
$frontendCommand = "set VITE_API_BASE=$BackendUrl&& npm run dev -- --host 127.0.0.1 --port $FrontendPort"
Start-Process `
  -WindowStyle Hidden `
  -FilePath "cmd.exe" `
  -ArgumentList "/c", $frontendCommand `
  -WorkingDirectory $FrontendDir `
  -RedirectStandardOutput $FrontendOut `
  -RedirectStandardError $FrontendErr

Write-Step "等待服务就绪"
Wait-HttpReady "$BackendUrl/api/health" "后端"
Wait-HttpReady $FrontendUrl "前端"

Write-Host ""
Write-Host "启动完成，正在自动打开下面链接：" -ForegroundColor Green
Write-Host "前端商城：$FrontendUrl" -ForegroundColor White
Write-Host "后端后台：$AdminUrl" -ForegroundColor White
Write-Host "后端接口：$BackendUrl" -ForegroundColor White
Write-Host ""
Write-Host "商户演示账号：hht / 123456" -ForegroundColor Yellow
Write-Host "日志目录：$LogDir" -ForegroundColor DarkGray
Write-Host ""

Write-Step "打开浏览器"
Open-AppUrl $FrontendUrl "前端商城"
Open-AppUrl $AdminUrl "后端后台"
