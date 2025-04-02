# List of ports to check and kill if active
$ports = @(7000, 8000, 5000)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process using port $port (PID: $process)"
    } else {
        Write-Host "No process found using port $port"
    }
}

# Start backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd backend; npm run server`""

# Start frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd frontend; npm run dev`""