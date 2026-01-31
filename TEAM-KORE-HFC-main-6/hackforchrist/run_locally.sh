#!/bin/bash

# Sentinal Local Launcher
# Use this if Docker Compose is not available

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Sentinal Local Launcher ===${NC}"

# Check for MongoDB
echo -e "${BLUE}Checking MongoDB connection...${NC}"
# We assume Mongo is running on localhost:27017. 
# If not, we warn but proceed (backend handles errors gracefully-ish)

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $MOCK_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $PROM_PID 2>/dev/null
    kill $GRAF_PID 2>/dev/null
    exit
}

trap cleanup SIGINT

# 1. Setup Backend
echo -e "${GREEN}Setting up Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo -e "Backend dependencies installed."

# Start Backend in background
export MONGODB_URI="mongodb+srv://nidhin:123iamfree@cluster0.yvecwbu.mongodb.net/?appName=Cluster0"
# We need to run uvicorn such that it understands the package structure or fix the imports.
# Simplest fix for this script: Run from parent dir? No, we are in backend dir.
# If we are in backend dir, `from .database` fails if treated as script.
# We will patch main.py to remove relative imports for local run, OR just run uvicorn correctly?
# If we run `python -m uvicorn main:app` it might work if we are careful.
# But `main.py` has `from .database`.
# Let's just fix the import in main.py to be absolute for simplicity in this environment.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "Backend running (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 5

# 2. Setup Mock Services
cd ../mock-services
echo -e "${GREEN}Setting up Mock Services...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo -e "Mock Service dependencies installed."

# Start Mock Services (Prometheus Exporter)
echo "Setting up Mock Services (Prometheus Exporter)..."
pip install -r requirements.txt > /dev/null
python3 generate_metrics.py &
MOCK_PID=$!
echo -e "Mock Services Exporter running on port 8001 (PID: $MOCK_PID)"

# Start Prometheus and Grafana via Homebrew
echo "Setting up Prometheus & Grafana (Homebrew)..."

# Install if missing
if ! command -v prometheus &> /dev/null; then
    echo "Installing Prometheus..."
    brew install prometheus
fi
if ! command -v grafana-server &> /dev/null; then
    echo "Installing Grafana..."
    brew install grafana
fi

# Run Prometheus
# Using --config.file
prometheus --config.file=prometheus.yml --web.listen-address=:9090 > /dev/null 2>&1 &
PROM_PID=$!
echo "Prometheus running on http://localhost:9090 (PID: $PROM_PID)"

# Run Grafana
# Homebrew grafana usually installs binary as `grafana` or `grafana-server`
# We need to point to custom ini and provisioning
# Grafana often looks for /usr/local/etc/grafana/grafana.ini or similar
# We can pass --config
grafana server --config grafana_custom.ini --homepath $(brew --prefix grafana)/share/grafana > /dev/null 2>&1 &
GRAF_PID=$!
echo "Grafana running on http://localhost:3002 (PID: $GRAF_PID)"

# 3. Setup Frontend
cd ../frontend
echo -e "${GREEN}Setting up Frontend...${NC}"
npm install > /dev/null 2>&1
echo -e "Frontend dependencies installed."

# Start Frontend
# We use 'npm run dev' but it's interactive. We'll run it and background it?
# Usually 'npm run dev' prints output. We'll redirect to a log or let it share stdout eventually.
# But for backgrounding, we need to be careful.
# Let's run it in background and tell user to visit 3001.
PORT=3001 npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "Frontend running at http://localhost:3001 (PID: $FRONTEND_PID)"

echo -e "${BLUE}=== System is Live ===${NC}"
echo -e "Frontend:    http://localhost:3001"
echo -e "Backend API: http://localhost:8000/docs"
echo -e "Press Ctrl+C to stop everything."

# Capture pid for cleanup
trap "kill $BACKEND_PID $MOCK_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT

# Keep script running
wait
