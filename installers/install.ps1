# Antigravity 2.0 Global Command Installer (PowerShell)
# 
# Install globally by running this one-liner in your PowerShell terminal:
# irm https://raw.githubusercontent.com/Danny0821/Senfide-Engine/master/installers/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    Installing Antigravity Scaffolder System-Wide CLI    " -ForegroundColor Cyan
Write-Host "=========================================================\n" -ForegroundColor Cyan

try {
    # 1. Environment Verification
    Write-Host "Step 1: Checking environment prerequisites..." -ForegroundColor Yellow
    
    # Verify Node.js
    try {
        $nodeVer = & node -v 2>$null
        Write-Host "  ✓ Node.js detected: $nodeVer" -ForegroundColor Green
    } catch {
        Write-Error "Node.js is required to execute generated scripts but was not detected. Please install Node.js (>=18.0.0) from https://nodejs.org/"
    }

    # 2. Resolve target directories
    Write-Host "`nStep 2: Resolving global directories..." -ForegroundColor Yellow
    
    $globalSkillsDirs = @(
        [System.IO.Path]::Combine($Home, ".gemini\skills"),
        [System.IO.Path]::Combine($Home, ".gemini\antigravity\skills"),
        [System.IO.Path]::Combine($Home, ".gemini\antigravity-cli\skills"),
        [System.IO.Path]::Combine($Home, ".gemini\config\skills")
    )

    # 3. Source manifest deployment
    Write-Host "`nStep 3: Deploying command manifests..." -ForegroundColor Yellow
    
    $githubRawBase = "https://raw.githubusercontent.com/Danny0821/Senfide-Engine/master"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    foreach ($dir in $globalSkillsDirs) {
        Write-Host "  Synchronizing manifests to: $dir" -ForegroundColor Gray
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }

        # Clean legacy flat generate.md file
        $legacyFile = Join-Path $dir "generate.md"
        if (Test-Path $legacyFile) {
            Remove-Item -Path $legacyFile -Force
        }

        # 3a. Install /generate command
        $genDir = Join-Path $dir "generate"
        if (-not (Test-Path $genDir)) {
            New-Item -ItemType Directory -Force -Path $genDir | Out-Null
        }
        $genSkillPath = Join-Path $genDir "SKILL.md"
        $genUrl = "$githubRawBase/command_manifests/generate.md"
        Invoke-WebRequest -Uri $genUrl -OutFile $genSkillPath -UseBasicParsing
        Write-Host "    ✓ Registered /sfe-gen command" -ForegroundColor Green

        # 3b. Install /interview (agentic-interviewer) command
        $intDir = Join-Path $dir "agentic-interviewer"
        if (Test-Path $intDir) {
            Remove-Item -Path $intDir -Recurse -Force | Out-Null
        }
        New-Item -ItemType Directory -Force -Path $intDir | Out-Null
        
        $filesToFetch = @("SKILL.md", "interview.json", "lessons_index.md", "playbook.md")
        foreach ($file in $filesToFetch) {
            $targetFilePath = Join-Path $intDir $file
            $fileUrl = "$githubRawBase/command_manifests/agentic-interviewer/$file"
            Invoke-WebRequest -Uri $fileUrl -OutFile $targetFilePath -UseBasicParsing
        }
        Write-Host "    ✓ Registered /sfe-interview command" -ForegroundColor Green

        # 3c. Install /grill-blueprint (grill-blueprint) command
        $bluDir = Join-Path $dir "grill-blueprint"
        if (Test-Path $bluDir) {
            Remove-Item -Path $bluDir -Recurse -Force | Out-Null
        }
        New-Item -ItemType Directory -Force -Path $bluDir | Out-Null
        
        foreach ($file in $filesToFetch) {
            $targetFilePath = Join-Path $bluDir $file
            $fileUrl = "$githubRawBase/command_manifests/grill-blueprint/$file"
            Invoke-WebRequest -Uri $fileUrl -OutFile $targetFilePath -UseBasicParsing
        }
        Write-Host "    ✓ Registered /sfe-blueprint command" -ForegroundColor Green
    }

    Write-Host "`n=========================================================" -ForegroundColor Green
    Write-Host "🟢 Success! System-wide registration complete." -ForegroundColor Green
    Write-Host "`n✨ The native slash commands are now active globally!" -ForegroundColor Green
    Write-Host "👉 You can now type '/sfe-gen', '/sfe-interview', or '/sfe-blueprint' inside your Windows agy client." -ForegroundColor Green
    Write-Host "=========================================================" -ForegroundColor Green

} catch {
    Write-Host "`n🔴 Installation failed: $_" -ForegroundColor Red
    Exit 1
}
