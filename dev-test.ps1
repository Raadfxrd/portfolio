param(
    [switch]$SkipNuxtStart
)

$ErrorActionPreference = "Stop"

$script:MailpitProcess = $null
$script:MailpitLogPath = Join-Path $env:TEMP "mailpit.log"
$script:MailpitErrLogPath = Join-Path $env:TEMP "mailpit-error.log"
$script:CleanupRan = $false

function Refresh-Path
{
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Get-MailpitCommand
{
    return Get-Command mailpit -ErrorAction SilentlyContinue
}

function Install-MailpitIfMissing
{
    $mailpitCommand = Get-MailpitCommand
    if ($null -ne $mailpitCommand)
    {
        return $mailpitCommand
    }

    Write-Host "[WARN] Mailpit is not installed or not on PATH." -ForegroundColor Yellow
    Write-Host "Attempting automatic install..." -ForegroundColor Yellow

    $installed = $false

    if (Get-Command winget -ErrorAction SilentlyContinue)
    {
        Write-Host "Trying installation with winget..." -ForegroundColor Blue
        try
        {
            winget install -e --id axllent.mailpit --accept-package-agreements --accept-source-agreements --silent | Out-Null
            if ($LASTEXITCODE -eq 0)
            {
                $installed = $true
            }
        }
        catch
        {
            Write-Host "[WARN] winget install failed: $( $_.Exception.Message )" -ForegroundColor Yellow
        }
    }

    if (-not $installed -and (Get-Command choco -ErrorAction SilentlyContinue))
    {
        Write-Host "Trying installation with Chocolatey..." -ForegroundColor Blue
        try
        {
            choco install mailpit -y --no-progress | Out-Null
            if ($LASTEXITCODE -eq 0)
            {
                $installed = $true
            }
        }
        catch
        {
            Write-Host "[WARN] Chocolatey install failed: $( $_.Exception.Message )" -ForegroundColor Yellow
        }
    }

    if (-not $installed -and (Get-Command scoop -ErrorAction SilentlyContinue))
    {
        Write-Host "Trying installation with Scoop..." -ForegroundColor Blue
        try
        {
            scoop install mailpit | Out-Null
            if ($LASTEXITCODE -eq 0)
            {
                $installed = $true
            }
        }
        catch
        {
            Write-Host "[WARN] Scoop install failed: $( $_.Exception.Message )" -ForegroundColor Yellow
        }
    }

    Refresh-Path
    $mailpitCommand = Get-MailpitCommand
    if ($null -ne $mailpitCommand)
    {
        Write-Host "[OK] Mailpit installed successfully." -ForegroundColor Green
        return $mailpitCommand
    }

    Write-Host "[WARN] Could not auto-install Mailpit." -ForegroundColor Yellow
    Write-Host "       Install manually with one of these commands:" -ForegroundColor Yellow
    Write-Host "       winget install -e --id axllent.mailpit"
    Write-Host "       choco install mailpit -y"
    Write-Host "       scoop install mailpit"
    Write-Host ""

    return $null
}

function Write-Section
{
    param([string]$Title)

    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host ""
}

function Test-PortInUse
{
    param([int]$Port)

    try
    {
        return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop)
    }
    catch
    {
        $netstat = netstat -ano | Select-String -Pattern (":$Port\s")
        return [bool]$netstat
    }
}

function Stop-MailProcesses
{
    foreach ($processName in @("mailpit", "mailhog", "Mailpit", "MailHog"))
    {
        Get-Process -Name $processName -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-Cleanup
{
    if ($script:CleanupRan)
    {
        return
    }

    $script:CleanupRan = $true

    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow

    if ($null -ne $script:MailpitProcess -and -not $script:MailpitProcess.HasExited)
    {
        Stop-Process -Id $script:MailpitProcess.Id -Force -ErrorAction SilentlyContinue
    }

    Stop-MailProcesses
    Write-Host "[OK] Mailpit stopped" -ForegroundColor Green

    Remove-Item -Path $script:MailpitLogPath -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $script:MailpitErrLogPath -Force -ErrorAction SilentlyContinue

    $localMailPath = Join-Path $PSScriptRoot ".local-mails"
    if (Test-Path -Path $localMailPath)
    {
        $mailCount = @(Get-ChildItem -Path $localMailPath -File -ErrorAction SilentlyContinue).Count
        if ($mailCount -gt 0)
        {
            Write-Host "Found $mailCount unsent email(s) in .local-mails/" -ForegroundColor Blue
            Write-Host "View them with: Get-ChildItem .local-mails" -ForegroundColor Blue
        }
    }
}

try
{
    Write-Section "Portfolio Testing Environment"

    $mailpitCommand = Install-MailpitIfMissing
    if ($null -eq $mailpitCommand)
    {
        Write-Host "[WARN] Continuing without Mailpit." -ForegroundColor Yellow
        Write-Host "[WARN] Contact form emails will be saved to .local-mails/ folder" -ForegroundColor Yellow
        Write-Host ""
    }
    else
    {
        Write-Host "Starting Mailpit..." -ForegroundColor Blue
        Write-Host "   SMTP: localhost:2525"
        Write-Host "   Web UI: http://localhost:8025"
        Write-Host ""

        Stop-MailProcesses
        Start-Sleep -Seconds 1

        Write-Host "Waiting for ports to be available..."
        for ($i = 0; $i -lt 10; $i++) {
            if (-not (Test-PortInUse -Port 2525) -and -not (Test-PortInUse -Port 8025))
            {
                break
            }
            Start-Sleep -Seconds 1
        }

        $script:MailpitProcess = Start-Process -FilePath $mailpitCommand.Source `
            -ArgumentList @("--smtp", "127.0.0.1:2525", "--listen", "127.0.0.1:8025") `
            -RedirectStandardOutput $script:MailpitLogPath `
            -RedirectStandardError $script:MailpitErrLogPath `
            -PassThru

        Write-Host "Waiting for Mailpit to start..."
        $ready = $false
        for ($i = 0; $i -lt 15; $i++) {
            if ((Test-PortInUse -Port 2525) -and (Test-PortInUse -Port 8025))
            {
                $ready = $true
                break
            }
            Start-Sleep -Seconds 1
        }

        if ($ready -and -not $script:MailpitProcess.HasExited)
        {
            Write-Host "[OK] Mailpit is running (PID: $( $script:MailpitProcess.Id ))" -ForegroundColor Green
            Write-Host "[OK] SMTP server ready on port 2525" -ForegroundColor Green
            Write-Host "[OK] Web UI ready at http://localhost:8025" -ForegroundColor Green
        }
        else
        {
            Write-Host "[WARN] Mailpit may not have started correctly" -ForegroundColor Yellow
            Write-Host "[WARN] Contact form emails will be saved to .local-mails/ folder" -ForegroundColor Yellow

            if (Test-Path -Path $script:MailpitLogPath)
            {
                Write-Host "Check $script:MailpitLogPath for errors"
                Get-Content -Path $script:MailpitLogPath -Tail 10
            }

            if (Test-Path -Path $script:MailpitErrLogPath)
            {
                Write-Host "Check $script:MailpitErrLogPath for errors"
                Get-Content -Path $script:MailpitErrLogPath -Tail 10
            }
        }
    }

    Write-Host ""
    Write-Section "Starting Nuxt Dev Server"

    # Set to false so reCAPTCHA validation is enabled during local tests.
    $env:SKIP_RECAPTCHA = "false"

    if ($SkipNuxtStart)
    {
        Write-Host "Skipping 'npm run dev' because -SkipNuxtStart was provided." -ForegroundColor Yellow
    }
    else
    {
        npm run dev
    }
}
finally
{
    Invoke-Cleanup
}

