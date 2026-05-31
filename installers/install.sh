#!/usr/bin/env bash

# Antigravity 2.0 Global Command Installer (Bash)
# 
# Install globally by running this one-liner in your terminal:
# curl -fsSL https://raw.githubusercontent.com/Danny0821/Senfide-Engine/master/installers/install.sh | bash

set -e

# Color variables for rich logging
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}    Installing Antigravity Scaffolder System-Wide CLI    ${NC}"
echo -e "${CYAN}=========================================================\n${NC}"

# 1. Environment Verification
echo -e "${YELLOW}Step 1: Checking environment prerequisites...${NC}"

# Verify Node.js
if command -v node >/dev/null 2>&1; then
    nodeVer=$(node -v)
    echo -e "  ✓ Node.js detected: ${GREEN}$nodeVer${NC}"
else
    echo -e "  ${RED}🔴 Node.js is required but was not detected. Please install Node.js (>=18.0.0).${NC}"
    exit 1
fi

# 2. Resolve target directories
echo -e "\n${YELLOW}Step 2: Resolving global directories...${NC}"

GLOBAL_SKILLS_DIRS=(
    "$HOME/.gemini/skills"
    "$HOME/.gemini/antigravity/skills"
    "$HOME/.gemini/antigravity-cli/skills"
    "$HOME/.gemini/config/skills"
)

# 3. Source manifest deployment
echo -e "\n${YELLOW}Step 3: Deploying command manifests...${NC}"

GITHUB_RAW_BASE="https://raw.githubusercontent.com/Danny0821/Senfide-Engine/master"

for dir in "${GLOBAL_SKILLS_DIRS[@]}"; do
    echo -e "  Synchronizing manifests to: $dir"
    mkdir -p "$dir"

    # Clean legacy flat generate.md file
    rm -f "$dir/generate.md"

    # 3a. Install /generate command
    mkdir -p "$dir/generate"
    curl -fsSL "$GITHUB_RAW_BASE/command_manifests/generate.md" -o "$dir/generate/SKILL.md"
    echo -e "    ${GREEN}✓ Registered /sfe-gen command${NC}"

    # 3b. Install /interview (agentic-interviewer) command
    rm -rf "$dir/agentic-interviewer"
    mkdir -p "$dir/agentic-interviewer"
    for file in "SKILL.md" "interview.json" "lessons_index.md" "playbook.md"; do
        curl -fsSL "$GITHUB_RAW_BASE/command_manifests/agentic-interviewer/$file" -o "$dir/agentic-interviewer/$file"
    done
    echo -e "    ${GREEN}✓ Registered /sfe-interview command${NC}"

    # 3c. Install /grill-blueprint (grill-blueprint) command
    rm -rf "$dir/grill-blueprint"
    mkdir -p "$dir/grill-blueprint"
    for file in "SKILL.md" "interview.json" "lessons_index.md" "playbook.md"; do
        curl -fsSL "$GITHUB_RAW_BASE/command_manifests/grill-blueprint/$file" -o "$dir/grill-blueprint/$file"
    done
    echo -e "    ${GREEN}✓ Registered /sfe-blueprint command${NC}"
done

echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}🟢 Success! System-wide registration complete.${NC}"
echo -e "\n${GREEN}✨ The native slash commands are now active globally!${NC}"
echo -e "${GREEN}👉 You can now type '/sfe-gen', '/sfe-interview', or '/sfe-blueprint' inside your agy client.${NC}"
echo -e "${GREEN}=========================================================${NC}"
