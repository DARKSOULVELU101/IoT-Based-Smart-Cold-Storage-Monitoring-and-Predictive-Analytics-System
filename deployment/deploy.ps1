<#
.SYNOPSIS
    Deployment script for IoT Analytics Suite.

.DESCRIPTION
    Checks prerequisites, installs dependencies, runs database migrations,
    builds frontend, and deploys both backend and frontend.

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -SkipFrontend
    .\deploy.ps1 -SkipBackend
    .\deploy.ps1 -DryRun
#>

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$DryRun,
    [switch]$SkipPrereqs
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " IoT Analytics Suite - Deployment Script" -ForegroundColor Cyan
Write-Host " Version 2.0.0" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Prerequisite Checks ---
function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Write-Check {
    param([string]$Name, [bool]$Passed)
    if ($Passed) {
        Write-Host "  [OK] $Name" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $Name" -ForegroundColor Red
    }
}

if (-not $SkipPrereqs) {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow

    $pythonOk = Test-CommandExists "python"
    $pipOk = Test-CommandExists "pip"
    $nodeOk = Test-CommandExists "node"
    $npmOk = Test-CommandExists "npm"
    $gitOk = Test-CommandExists "git"
    $vercelOk = Test-CommandExists "vercel"

    Write-Check "Python" $pythonOk
    Write-Check "pip" $pipOk
    Write-Check "Node.js" $nodeOk
    Write-Check "npm" $npmOk
    Write-Check "Git" $gitOk
    Write-Check "Vercel CLI" $vercelOk

    if (-not $pythonOk -or -not $nodeOk -or -not $gitOk) {
        Write-Host ""
        Write-Host "ERROR: Missing required tools. Install them and try again." -ForegroundColor Red
        exit 1
    }

    # Check Python version
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python 3\.(\d+)") {
        $minor = [int]$Matches[1]
        if ($minor -lt 11) {
            Write-Host "WARNING: Python 3.11+ recommended (found: $pythonVersion)" -ForegroundColor Yellow
        }
    }

    # Check Node version
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(\d+)") {
        $major = [int]$Matches[1]
        if ($major -lt 18) {
            Write-Host "WARNING: Node.js 18+ recommended (found: $nodeVersion)" -ForegroundColor Yellow
        }
    }

    Write-Host ""
}

# --- Backend Setup ---
if (-not $SkipBackend) {
    Write-Host "Setting up backend..." -ForegroundColor Yellow

    $backendDir = Join-Path $ProjectRoot "backend"

    if (-not (Test-Path (Join-Path $backendDir "venv"))) {
        Write-Host "  Creating Python virtual environment..."
        Push-Location $backendDir
        python -m venv venv
        Pop-Location
    }

    Write-Host "  Activating virtual environment and installing dependencies..."
    $venvActivate = Join-Path $backendDir "venv\Scripts\Activate.ps1"
    & $venvActivate

    pip install -r (Join-Path $backendDir "requirements.txt") --quiet

    # Check for .env
    $envFile = Join-Path $backendDir ".env"
    if (-not (Test-Path $envFile)) {
        Write-Host "  .env not found. Creating from template..." -ForegroundColor Yellow
        $templateFile = Join-Path $ProjectRoot "deployment\.env.backend.example"
        if (Test-Path $templateFile) {
            Copy-Item $templateFile $envFile
            Write-Host "  Please edit backend\.env with your DATABASE_URL and other settings." -ForegroundColor Yellow
        } else {
            Write-Host "  WARNING: No .env template found. Please create backend\.env manually." -ForegroundColor Yellow
        }
    }

    Write-Host "  Backend setup complete." -ForegroundColor Green
    Write-Host ""
}

# --- Frontend Build ---
if (-not $SkipFrontend) {
    Write-Host "Setting up frontend..." -ForegroundColor Yellow

    $frontendDir = Join-Path $ProjectRoot "frontend"

    # Check for .env
    $envFile = Join-Path $frontendDir ".env"
    if (-not (Test-Path $envFile)) {
        Write-Host "  .env not found. Creating from template..." -ForegroundColor Yellow
        $templateFile = Join-Path $ProjectRoot "deployment\.env.frontend.example"
        if (Test-Path $templateFile) {
            Copy-Item $templateFile $envFile
            Write-Host "  Please edit frontend\.env with your VITE_API_URL." -ForegroundColor Yellow
        }
    }

    Write-Host "  Installing npm dependencies..."
    Push-Location $frontendDir
    npm install --silent
    Pop-Location

    Write-Host "  Building frontend..."
    Push-Location $frontendDir
    npm run build
    Pop-Location

    if (-not $?) {
        Write-Host "  ERROR: Frontend build failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "  Frontend build complete." -ForegroundColor Green
    Write-Host ""
}

# --- Deploy to Render ---
if (-not $SkipBackend -and -not $DryRun) {
    Write-Host "Deploying backend to Render..." -ForegroundColor Yellow
    Write-Host "  NOTE: Ensure you have configured Render service and environment variables." -ForegroundColor Yellow
    Write-Host "  Backend will auto-deploy when you push to GitHub (if auto-deploy is enabled)."
    Write-Host ""
}

# --- Deploy to Vercel ---
if (-not $SkipFrontend -and -not $DryRun) {
    if ($vercelOk) {
        Write-Host "Deploying frontend to Vercel..." -ForegroundColor Yellow
        Push-Location (Join-Path $ProjectRoot "frontend")
        $confirm = Read-Host "Deploy to production? (y/n)"
        if ($confirm -eq "y") {
            vercel --prod --yes
        } else {
            Write-Host "  Skipping Vercel deployment." -ForegroundColor Yellow
        }
        Pop-Location
    } else {
        Write-Host "  Vercel CLI not found. Deploy manually:" -ForegroundColor Yellow
        Write-Host "    npm install -g vercel" -ForegroundColor White
        Write-Host "    cd frontend && vercel --prod" -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Deployment script complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify backend health: curl https://YOUR_RENDER_URL/api/health"
Write-Host "  2. Open frontend: https://YOUR_VERCEL_URL"
Write-Host "  3. Update API_URL in Wokwi sketch and start simulation"
Write-Host ""
