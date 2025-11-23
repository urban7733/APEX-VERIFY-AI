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

echo "📡 1. Testing RunPod Serverless Endpoint"
echo "========================================"
echo ""

if [ -z "$RUNPOD_ENDPOINT_URL" ] || [ -z "$RUNPOD_API_KEY" ]; then
    echo -e "${RED}❌ FAIL${NC} RUNPOD_ENDPOINT_URL / RUNPOD_API_KEY not set in the current shell"
    echo "      Export them (or run: source .env.local) before executing this script."
    ((TESTS_FAILED++))
else
    RUNPOD_HEADERS=(-H "Content-Type: application/json" -H "Authorization: Bearer $RUNPOD_API_KEY")
    HEALTH_PAYLOAD='{"input":{"health_check":true}}'
    echo -n "Testing RunPod health_check... "
    health_response=$(curl -s -w "\n%{http_code}" -X POST "$RUNPOD_ENDPOINT_URL" "${RUNPOD_HEADERS[@]}" -d "$HEALTH_PAYLOAD")
    health_status=$(echo "$health_response" | tail -1)
    if [ "$health_status" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $health_status)"
        ((TESTS_FAILED++))
    fi

    TEST_IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    ANALYZE_PAYLOAD="{\"input\":{\"image_base64\":\"$TEST_IMAGE_BASE64\",\"metadata\":{\"source\":\"verify-script\"}}}"
    echo -n "Testing RunPod analyze... "
    analyze_response=$(curl -s -w "\n%{http_code}" -X POST "$RUNPOD_ENDPOINT_URL" "${RUNPOD_HEADERS[@]}" -d "$ANALYZE_PAYLOAD")
    analyze_status=$(echo "$analyze_response" | tail -1)
    if [ "$analyze_status" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $analyze_status)"
        ((TESTS_FAILED++))
    fi
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

# Check RunPod env vars are present in template
if grep -q "RUNPOD_ENDPOINT_URL" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} RunPod credentials present"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} RunPod credentials missing from .env.local"
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
    echo "1. Ensure RunPod image + endpoint are up to date"
    echo "2. Set environment variables in Vercel Dashboard"
    echo "3. git push origin main (auto-deploy)"
    echo "4. Verify production deployment"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix issues before deploying.${NC}"
    echo ""
    echo "Review DEPLOYMENT_VERIFICATION.md / RUNPOD_DEPLOYMENT.md for troubleshooting steps."
    echo ""
    exit 1
fi
