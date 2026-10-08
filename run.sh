#!/bin/bash

# Exit on error for synchronous parts
set -e

# ANSI Color codes
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
BLUE=$'\033[0;34m'
YELLOW=$'\033[0;33m'
CYAN=$'\033[0;36m'
NC=$'\033[0m'

# Flags
LINT=0
PRETTIFY=0

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -l|--lint) LINT=1 ;;
        -p|--prettify) PRETTIFY=1 ;;
        -h|--help) 
            echo -e "Usage: $0 [options]"
            echo -e "Options:"
            echo -e "  -l, --lint      Run linting in both directories"
            echo -e "  -p, --prettify  Run Prettier in both directories"
            echo -e "  -h, --help      Show this help message"
            exit 0
            ;;
        *) 
            echo -e "${RED}Unknown parameter: $1${NC}"
            echo -e "Use -h or --help for usage."
            exit 1 
            ;;
    esac
    shift
done

# Helper function to run a command and prefix its output
run_with_prefix() {
    local prefix_str="$1"
    local target_dir="$2"
    local cmd="$3"
    
    if [[ ! -d "$target_dir" ]]; then
        echo -e "${RED}Directory '${target_dir}' not found!${NC}"
        return 1
    fi
    
    (
        cd "$target_dir"
        # Using FORCE_COLOR=1 preserves colors from Vite/Nodemon/etc.
        FORCE_COLOR=1 eval "$cmd" 2>&1 | while IFS= read -r line || [[ -n "$line" ]]; do
            printf "%s %s\n" "$prefix_str" "$line"
        done
    )
}

# Run linting
run_lint() {
    echo -e "${YELLOW}==> Starting linting...${NC}"
    
    # Frontend
    if [[ -d "frontend" ]]; then
        echo -e "${BLUE}[frontend]${NC} Running linter..."
        (
            cd frontend 
            if npm run | grep -q ' lint$'; then
                npm run lint
            else
                npx eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null || echo -e "${YELLOW}[frontend] No eslint configuration found or linting failed.${NC}"
            fi
        )
    fi
    
    # Backend
    if [[ -d "backend" ]]; then
        echo -e "${GREEN}[backend]${NC} Running linter..."
        (
            cd backend 
            if npm run | grep -q ' lint$'; then
                npm run lint
            else
                npx eslint . 2>/dev/null || echo -e "${YELLOW}[backend] No eslint configuration found or linting failed.${NC}"
            fi
        )
    fi
    
    echo -e "${YELLOW}==> Linting completed.${NC}\n"
}

# Run Prettier
run_prettify() {
    echo -e "${YELLOW}==> Starting Prettier formatting...${NC}"
    
    # Frontend
    if [[ -d "frontend" ]]; then
        echo -e "${BLUE}[frontend]${NC} Running Prettier..."
        (
            cd frontend 
            if npm run | grep -q ' format$'; then
                npm run format
            elif npm run | grep -q ' prettier$'; then
                npm run prettier
            else
                npx prettier --write .
            fi
        )
    fi
    
    # Backend
    if [[ -d "backend" ]]; then
        echo -e "${GREEN}[backend]${NC} Running Prettier..."
        (
            cd backend 
            if npm run | grep -q ' format$'; then
                npm run format
            elif npm run | grep -q ' prettier$'; then
                npm run prettier
            else
                npx prettier --write .
            fi
        )
    fi
    
    echo -e "${YELLOW}==> Prettier formatting completed.${NC}\n"
}

# Execute synchronous pre-run checks
if [[ $LINT -eq 1 ]]; then
    run_lint
fi

if [[ $PRETTIFY -eq 1 ]]; then
    run_prettify
fi

# Turn off exit on error so we can handle long-running processes gracefully
set +e

echo -e "${YELLOW}==> Starting servers concurrently...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Start background processes
run_with_prefix "${BLUE}[frontend]${NC}" "frontend" "npm run dev" &
FRONTEND_PID=$!

run_with_prefix "${GREEN}[backend]${NC}" "backend" "npm run dev" &
BACKEND_PID=$!

# Ensure cleanup on script exit
cleanup() {
    echo -e "\n${YELLOW}==> Shutting down servers...${NC}"
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
    echo -e "${YELLOW}==> Servers stopped successfully.${NC}"
    exit 0
}

# Catch termination signals
trap cleanup SIGINT SIGTERM EXIT

# Wait for the first process to exit. If one server crashes, the script exits and cleans up the other.
wait -n
