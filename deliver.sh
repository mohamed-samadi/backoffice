#!/bin/bash

# ═════════════════════════════════════════════════════════════════════════════
# Docker Delivery Script - Automated Docker Hub Push
# ═════════════════════════════════════════════════════════════════════════════
#
# Usage: ./deliver.sh [version] [stage]
# Example: ./deliver.sh 1.0.0 production
#
# ═════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
DOCKER_TOKEN="${DOCKER_TOKEN:-}"
DOCKER_REGISTRY="docker.io"
PROJECT_NAME="bizos"
BACKEND_IMAGE="${PROJECT_NAME}-backend"
FRONTEND_IMAGE="${PROJECT_NAME}-frontend"

# Arguments
VERSION="${1:-latest}"
STAGE="${2:-develop}"

# ─────────────────────────────────────────────────────────────────────────────
# Functions
# ─────────────────────────────────────────────────────────────────────────────

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────

check_requirements() {
    print_header "Checking Requirements"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"

    # Check Docker Buildx
    if ! docker buildx version &> /dev/null; then
        log_warning "Docker Buildx not found, using standard docker build"
    else
        log_success "Docker Buildx is available"
    fi

    # Check credentials
    if [ -z "$DOCKER_USERNAME" ]; then
        log_error "DOCKER_USERNAME not set. Please set: export DOCKER_USERNAME=your_username"
        exit 1
    fi
    log_success "Docker username configured: $DOCKER_USERNAME"

    if [ -z "$DOCKER_TOKEN" ]; then
        log_error "DOCKER_TOKEN not set. Please set: export DOCKER_TOKEN=your_token"
        exit 1
    fi
    log_success "Docker token configured"
}

login_docker() {
    print_header "Logging into Docker Hub"
    
    echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin "$DOCKER_REGISTRY"
    log_success "Successfully logged into Docker Hub"
}

build_backend() {
    print_header "Building Backend Image"

    local image_name="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION"
    local image_latest="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
    local image_stage="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$STAGE"

    log_info "Building backend image..."
    log_info "Image: $image_name"

    if docker build \
        -f backend/Dockerfile \
        -t "$image_name" \
        -t "$image_latest" \
        -t "$image_stage" \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        .; then
        log_success "Backend image built successfully"
    else
        log_error "Failed to build backend image"
        exit 1
    fi
}

build_frontend() {
    print_header "Building Frontend Image"

    local image_name="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION"
    local image_latest="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
    local image_stage="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$STAGE"

    # Get environment variables
    VITE_API_URL="${VITE_API_URL:-http://localhost:8000/api}"
    VITE_STORAGE_URL="${VITE_STORAGE_URL:-http://localhost:8000/storage}"

    log_info "Building frontend image..."
    log_info "Image: $image_name"
    log_info "VITE_API_URL: $VITE_API_URL"
    log_info "VITE_STORAGE_URL: $VITE_STORAGE_URL"

    if docker build \
        -f frontend/Dockerfile \
        -t "$image_name" \
        -t "$image_latest" \
        -t "$image_stage" \
        --build-arg VITE_API_URL="$VITE_API_URL" \
        --build-arg VITE_STORAGE_URL="$VITE_STORAGE_URL" \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        .; then
        log_success "Frontend image built successfully"
    else
        log_error "Failed to build frontend image"
        exit 1
    fi
}

push_images() {
    print_header "Pushing Images to Docker Hub"

    local backend_image_name="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION"
    local backend_image_latest="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
    local backend_image_stage="$DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$STAGE"

    local frontend_image_name="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION"
    local frontend_image_latest="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
    local frontend_image_stage="$DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$STAGE"

    # Push backend
    log_info "Pushing backend images..."
    docker push "$backend_image_name" && log_success "Pushed $backend_image_name" || { log_error "Failed to push backend image"; exit 1; }
    docker push "$backend_image_latest" && log_success "Pushed $backend_image_latest" || { log_error "Failed to push latest tag"; exit 1; }
    docker push "$backend_image_stage" && log_success "Pushed $backend_image_stage" || { log_error "Failed to push stage tag"; exit 1; }

    # Push frontend
    log_info "Pushing frontend images..."
    docker push "$frontend_image_name" && log_success "Pushed $frontend_image_name" || { log_error "Failed to push frontend image"; exit 1; }
    docker push "$frontend_image_latest" && log_success "Pushed $frontend_image_latest" || { log_error "Failed to push latest tag"; exit 1; }
    docker push "$frontend_image_stage" && log_success "Pushed $frontend_image_stage" || { log_error "Failed to push stage tag"; exit 1; }
}

show_summary() {
    print_header "Summary"

    log_success "All images built and pushed successfully!"
    echo ""
    echo "Backend:"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$STAGE"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
    echo ""
    echo "Frontend:"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$STAGE"
    echo "  $DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
    echo ""
    echo "Use these images with:"
    echo "  docker run $DOCKER_REGISTRY/$DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION"
    echo "  docker run $DOCKER_REGISTRY/$DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION"
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

main() {
    print_header "Docker Hub Delivery Pipeline"
    
    log_info "Configuration:"
    log_info "  Version: $VERSION"
    log_info "  Stage: $STAGE"
    log_info "  Username: $DOCKER_USERNAME"
    echo ""

    check_requirements
    login_docker
    build_backend
    build_frontend
    push_images
    show_summary

    log_success "Delivery complete!"
}

# Run main function
main "$@"
