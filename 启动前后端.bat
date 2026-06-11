@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$script = Get-ChildItem -LiteralPath '%~dp0' -Filter '*.ps1' | Select-Object -First 1; if (-not $script) { throw 'No PowerShell startup script found.' }; & $script.FullName"
echo.
pause
