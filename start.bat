@echo off
setlocal EnableExtensions EnableDelayedExpansion

title IntervueX - Complete Setup

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo ============================================================
echo             INTERVUEX - COMPLETE SETUP
echo ============================================================
echo.
echo This installer will check and install:
echo.
echo   [1] Git
echo   [2] Node.js 18+
echo   [3] Docker Desktop
echo   [4] MongoDB
echo   [5] Backend dependencies
echo   [6] Frontend dependencies
echo.
echo ============================================================
echo.

REM ============================================================
REM ADMIN CHECK
REM ============================================================

net session >nul 2>&1

if errorlevel 1 (
    echo [INFO] Administrator privileges are required.
    echo.
    echo Restarting setup as Administrator...
    echo.

    powershell -NoProfile -Command ^
        "Start-Process '%~f0' -Verb RunAs"

    exit /b
)

echo [OK] Running with Administrator privileges.
echo.


REM ============================================================
REM CHECK WINGET
REM ============================================================

echo ============================================================
echo Checking Windows Package Manager
echo ============================================================
echo.

where winget >nul 2>&1

if errorlevel 1 (
    echo [ERROR] winget was not found.
    echo.
    echo Windows Package Manager is required to automatically
    echo install Git, Node.js and Docker Desktop.
    echo.
    echo Please update/install "App Installer" from Microsoft Store.
    echo.
    pause
    exit /b 1
)

echo [OK] winget found.
echo.


REM ============================================================
REM INSTALL GIT
REM ============================================================

echo ============================================================
echo 1/6 - Checking Git
echo ============================================================
echo.

where git >nul 2>&1

if not errorlevel 1 (
    for /f "delims=" %%V in ('git --version') do echo [OK] %%V
) else (
    echo [INFO] Git is not installed.
    echo [INFO] Installing Git...

    winget install ^
        --id Git.Git ^
        --exact ^
        --source winget ^
        --accept-source-agreements ^
        --accept-package-agreements ^
        --silent

    if errorlevel 1 (
        echo.
        echo [ERROR] Git installation failed.
        pause
        exit /b 1
    )

    echo [OK] Git installed.
)

echo.


REM ============================================================
REM INSTALL NODE.JS
REM ============================================================

echo ============================================================
echo 2/6 - Checking Node.js
echo ============================================================
echo.

set "NODE_OK=0"

where node >nul 2>&1

if not errorlevel 1 (

    for /f "tokens=1 delims=v." %%A in ('node -v') do set "NODE_MAJOR=%%A"

    set "NODE_MAJOR=!NODE_MAJOR:v=!"

    echo [INFO] Installed Node.js major version: !NODE_MAJOR!

    if !NODE_MAJOR! GEQ 18 (
        echo [OK] Node.js 18+ is installed.
        node -v
        set "NODE_OK=1"
    ) else (
        echo [WARN] Node.js version is older than 18.
    )
)

if "!NODE_OK!"=="0" (

    echo [INFO] Installing Node.js LTS...

    winget install ^
        --id OpenJS.NodeJS.LTS ^
        --exact ^
        --source winget ^
        --accept-source-agreements ^
        --accept-package-agreements ^
        --silent

    if errorlevel 1 (
        echo.
        echo [ERROR] Node.js installation failed.
        pause
        exit /b 1
    )

    echo [OK] Node.js installed.
)

echo.


REM ============================================================
REM REFRESH PATH
REM ============================================================

echo [INFO] Refreshing environment variables...

for /f "delims=" %%A in ('powershell -NoProfile -Command ^
    "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"') do (
    set "PATH=%%A"
)

echo [OK] Environment refreshed.
echo.


REM ============================================================
REM INSTALL DOCKER DESKTOP
REM ============================================================

echo ============================================================
echo 3/6 - Checking Docker Desktop
echo ============================================================
echo.

where docker >nul 2>&1

if not errorlevel 1 (
    echo [OK] Docker command found.
    docker --version
) else (

    echo [INFO] Docker Desktop is not installed.
    echo [INFO] Installing Docker Desktop...
    echo.
    echo This may take several minutes.
    echo.

    winget install ^
        --id Docker.DockerDesktop ^
        --exact ^
        --source winget ^
        --accept-source-agreements ^
        --accept-package-agreements

    if errorlevel 1 (
        echo.
        echo [ERROR] Docker Desktop installation failed.
        echo.
        pause
        exit /b 1
    )

    echo.
    echo [OK] Docker Desktop installed.
    echo.
    echo Docker Desktop may require a Windows restart.
    echo.
)


REM ============================================================
REM START DOCKER DESKTOP
REM ============================================================

echo ============================================================
echo Starting Docker Desktop
echo ============================================================
echo.

set "DOCKER_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"

if exist "%DOCKER_EXE%" (

    echo [INFO] Starting Docker Desktop...

    start "" "%DOCKER_EXE%"

) else (

    echo [WARN] Docker Desktop executable was not found.
    echo [WARN] Please start Docker Desktop manually.
)

echo.
echo [INFO] Waiting for Docker Engine...

set "DOCKER_READY=0"

for /L %%i in (1,1,60) do (

    docker info >nul 2>&1

    if not errorlevel 1 (
        set "DOCKER_READY=1"
        goto docker_ready
    )

    timeout /t 2 /nobreak >nul
)

:docker_ready

if "!DOCKER_READY!"=="0" (
    echo.
    echo [ERROR] Docker Engine did not become ready.
    echo.
    echo Possible reasons:
    echo   - Docker Desktop needs a Windows restart
    echo   - WSL2 is not configured
    echo   - Docker Desktop is still starting
    echo.
    echo Start Docker Desktop manually and run setup.bat again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker Engine is running.
echo.


REM ============================================================
REM CHECK PROJECT
REM ============================================================

echo ============================================================
echo 4/6 - Checking Project
echo ============================================================
echo.

if not exist "%BACKEND%" (
    echo [ERROR] Backend directory not found:
    echo %BACKEND%
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND%\package.json" (
    echo [ERROR] backend\package.json not found.
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND%" (
    echo [ERROR] Frontend directory not found:
    echo %FRONTEND%
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND%\package.json" (
    echo [ERROR] frontend\package.json not found.
    echo.
    pause
    exit /b 1
)

echo [OK] Backend found.
echo [OK] Frontend found.
echo.


REM ============================================================
REM MONGODB
REM ============================================================

echo ============================================================
echo 5/6 - Setting up MongoDB
echo ============================================================
echo.

docker ps --format "{{.Names}}" | findstr /x "intervuex-mongodb" >nul 2>&1

if not errorlevel 1 (
    echo [OK] MongoDB container is already running.
    goto mongo_ready
)

docker ps -a --format "{{.Names}}" | findstr /x "intervuex-mongodb" >nul 2>&1

if not errorlevel 1 (

    echo [INFO] Existing MongoDB container found.
    echo [INFO] Starting it...

    docker start intervuex-mongodb

    if errorlevel 1 (
        echo [ERROR] Could not start MongoDB.
        pause
        exit /b 1
    )

) else (

    echo [INFO] Creating MongoDB container...

    docker run -d ^
        --name intervuex-mongodb ^
        -p 27017:27017 ^
        -v intervuex-mongo-data:/data/db ^
        mongo:8

    if errorlevel 1 (
        echo.
        echo [ERROR] MongoDB container creation failed.
        pause
        exit /b 1
    )
)

echo [OK] MongoDB container started.
echo.
echo [INFO] Waiting for MongoDB...

set "MONGO_READY=0"

for /L %%i in (1,1,30) do (

    docker exec intervuex-mongodb ^
        mongosh --quiet --eval "db.adminCommand({ ping: 1 })" ^
        >nul 2>&1

    if not errorlevel 1 (
        set "MONGO_READY=1"
        goto mongo_ready
    )

    timeout /t 1 /nobreak >nul
)

:mongo_ready

if "!MONGO_READY!"=="0" (

    docker ps --format "{{.Names}}" | findstr /x "intervuex-mongodb" >nul 2>&1

    if errorlevel 1 (
        echo [ERROR] MongoDB is not running.
        echo.
        echo Run:
        echo     docker logs intervuex-mongodb
        echo.
        pause
        exit /b 1
    )
)

echo [OK] MongoDB ready.
echo.


REM ============================================================
REM INSTALL NPM DEPENDENCIES
REM ============================================================

echo ============================================================
echo 6/6 - Installing Project Dependencies
echo ============================================================
echo.

REM ------------------------------------------------------------
REM BACKEND
REM ------------------------------------------------------------

echo ----------------------------------------
echo Backend
echo ----------------------------------------
echo.

cd /d "%BACKEND%"

if exist "node_modules" (
    echo [OK] Backend dependencies already installed.
) else (
    echo [INFO] Running npm install...
    call npm install

    if errorlevel 1 (
        echo.
        echo [ERROR] Backend npm install failed.
        pause
        exit /b 1
    )

    echo [OK] Backend dependencies installed.
)

echo.


REM ------------------------------------------------------------
REM FRONTEND
REM ------------------------------------------------------------

echo ----------------------------------------
echo Frontend
echo ----------------------------------------
echo.

cd /d "%FRONTEND%"

if exist "node_modules" (
    echo [OK] Frontend dependencies already installed.
) else (
    echo [INFO] Running npm install...
    call npm install

    if errorlevel 1 (
        echo.
        echo [ERROR] Frontend npm install failed.
        pause
        exit /b 1
    )

    echo [OK] Frontend dependencies installed.
)

echo.


REM ============================================================
REM START BACKEND
REM ============================================================

echo ============================================================
echo Starting Backend
echo ============================================================
echo.

start "IntervueX Backend" cmd /k ^
    "cd /d ""%BACKEND%"" && node server.js"

echo [OK] Backend started.
echo.


REM ============================================================
REM START FRONTEND
REM ============================================================

echo ============================================================
echo Starting Frontend
echo ============================================================
echo.

timeout /t 3 /nobreak >nul

start "IntervueX Frontend" cmd /k ^
    "cd /d ""%FRONTEND%"" && npm run dev -- --host 0.0.0.0"

echo [OK] Frontend started.
echo.


REM ============================================================
REM COMPLETE
REM ============================================================

echo.
echo ============================================================
echo                 SETUP COMPLETE
echo ============================================================
echo.
echo   Git:        Installed
echo   Node.js:    18+
echo   Docker:     Running
echo   MongoDB:    Running
echo.
echo   Frontend:   http://localhost:5173
echo   Backend:    http://localhost:5000
echo   Health:     http://localhost:5000/api/health
echo   MongoDB:    mongodb://localhost:27017
echo.
echo ============================================================
echo.
echo Backend and Frontend are running in separate windows.
echo.
echo MongoDB container:
echo     intervuex-mongodb
echo.
echo To stop MongoDB:
echo     docker stop intervuex-mongodb
echo.
echo To start MongoDB:
echo     docker start intervuex-mongodb
echo.
echo ============================================================
echo.

pause
exit /b 0