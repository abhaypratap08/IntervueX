#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# ============================================================
# COLORS
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}$1${NC}"; }
ok()    { echo -e "${GREEN}✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $1${NC}"; }
fail()  { echo -e "${RED}✗ $1${NC}"; }

# ============================================================
# CHECK PREREQUISITES
# ============================================================

check_prereqs() {
    echo ""
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "  INTERVUEX — AI-Powered Interview Coach"
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Node.js
    if ! command -v node &>/dev/null; then
        fail "Node.js not found. Please install Node.js 18+."
        echo "  https://nodejs.org/"
        exit 1
    fi
    ok "Node.js $(node -v)"

    # npm
    if ! command -v npm &>/dev/null; then
        fail "npm not found."
        exit 1
    fi
    ok "npm $(npm -v)"

    # MongoDB check (informational — not required)
    if command -v mongod &>/dev/null && pgrep -x mongod &>/dev/null; then
        ok "MongoDB is running"
    elif command -v mongod &>/dev/null; then
        warn "MongoDB installed but not running — will use in-memory database"
    else
        warn "MongoDB not installed — will use in-memory database (data won't persist)"
    fi
}

# ============================================================
# INSTALL DEPENDENCIES
# ============================================================

install_deps() {
    info "Installing dependencies..."

    # Backend
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        info "  Installing backend dependencies..."
        (cd "$BACKEND_DIR" && npm install) || { fail "Backend install failed"; exit 1; }
        ok "  Backend dependencies installed"
    else
        ok "  Backend dependencies already installed"
    fi

    # Frontend
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        info "  Installing frontend dependencies..."
        (cd "$FRONTEND_DIR" && npm install) || { fail "Frontend install failed"; exit 1; }
        ok "  Frontend dependencies installed"
    else
        ok "  Frontend dependencies already installed"
    fi
}

# ============================================================
# START BACKEND
# ============================================================

start_backend() {
    info "Starting backend on http://localhost:5000 ..."
    cd "$BACKEND_DIR"
    node server.js &
    BACKEND_PID=$!

    # Wait for server to be ready (max 30 seconds)
    for i in $(seq 1 30); do
        if curl -sf http://localhost:5000/api/health >/dev/null 2>&1; then
            ok "Backend is running"
            return 0
        fi
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            fail "Backend failed to start"
            return 1
        fi
        sleep 1
    done

    fail "Backend did not respond within 30 seconds"
    return 1
}

# ============================================================
# START FRONTEND
# ============================================================

start_frontend() {
    info "Starting frontend on http://localhost:5173 ..."
    cd "$FRONTEND_DIR"
    npm run dev -- --host 0.0.0.0 &
    FRONTEND_PID=$!

    # Wait for Vite to be ready (max 15 seconds)
    for i in $(seq 1 15); do
        if curl -sf http://localhost:5173/ >/dev/null 2>&1; then
            ok "Frontend is running"
            return 0
        fi
        if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            fail "Frontend failed to start"
            return 1
        fi
        sleep 1
    done

    fail "Frontend did not respond within 15 seconds"
    return 1
}

# ============================================================
# START ALL
# ============================================================

start_all() {
    check_prereqs
    install_deps

    echo ""
    info "Starting services..."
    echo ""

    start_backend || exit 1
    start_frontend || exit 1

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  All services are running!${NC}"
    echo ""
    echo -e "  ${BOLD}Frontend:${NC}  http://localhost:5173"
    echo -e "  ${BOLD}Backend:${NC}   http://localhost:5000"
    echo -e "  ${BOLD}Health:${NC}    http://localhost:5000/api/health"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  Press ${BOLD}Ctrl+C${NC} to stop all services."
    echo ""

    # Cleanup on exit
    cleanup() {
        echo ""
        info "Stopping services..."
        [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null || true
        [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
        wait 2>/dev/null
        ok "All services stopped."
        exit 0
    }

    trap cleanup SIGINT SIGTERM

    # Wait for any process to exit
    wait
}

# ============================================================
# START BACKEND ONLY
# ============================================================

start_backend_only() {
    check_prereqs
    install_deps

    echo ""
    start_backend || exit 1

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Backend is running!${NC}"
    echo ""
    echo -e "  ${BOLD}Backend:${NC}   http://localhost:5000"
    echo -e "  ${BOLD}Health:${NC}    http://localhost:5000/api/health"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    trap "kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    wait
}

# ============================================================
# START FRONTEND ONLY
# ============================================================

start_frontend_only() {
    check_prereqs
    install_deps

    echo ""
    start_frontend || exit 1

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Frontend is running!${NC}"
    echo ""
    echo -e "  ${BOLD}Frontend:${NC}  http://localhost:5173"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    trap "kill $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    wait
}

# ============================================================
# INSTALL ONLY
# ============================================================

install_only() {
    check_prereqs
    install_deps
    echo ""
    ok "All dependencies installed. Run './start.sh' to start."
}

# ============================================================
# MAIN
# ============================================================

case "${1:-}" in
    ""|start)
        start_all
        ;;
    backend)
        start_backend_only
        ;;
    frontend)
        start_frontend_only
        ;;
    install)
        install_only
        ;;
    -h|--help|help)
        echo ""
        echo "  IntervueX — AI-Powered Interview Coach"
        echo ""
        echo "  Usage:"
        echo ""
        echo "    ./start.sh              Start everything (backend + frontend)"
        echo "    ./start.sh backend      Start backend only"
        echo "    ./start.sh frontend     Start frontend only"
        echo "    ./start.sh install      Install dependencies only"
        echo "    ./start.sh help         Show this help"
        echo ""
        ;;
    *)
        fail "Unknown command: $1"
        echo "  Run './start.sh help' for usage."
        exit 1
        ;;
esac
