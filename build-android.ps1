# PowerShell script to build Android APK without Expo authentication
Write-Host "Building Android APK without Expo authentication..." -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\android"

Write-Host "Running Gradle build..." -ForegroundColor Cyan
& .\gradlew.bat :app:assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "APK location: $scriptPath\android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can install this APK directly on your Android device." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Build failed with error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Please check the output above for more details." -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")