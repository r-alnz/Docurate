# Find process using port 7000
$processId = Get-NetTCPConnection -LocalPort 7000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

# Kill the process if found
if ($processId) {
    Stop-Process -Id $processId -Force
}

# Start backend
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd backend; npm run server`""

# Start frontend
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd frontend; npm run dev`""