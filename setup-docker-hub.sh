#!/bin/bash

# ═════════════════════════════════════════════════════════════════════════════
# Quick Setup Script for Docker Hub Delivery
# ═════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BizOS - Docker Hub Delivery Setup${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Docker Hub credentials
log_info "Step 1: Docker Hub Configuration"
read -p "Enter your Docker Hub username: " DOCKER_USERNAME
read -p "Enter your Docker Hub token/password: " DOCKER_TOKEN

# Step 2: Environment setup
log_info "Step 2: Setting environment variables"
export DOCKER_USERNAME
export DOCKER_TOKEN
log_success "Environment variables set"

# Step 3: Version
log_info "Step 3: Version and Stage"
read -p "Enter version (default: latest): " VERSION
VERSION=${VERSION:-latest}
read -p "Enter stage (develop/staging/production): " STAGE
STAGE=${STAGE:-develop}
log_success "Version: $VERSION, Stage: $STAGE"

# Step 4: Test local build
log_info "Step 4: Testing local build"
if docker compose up --build -d; then
    log_success "Local build successful"
    
    # Test services
    sleep 5
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is running"
    else
        log_warning "Frontend may not be responding yet"
    fi
    
    if curl -f http://localhost:8000 > /dev/null 2>&1; then
        log_success "Backend is running"
    else
        log_warning "Backend may not be responding yet"
    fi
    
    # Cleanup
    docker compose down
else
    log_error "Local build failed"
    exit 1
fi

# Step 5: Make deliver.sh executable
log_info "Step 5: Preparing delivery script"
chmod +x deliver.sh
log_success "deliver.sh is ready"

# Step 6: Show next steps
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Next Steps${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Run the delivery pipeline:"
echo "  export DOCKER_USERNAME=$DOCKER_USERNAME"
echo "  export DOCKER_TOKEN=<your_token>"
echo "  ./deliver.sh $VERSION $STAGE"
echo ""
log_info "Or deploy with docker-compose:"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
log_success "Setup complete!"
