#!/bin/bash

# Production Deployment Script for GeoCache Lore
echo "🚀 Starting production deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm ci || {
    print_error "Failed to install dependencies"
    exit 1
}

# Run production readiness checks
print_status "Running production readiness checks..."

# Type checking
print_status "Running TypeScript checks..."
npx tsc --noEmit || {
    print_error "TypeScript errors found"
    exit 1
}

# Linting
print_status "Running ESLint..."
npm run lint || {
    print_warning "Linting issues found (not blocking deployment)"
}

# Security audit
print_status "Running security audit..."
npm audit --audit-level high || {
    print_warning "Security vulnerabilities found - please review"
}

# Run tests
print_status "Running tests..."
npm test -- --watchAll=false --coverage || {
    print_error "Tests failed"
    exit 1
}

# Build for production
print_status "Building for production..."
npm run build || {
    print_error "Build failed"
    exit 1
}

# Analyze bundle size
print_status "Analyzing bundle size..."
if command -v npx &> /dev/null; then
    npx vite-bundle-analyzer dist --open false
fi

# Check bundle size limits
BUNDLE_SIZE=$(find dist -name "*.js" -exec du -ch {} + | grep total | cut -f1)
print_status "Total bundle size: $BUNDLE_SIZE"

# Verify production build
print_status "Verifying production build..."
if [ -f "dist/index.html" ]; then
    print_success "Build artifacts generated successfully"
else
    print_error "Build verification failed"
    exit 1
fi

# Security checks on built files
print_status "Running security checks on built files..."
if grep -r "console.log" dist/ &> /dev/null; then
    print_warning "console.log statements found in production build"
fi

if grep -r "debugger" dist/ &> /dev/null; then
    print_error "debugger statements found in production build"
    exit 1
fi

# Check for source maps (should not be in production)
if find dist/ -name "*.map" | grep -q .; then
    print_warning "Source maps found in production build - consider removing for security"
fi

# Validate environment variables
print_status "Validating environment variables..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    print_error "VITE_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    print_error "VITE_SUPABASE_PUBLISHABLE_KEY is not set"
    exit 1
fi

print_success "Environment variables validated"

# Performance budget check
print_status "Checking performance budgets..."
HTML_SIZE=$(stat -c%s "dist/index.html")
if [ $HTML_SIZE -gt 50000 ]; then
    print_warning "HTML file is larger than 50KB ($HTML_SIZE bytes)"
fi

# Check for PWA requirements
print_status "Validating PWA requirements..."
if [ -f "dist/manifest.json" ]; then
    print_success "PWA manifest found"
else
    print_warning "PWA manifest not found"
fi

if [ -f "dist/sw.js" ] || [ -f "dist/service-worker.js" ]; then
    print_success "Service worker found"
else
    print_warning "Service worker not found"
fi

# Final production readiness score
print_status "Calculating production readiness score..."

# Create deployment summary
cat << EOF

=====================================
🎉 PRODUCTION DEPLOYMENT SUMMARY
=====================================

✅ Dependencies installed
✅ TypeScript validation passed
✅ Security audit completed
✅ Tests passed
✅ Production build created
✅ Environment variables validated
✅ Bundle analysis completed

📊 Build Statistics:
   - HTML: $(stat -c%s "dist/index.html" 2>/dev/null || echo "N/A") bytes
   - Total bundle: $BUNDLE_SIZE

🚀 Ready for deployment!

Next steps:
1. Deploy to your hosting platform
2. Configure custom domain (if needed)
3. Set up monitoring and analytics
4. Configure CDN (recommended)
5. Set up SSL certificate

EOF

print_success "Production build ready for deployment! 🚀"

# Optional: Open deployment guide
read -p "Would you like to open the deployment guide? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://docs.lovable.dev/deployment"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://docs.lovable.dev/deployment"
    else
        print_info "Please visit: https://docs.lovable.dev/deployment"
    fi
fi

exit 0