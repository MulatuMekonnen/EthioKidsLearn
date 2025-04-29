@echo off
echo Building Android APK without Expo authentication...
echo.

cd %~dp0\android

echo Running Gradle build...
call .\gradlew.bat :app:assembleDebug

if %ERRORLEVEL% == 0 (
    echo.
    echo Build completed successfully!
    echo APK location: %~dp0\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo You can install this APK directly on your Android device.
) else (
    echo.
    echo Build failed with error code: %ERRORLEVEL%
    echo Please check the output above for more details.
)

pause