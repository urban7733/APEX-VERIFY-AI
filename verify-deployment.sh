#!/bin/bash
# APEX VERIFY AI - Deployment Verification Script
# This script tests all critical components before Vercel deployment

set -e

echo "🚀 APEX VERIFY AI - Deployment Verification"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if curl -s -f -X $method "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test endpoint with expected status
test_endpoint_status() {
    local name=$1
    local url=$2
    local expected_status=$3
    local method=${4:-GET}
    
    echo -n "Testing $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_status, got $status)"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📡 1. Testing Modal ML Pipeline Endpoints"
echo "=========================================="
echo ""

# Modal Health Endpoint
test_endpoint_status "Modal Health" \
    "https://urban33133--apex-verify-ml-health-endpoint.modal.run" \
    "200" \
    "GET"

# Modal Analyze Endpoint (with test image - 1x1 red pixel PNG)
echo -n "Testing Modal Analyze... "
analyze_response=$(curl -s -w "\n%{http_code}" -X POST \
    "https://urban33133--apex-verify-ml-analyze-endpoint.modal.run" \
    -H "Content-Type: application/json" \
    -d '{"image_base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}')
analyze_status=$(echo "$analyze_response" | tail -1)
if [ "$analyze_status" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $analyze_status)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (HTTP $analyze_status)"
    ((TESTS_FAILED++))
fi

# Modal Memory Endpoint (any 2xx/4xx response is valid - endpoint is working)
echo -n "Testing Modal Memory Lookup... "
memory_response=$(curl -s -w "\n%{http_code}" -X POST \
    "https://urban33133--apex-verify-ml-memory-lookup-endpoint.modal.run" \
    -H "Content-Type: application/json" \
    -d '{"sha256":"0000000000000000000000000000000000000000000000000000000000000000"}')
memory_status=$(echo "$memory_response" | tail -1)
if [[ "$memory_status" =~ ^(200|400|404)$ ]]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $memory_status - endpoint responding)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (HTTP $memory_status)"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔧 2. Checking Local Configuration"
echo "==================================="
echo ""

# Check .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ PASS${NC} .env.local exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} .env.local not found"
    ((TESTS_FAILED++))
fi

# Check Modal URLs are configured
if grep -q "NEXT_PUBLIC_MODAL_ANALYZE_URL" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} Modal URLs configured"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} Modal URLs not configured"
    ((TESTS_FAILED++))
fi

# Check next.config.mjs doesn't have static export
if grep -q "output: 'export'" next.config.mjs 2>/dev/null; then
    echo -e "${RED}❌ FAIL${NC} Static export enabled (breaks API routes)"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✅ PASS${NC} Static export disabled (API routes OK)"
    ((TESTS_PASSED++))
fi

# Check modal app is deployed
echo -n "Checking Modal deployment... "
if modal app list 2>/dev/null | grep -q "deployed"; then
    echo -e "${GREEN}✅ PASS${NC} (Modal app deployed)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} (Could not verify Modal deployment status)"
fi

echo ""
echo "📦 3. Checking Dependencies"
echo "==========================="
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js: $NODE_VERSION"

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✅ PASS${NC} pnpm installed"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC} pnpm not found (optional)"
fi

# Check Modal CLI
if command -v modal &> /dev/null; then
    MODAL_VERSION=$(modal --version 2>&1 | head -1)
    echo -e "${GREEN}✅ PASS${NC} Modal CLI: $MODAL_VERSION"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} Modal CLI not installed"
    ((TESTS_FAILED++))
fi

echo ""
echo "📊 4. Testing Local Development Server"
echo "======================================"
echo ""

# Check if dev server is running
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC} Dev server running (localhost:3000)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SKIP${NC} Dev server not running (start with: pnpm dev)"
fi

echo ""
echo "============================================"
echo "📈 Test Results"
echo "============================================"
echo ""
echo "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "✅ Ready for Vercel deployment"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables in Vercel Dashboard"
    echo "2. git push origin main (auto-deploy)"
    echo "3. Verify production deployment"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix issues before deploying.${NC}"
    echo ""
    echo "Review DEPLOYMENT_VERIFICATION.md for troubleshooting steps."
    echo ""
    exit 1
fi

