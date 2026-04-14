param(
    [switch]$SkipNuxtStart,
    [switch]$AutoApprove
)

$ErrorActionPreference = "Stop"

function Write-Section
{
    param([string]$Title)

    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Blue
    Write-Host ""
}

function Invoke-Cleanup
{
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow
    Write-Host "[OK] Server stopped" -ForegroundColor Green
}

function Import-DotEnv
{
    param([string]$Path)

    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()

        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#"))
        {
            return
        }

        $parts = $line.Split("=", 2)
        if ($parts.Count -ne 2)
        {
            return
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        if ($value.Length -ge 2)
        {
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))
            {
                $value = $value.Substring(1, $value.Length - 2)
            }
        }

        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

function Get-MaskedResendKey
{
    param([string]$ApiKey)

    if ( [string]::IsNullOrWhiteSpace($ApiKey))
    {
        return ""
    }

    if ($ApiKey.Length -le 12)
    {
        return "********"
    }

    return "{0}...{1}" -f $ApiKey.Substring(0, 8),$ApiKey.Substring($ApiKey.Length - 4)
}

try
{
    Write-Section "Portfolio Production Testing Environment"

    $envPath = Join-Path $PSScriptRoot ".env"
    if (-not (Test-Path -Path $envPath))
    {
        Write-Host "[ERROR] .env file not found" -ForegroundColor Red
        exit 1
    }

    Import-DotEnv -Path $envPath

    Write-Host "Checking Production Configuration..." -ForegroundColor Blue
    Write-Host ""

    $missingVars = New-Object System.Collections.Generic.List[string]

    if ( [string]::IsNullOrWhiteSpace($env:DATABASE_URL))
    {
        $missingVars.Add("DATABASE_URL")
    }
    else
    {
        Write-Host "[OK] Supabase Database: Configured" -ForegroundColor Green
        $dbMatch = [regex]::Match($env:DATABASE_URL, "@([^:]+):")
        if ($dbMatch.Success)
        {
            Write-Host "   Host: $( $dbMatch.Groups[1].Value )"
        }
    }

    if ( [string]::IsNullOrWhiteSpace($env:RESEND_API_KEY))
    {
        $missingVars.Add("RESEND_API_KEY")
    }
    else
    {
        Write-Host "[OK] Resend API: Configured" -ForegroundColor Green
        Write-Host "   Key: $( Get-MaskedResendKey -ApiKey $env:RESEND_API_KEY )"
    }

    if ($env:USE_RESEND -eq "true")
    {
        Write-Host "[OK] Email Provider: Resend (Production)" -ForegroundColor Green
    }
    else
    {
        Write-Host "[WARN] USE_RESEND is not set to 'true'" -ForegroundColor Yellow
        Write-Host "[WARN] Emails will use SMTP configuration instead of Resend" -ForegroundColor Yellow
    }

    if ([string]::IsNullOrWhiteSpace($env:ADMIN_USERNAME) -or [string]::IsNullOrWhiteSpace($env:ADMIN_PASSWORD) -or [string]::IsNullOrWhiteSpace($env:ADMIN_EMAIL))
    {
        Write-Host "[WARN] Admin credentials incomplete" -ForegroundColor Yellow

        if ( [string]::IsNullOrWhiteSpace($env:ADMIN_USERNAME))
        {
            $missingVars.Add("ADMIN_USERNAME")
        }
        if ( [string]::IsNullOrWhiteSpace($env:ADMIN_PASSWORD))
        {
            $missingVars.Add("ADMIN_PASSWORD")
        }
        if ( [string]::IsNullOrWhiteSpace($env:ADMIN_EMAIL))
        {
            $missingVars.Add("ADMIN_EMAIL")
        }
    }
    else
    {
        Write-Host "[OK] Admin User: $( $env:ADMIN_USERNAME )" -ForegroundColor Green
    }

    if ([string]::IsNullOrWhiteSpace($env:NUXT_RECAPTCHA_SECRET_KEY) -or [string]::IsNullOrWhiteSpace($env:NUXT_PUBLIC_RECAPTCHA_SITE_KEY))
    {
        Write-Host "[WARN] reCAPTCHA not configured" -ForegroundColor Yellow
    }
    else
    {
        Write-Host "[OK] reCAPTCHA: Configured" -ForegroundColor Green
    }

    if ( [string]::IsNullOrWhiteSpace($env:NUXT_PUBLIC_GITHUB_TOKEN))
    {
        Write-Host "[WARN] GitHub Token not set (limited API rate)" -ForegroundColor Yellow
    }
    else
    {
        Write-Host "[OK] GitHub Token: Configured" -ForegroundColor Green
    }

    if ( [string]::IsNullOrWhiteSpace($env:JWT_SECRET))
    {
        $missingVars.Add("JWT_SECRET")
    }
    else
    {
        Write-Host "[OK] JWT Secret: Configured" -ForegroundColor Green
    }

    Write-Host ""

    if ($missingVars.Count -gt 0)
    {
        Write-Host "[ERROR] Missing required environment variables:" -ForegroundColor Red
        $missingVars | Select-Object -Unique | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }

        Write-Host ""
        Write-Host "Please add these to your .env file before continuing." -ForegroundColor Yellow
        exit 1
    }

    Write-Section "PRODUCTION MODE WARNING"
    Write-Host "This script runs in PRODUCTION mode with:" -ForegroundColor Yellow
    Write-Host "  - Real Supabase Database" -ForegroundColor Yellow
    Write-Host "  - Real Resend Email Service" -ForegroundColor Yellow
    Write-Host "  - reCAPTCHA Validation Enabled" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions performed will affect PRODUCTION data." -ForegroundColor Red
    Write-Host "Emails sent will be delivered to real recipients." -ForegroundColor Red
    Write-Host ""

    $approved = $false
    if ($AutoApprove)
    {
        $approved = $true
    }
    else
    {
        $reply = Read-Host "Do you want to continue? [y/N]"
        if ($reply -match "^[Yy]$")
        {
            $approved = $true
        }
    }

    if (-not $approved)
    {
        Write-Host "Cancelled by user." -ForegroundColor Blue
        exit 0
    }

    Write-Host ""
    Write-Section "Production Environment Details"
    Write-Host "Database:" -ForegroundColor Blue
    Write-Host "  - Provider: Supabase (PostgreSQL)"
    Write-Host "  - Connection: Via DATABASE_URL"
    Write-Host ""
    Write-Host "Email Service:" -ForegroundColor Blue
    Write-Host "  - Provider: Resend"
    Write-Host "  - From: $( $env:SMTP_FROM )"
    Write-Host "  - Contact: $( $env:CONTACT_EMAIL )"
    Write-Host ""
    Write-Host "Security:" -ForegroundColor Blue
    Write-Host "  - reCAPTCHA: Enabled (v3)"
    Write-Host "  - JWT Auth: Enabled"
    Write-Host ""
    Write-Host "Testing Features Available:" -ForegroundColor Blue
    Write-Host "  - Contact Form (sends real emails via Resend)"
    Write-Host "  - Newsletter Subscription (saves to Supabase)"
    Write-Host "  - Admin Login (authenticates against Supabase)"
    Write-Host "  - Blog CMS (reads/writes to Supabase)"
    Write-Host ""

    [Environment]::SetEnvironmentVariable("USE_RESEND", "true", "Process")
    [Environment]::SetEnvironmentVariable("SKIP_RECAPTCHA", "false", "Process")

    Write-Section "Starting Nuxt Dev Server (Production Services)"
    Write-Host "Tips:" -ForegroundColor Yellow
    Write-Host "   - Contact form emails will be sent via Resend"
    Write-Host "   - Newsletter subscriptions will be saved to Supabase"
    Write-Host "   - Admin login: $( $env:ADMIN_USERNAME )"
    Write-Host "   - Hot-reload is ENABLED (development mode)"
    Write-Host "   - Press Ctrl+C to stop the server"
    Write-Host ""

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

