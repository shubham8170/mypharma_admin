#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:3000"
ADMIN_BASE="$BASE/api/v1"
STAFF_BASE="$BASE"

PASS=0
FAIL=0
WARN=0
TOTAL=0
REPORT=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_result() {
  local status="$1" category="$2" test_name="$3" detail="$4"
  TOTAL=$((TOTAL + 1))
  if [ "$status" = "PASS" ]; then
    PASS=$((PASS + 1))
    printf "${GREEN}[PASS]${NC} ${CYAN}%-30s${NC} %s\n" "$category" "$test_name"
  elif [ "$status" = "FAIL" ]; then
    FAIL=$((FAIL + 1))
    printf "${RED}[FAIL]${NC} ${CYAN}%-30s${NC} %s\n" "$category" "$test_name"
    printf "       ${RED}→ %s${NC}\n" "$detail"
  else
    WARN=$((WARN + 1))
    printf "${YELLOW}[WARN]${NC} ${CYAN}%-30s${NC} %s\n" "$category" "$test_name"
    printf "       ${YELLOW}→ %s${NC}\n" "$detail"
  fi
  REPORT+="| $status | $category | $test_name | $detail |\n"
}

printf "\n${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"
printf "${BOLD}  MyPharma Admin — Security Test Suite${NC}\n"
printf "${BOLD}  Target: $BASE${NC}\n"
printf "${BOLD}  Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')${NC}\n"
printf "${BOLD}═══════════════════════════════════════════════════════════════${NC}\n\n"

# ─────────────────────────────────────────────────────────────────
# SECTION 1: AUTHENTICATION SECURITY
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 1. AUTHENTICATION SECURITY ──${NC}\n\n"

# 1.1 Admin login with invalid credentials
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@bad.com","password":"wrong"}')
if [ "$HTTP" = "401" ]; then
  BODY=$(cat /tmp/sec_resp.json)
  if echo "$BODY" | grep -qi "invalid credentials"; then
    log_result "PASS" "AUTH" "Invalid login returns 401" "Generic error message returned"
  else
    log_result "WARN" "AUTH" "Invalid login returns 401" "Response may leak info: $BODY"
  fi
else
  log_result "FAIL" "AUTH" "Invalid login returns 401" "Got HTTP $HTTP instead"
fi

# 1.2 Check for user enumeration via login
HTTP1=$(curl -s -o /tmp/sec_resp1.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent_user_xyz@fake.com","password":"wrong"}')
BODY1=$(cat /tmp/sec_resp1.json)

HTTP2=$(curl -s -o /tmp/sec_resp2.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mypharma.com","password":"wrongpassword"}')
BODY2=$(cat /tmp/sec_resp2.json)

MSG1=$(echo "$BODY1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null || echo "")
MSG2=$(echo "$BODY2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null || echo "")

if [ "$HTTP1" = "$HTTP2" ] && [ "$MSG1" = "$MSG2" ]; then
  log_result "PASS" "AUTH" "No user enumeration via login" "Same response for existing/non-existing users"
else
  log_result "FAIL" "AUTH" "User enumeration possible" "Different responses: [$HTTP1] '$MSG1' vs [$HTTP2] '$MSG2'"
fi

# 1.3 SQL injection in login
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mypharma.com\" OR 1=1--","password":"x"}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTH" "SQL injection in login email" "Properly rejected with HTTP $HTTP"
else
  log_result "FAIL" "AUTH" "SQL injection in login email" "Unexpected HTTP $HTTP - may be vulnerable"
fi

# 1.4 Empty credentials
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTH" "Empty credentials rejected" "HTTP $HTTP"
else
  log_result "FAIL" "AUTH" "Empty credentials rejected" "Got HTTP $HTTP — should be 400/401"
fi

# 1.5 Invalid JWT token
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" "$ADMIN_BASE/auth/me" \
  -H "Authorization: Bearer invalidtoken123")
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTH" "Invalid JWT rejected" "Returns 401"
else
  log_result "FAIL" "AUTH" "Invalid JWT rejected" "Got HTTP $HTTP — should be 401"
fi

# 1.6 Expired/tampered JWT
FAKE_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYWNrZXIiLCJlbWFpbCI6ImhhY2tlckBldmlsLmNvbSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInR5cCI6ImFkbWluIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.fakesignature"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE/auth/me" \
  -H "Authorization: Bearer $FAKE_JWT")
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTH" "Tampered JWT rejected" "Forged token properly rejected"
else
  log_result "FAIL" "AUTH" "Tampered JWT rejected" "Got HTTP $HTTP — CRITICAL: forged token accepted!"
fi

# 1.7 Missing auth header on protected routes
for endpoint in "/auth/me" "/dashboard/summary" "/users" "/medicines" "/orders" "/suppliers" "/customers"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE$endpoint")
  if [ "$HTTP" = "401" ]; then
    log_result "PASS" "AUTH" "No-auth rejected: $endpoint" "Returns 401"
  else
    log_result "FAIL" "AUTH" "No-auth rejected: $endpoint" "Got HTTP $HTTP — endpoint exposed without auth!"
  fi
done

# 1.8 Staff JWT on admin routes (cross-guard test)
HTTP_STAFF_LOGIN=$(curl -s -o /tmp/staff_login.json -w "%{http_code}" -X POST "$STAFF_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9999999999"}')
# Try to get staff token if OTP login works
HTTP_STAFF_OTP=$(curl -s -o /tmp/staff_otp.json -w "%{http_code}" -X POST "$STAFF_BASE/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9999999999","otp":"123456"}')
STAFF_TOKEN=$(cat /tmp/staff_otp.json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken',d.get('token','')))" 2>/dev/null || echo "")

if [ -n "$STAFF_TOKEN" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE/dashboard/summary" \
    -H "Authorization: Bearer $STAFF_TOKEN")
  if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
    log_result "PASS" "AUTH" "Staff JWT rejected on admin routes" "Properly isolated (HTTP $HTTP)"
  else
    log_result "FAIL" "AUTH" "Staff JWT rejected on admin routes" "CRITICAL: Staff token accepted on admin API (HTTP $HTTP)!"
  fi
else
  log_result "WARN" "AUTH" "Staff JWT cross-guard test" "Could not obtain staff token (STATIC_OTP may not be set)"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 2: AUTHORIZATION / IDOR
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 2. AUTHORIZATION & IDOR ──${NC}\n\n"

# 2.1 Access non-existent user resources (IDOR probe)
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X PATCH "$ADMIN_BASE/pharmacies/00000000-0000-0000-0000-000000000000/access" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{"isActive":true}')
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTHZ" "IDOR probe: fake pharmacy ID" "Auth checked before resource lookup"
else
  log_result "WARN" "AUTHZ" "IDOR probe: fake pharmacy ID" "Got HTTP $HTTP — verify auth-before-lookup order"
fi

# 2.2 Access medicine with random UUID
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X PATCH "$ADMIN_BASE/medicines/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{"price":0}')
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTHZ" "IDOR probe: fake medicine ID" "Auth checked first"
else
  log_result "WARN" "AUTHZ" "IDOR probe: fake medicine ID" "Got HTTP $HTTP"
fi

# 2.3 Access order with random UUID
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X PATCH "$ADMIN_BASE/orders/00000000-0000-0000-0000-000000000000/status" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{"fulfillmentStatus":"DELIVERED"}')
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "AUTHZ" "IDOR probe: fake order ID" "Auth checked first"
else
  log_result "WARN" "AUTHZ" "IDOR probe: fake order ID" "Got HTTP $HTTP"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 3: INPUT VALIDATION & INJECTION
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 3. INPUT VALIDATION & INJECTION ──${NC}\n\n"

# 3.1 XSS in login email field
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@evil.com","password":"test"}')
BODY=$(cat /tmp/sec_resp.json)
if echo "$BODY" | grep -q "<script>"; then
  log_result "FAIL" "INJECTION" "XSS reflected in login response" "Script tag found in response body"
else
  log_result "PASS" "INJECTION" "XSS not reflected in login" "Input sanitized or not reflected"
fi

# 3.2 NoSQL injection attempt
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ]; then
  log_result "PASS" "INJECTION" "NoSQL injection rejected" "HTTP $HTTP"
else
  log_result "FAIL" "INJECTION" "NoSQL injection may work" "Got HTTP $HTTP"
fi

# 3.3 Very long input (buffer overflow / DoS)
LONG_STRING=$(python3 -c "print('A'*10000)")
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LONG_STRING@test.com\",\"password\":\"$LONG_STRING\"}")
if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ] || [ "$HTTP" = "413" ]; then
  log_result "PASS" "INJECTION" "Long input handled safely" "HTTP $HTTP"
else
  log_result "WARN" "INJECTION" "Long input handling" "Got HTTP $HTTP — check max input limits"
fi

# 3.4 Path traversal in medicine ID
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE/medicines/..%2F..%2F..%2Fetc%2Fpasswd" \
  -H "Authorization: Bearer invalidtoken")
if [ "$HTTP" = "401" ] || [ "$HTTP" = "400" ] || [ "$HTTP" = "404" ]; then
  log_result "PASS" "INJECTION" "Path traversal in medicine ID" "Rejected with HTTP $HTTP"
else
  log_result "FAIL" "INJECTION" "Path traversal in medicine ID" "Got HTTP $HTTP — may be vulnerable"
fi

# 3.5 JSON content-type enforcement
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: text/plain" \
  -d '{"email":"a@b.com","password":"x"}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "415" ]; then
  log_result "PASS" "INJECTION" "Non-JSON content-type rejected" "HTTP $HTTP"
else
  log_result "WARN" "INJECTION" "Non-JSON content-type handling" "HTTP $HTTP — server may accept non-JSON"
fi

# 3.6 XSS in medicine name (via staff API)
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/medicines" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{"name":"<img src=x onerror=alert(1)>","sku":"XSS-001","batchNumber":"XSS-001","category":"Test","price":10,"stock":5,"expiryDate":"2030-01-01"}')
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "INJECTION" "XSS in medicine name" "Auth blocks before processing"
else
  BODY=$(cat /tmp/sec_resp.json)
  if echo "$BODY" | grep -q "onerror"; then
    log_result "FAIL" "INJECTION" "XSS in medicine name" "XSS payload reflected/stored"
  else
    log_result "PASS" "INJECTION" "XSS in medicine name" "Input sanitized (HTTP $HTTP)"
  fi
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 4: HTTP SECURITY HEADERS
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 4. HTTP SECURITY HEADERS ──${NC}\n\n"

HEADERS=$(curl -sI "$BASE/" 2>/dev/null)

check_header() {
  local header="$1" expected="$2"
  if echo "$HEADERS" | grep -qi "^$header"; then
    log_result "PASS" "HEADERS" "$header present" "$(echo "$HEADERS" | grep -i "^$header" | head -1 | tr -d '\r\n')"
  else
    log_result "FAIL" "HEADERS" "$header missing" "$expected"
  fi
}

check_header "X-Content-Type-Options" "Should be 'nosniff'"
check_header "X-Frame-Options" "Should be 'DENY' or 'SAMEORIGIN'"
check_header "X-XSS-Protection" "Should be '1; mode=block'"
check_header "Strict-Transport-Security" "Should be set for HTTPS"
check_header "Content-Security-Policy" "Should restrict script sources"
check_header "Referrer-Policy" "Should be 'no-referrer' or 'strict-origin'"

# Check for server version disclosure
if echo "$HEADERS" | grep -qi "^Server:.*[0-9]"; then
  SERVER_HDR=$(echo "$HEADERS" | grep -i "^Server:" | head -1 | tr -d '\r\n')
  log_result "WARN" "HEADERS" "Server version disclosed" "$SERVER_HDR"
else
  log_result "PASS" "HEADERS" "No server version leak" "Server header clean"
fi

# Check X-Powered-By
if echo "$HEADERS" | grep -qi "^X-Powered-By"; then
  POWERED=$(echo "$HEADERS" | grep -i "^X-Powered-By:" | head -1 | tr -d '\r\n')
  log_result "FAIL" "HEADERS" "X-Powered-By disclosed" "$POWERED — remove with Helmet"
else
  log_result "PASS" "HEADERS" "X-Powered-By hidden" "Framework not disclosed"
fi

# Check API endpoint headers too
API_HEADERS=$(curl -sI "$ADMIN_BASE/auth/me" 2>/dev/null)
if echo "$API_HEADERS" | grep -qi "^X-Powered-By"; then
  POWERED=$(echo "$API_HEADERS" | grep -i "^X-Powered-By:" | head -1 | tr -d '\r\n')
  log_result "FAIL" "HEADERS" "X-Powered-By on API routes" "$POWERED"
else
  log_result "PASS" "HEADERS" "X-Powered-By hidden on API" "Good"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 5: CORS CONFIGURATION
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 5. CORS CONFIGURATION ──${NC}\n\n"

# 5.1 CORS with evil origin
CORS=$(curl -sI -X OPTIONS "$ADMIN_BASE/auth/login" \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" 2>/dev/null)

if echo "$CORS" | grep -qi "access-control-allow-origin.*evil.com"; then
  log_result "FAIL" "CORS" "Evil origin reflected" "CORS allows any origin — wildcard or reflection"
elif echo "$CORS" | grep -qi "access-control-allow-origin.*\*"; then
  log_result "WARN" "CORS" "Wildcard CORS (Access-Control-Allow-Origin: *)" "Acceptable for public APIs, risky for admin"
else
  log_result "PASS" "CORS" "Evil origin rejected" "CORS properly configured"
fi

# 5.2 CORS credentials
if echo "$CORS" | grep -qi "access-control-allow-credentials.*true"; then
  if echo "$CORS" | grep -qi "access-control-allow-origin.*\*"; then
    log_result "FAIL" "CORS" "Credentials + wildcard origin" "CRITICAL: credentials with * origin"
  else
    log_result "PASS" "CORS" "CORS credentials config" "Credentials allowed only for specific origins"
  fi
else
  log_result "PASS" "CORS" "No credential reflection" "No Access-Control-Allow-Credentials: true"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 6: RATE LIMITING
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 6. RATE LIMITING ──${NC}\n\n"

RATE_BLOCKED=0
for i in $(seq 1 25); do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"brute@force.com","password":"attempt'$i'"}')
  if [ "$HTTP" = "429" ]; then
    RATE_BLOCKED=1
    log_result "PASS" "RATE-LIMIT" "Login rate limiting active" "Blocked after $i attempts (HTTP 429)"
    break
  fi
done
if [ "$RATE_BLOCKED" = "0" ]; then
  log_result "FAIL" "RATE-LIMIT" "No login rate limiting" "25 rapid login attempts — all accepted. Brute-force risk."
fi

# Staff OTP rate limiting
RATE_BLOCKED_OTP=0
for i in $(seq 1 20); do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$STAFF_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\":\"900000000$i\"}")
  if [ "$HTTP" = "429" ]; then
    RATE_BLOCKED_OTP=1
    log_result "PASS" "RATE-LIMIT" "OTP request rate limiting" "Blocked after $i attempts"
    break
  fi
done
if [ "$RATE_BLOCKED_OTP" = "0" ]; then
  log_result "FAIL" "RATE-LIMIT" "No OTP request rate limiting" "20 rapid OTP requests accepted. SMS abuse risk."
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 7: BUSINESS LOGIC VULNERABILITIES
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 7. BUSINESS LOGIC ──${NC}\n\n"

# 7.1 Negative price in medicine creation (needs auth, test with bogus)
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/medicines" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hack Med","sku":"HACK-001","batchNumber":"HACK-001","category":"Test","price":-100,"stock":999,"expiryDate":"2030-01-01"}')
if [ "$HTTP" = "401" ]; then
  log_result "PASS" "BUSINESS" "Negative price test" "Auth required first (manual test needed with valid token)"
else
  log_result "WARN" "BUSINESS" "Negative price test" "HTTP $HTTP — verify server-side price validation"
fi

# 7.2 OTP brute-force (try multiple OTPs)
OTP_BRUTE_BLOCKED=0
for otp in 000000 111111 222222 333333 444444 555555 666666 777777 888888 999999; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$STAFF_BASE/auth/verify" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\":\"9999888877\",\"otp\":\"$otp\"}")
  if [ "$HTTP" = "429" ]; then
    OTP_BRUTE_BLOCKED=1
    log_result "PASS" "BUSINESS" "OTP brute-force rate limiting" "Blocked after several attempts"
    break
  fi
done
if [ "$OTP_BRUTE_BLOCKED" = "0" ]; then
  log_result "FAIL" "BUSINESS" "No OTP brute-force protection" "10 OTP attempts accepted without lockout"
fi

# 7.3 Subscription webhook without signature
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$STAFF_BASE/subscription/webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"subscription.activated","payload":{"subscription":{"id":"sub_fake"}}}')
BODY=$(cat /tmp/sec_resp.json 2>/dev/null)
if [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
  log_result "PASS" "BUSINESS" "Webhook signature validation" "Unsigned webhook rejected (HTTP $HTTP)"
else
  log_result "FAIL" "BUSINESS" "Webhook accepts unsigned payloads" "HTTP $HTTP — webhook may not verify x-razorpay-signature"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 8: INFORMATION DISCLOSURE
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 8. INFORMATION DISCLOSURE ──${NC}\n\n"

# 8.1 Error message verbosity
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":123}')
BODY=$(cat /tmp/sec_resp.json)
if echo "$BODY" | grep -qi "stack\|trace\|typeorm\|prisma\|sequelize\|internal"; then
  log_result "FAIL" "INFO-DISC" "Stack trace in error response" "Internal details leaked"
else
  log_result "PASS" "INFO-DISC" "No stack trace leak" "Error response is clean"
fi

# 8.2 Try common debug/admin endpoints
for path in "/debug" "/swagger" "/api-docs" "/graphql" "/health" "/.env" "/config" "/admin" "/status" "/metrics"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  if [ "$HTTP" = "200" ]; then
    log_result "WARN" "INFO-DISC" "Exposed endpoint: $path" "Returns 200 — may leak sensitive info"
  fi
done

# 8.3 Try API docs on admin prefix
for path in "/swagger" "/api-docs" "/docs" "/openapi.json"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE$path")
  if [ "$HTTP" = "200" ]; then
    log_result "WARN" "INFO-DISC" "API docs exposed: /api/v1$path" "Should be behind auth in production"
  fi
done

# 8.4 Verbose validation errors
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$ADMIN_BASE/medicines" \
  -H "Authorization: Bearer invalidtoken" \
  -H "Content-Type: application/json" \
  -d '{}')
BODY=$(cat /tmp/sec_resp.json)
if echo "$BODY" | grep -qi "class-validator\|typeorm\|QueryFailedError\|relation.*does not exist"; then
  log_result "FAIL" "INFO-DISC" "ORM/framework info in errors" "Internal framework details exposed"
else
  log_result "PASS" "INFO-DISC" "No framework leak in errors" "Error messages are generic"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 9: HTTP METHOD SECURITY
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 9. HTTP METHOD SECURITY ──${NC}\n\n"

# 9.1 Test dangerous HTTP methods
for method in DELETE PUT TRACE; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$ADMIN_BASE/users")
  if [ "$HTTP" = "404" ] || [ "$HTTP" = "405" ] || [ "$HTTP" = "401" ]; then
    log_result "PASS" "HTTP-METHOD" "$method on /users rejected" "HTTP $HTTP"
  else
    log_result "WARN" "HTTP-METHOD" "$method on /users" "HTTP $HTTP — unexpected response"
  fi
done

# 9.2 TRACE method (XST attack vector)
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X TRACE "$BASE/")
if [ "$HTTP" = "405" ] || [ "$HTTP" = "404" ] || [ "$HTTP" = "501" ]; then
  log_result "PASS" "HTTP-METHOD" "TRACE method disabled" "HTTP $HTTP"
else
  log_result "FAIL" "HTTP-METHOD" "TRACE method enabled" "HTTP $HTTP — Cross-Site Tracing (XST) risk"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 10: DENIAL OF SERVICE RESILIENCE
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 10. DENIAL OF SERVICE RESILIENCE ──${NC}\n\n"

# 10.1 Large JSON body
LARGE_JSON=$(python3 -c "import json; print(json.dumps({'data': 'x' * 1000000}))")
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LARGE_JSON" 2>/dev/null)
if [ "$HTTP" = "413" ] || [ "$HTTP" = "400" ] || [ "$HTTP" = "401" ]; then
  log_result "PASS" "DOS" "Large body handling" "HTTP $HTTP — server handles large payloads"
else
  log_result "WARN" "DOS" "Large body handling" "HTTP $HTTP — check body size limits"
fi

# 10.2 Deeply nested JSON
NESTED=$(python3 -c "s=''; [s:='{\"a\":'+s+'}' for _ in range(100)]; print(s)" 2>/dev/null || echo '{"a":"b"}')
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$ADMIN_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "$NESTED" 2>/dev/null)
if [ "$HTTP" = "400" ] || [ "$HTTP" = "413" ] || [ "$HTTP" = "401" ]; then
  log_result "PASS" "DOS" "Deeply nested JSON" "HTTP $HTTP"
else
  log_result "WARN" "DOS" "Deeply nested JSON" "HTTP $HTTP — check JSON depth limits"
fi

# ─────────────────────────────────────────────────────────────────
# SECTION 11: STAFF API SECURITY
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}── 11. STAFF API SECURITY ──${NC}\n\n"

# 11.1 Protected staff endpoints without auth
for endpoint in "/pharmacy/profile" "/inventory" "/billing/invoices" "/crm/doctors" "/crm/patients" "/notifications" "/subscription/trial-status"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$STAFF_BASE$endpoint")
  if [ "$HTTP" = "401" ]; then
    log_result "PASS" "STAFF-AUTH" "No-auth blocked: $endpoint" "Returns 401"
  elif [ "$HTTP" = "404" ]; then
    log_result "PASS" "STAFF-AUTH" "Route not found: $endpoint" "HTTP 404 (route may not exist)"
  else
    log_result "FAIL" "STAFF-AUTH" "Unauthenticated access: $endpoint" "HTTP $HTTP — endpoint exposed!"
  fi
done

# 11.2 Phone number validation
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$STAFF_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"abc"}')
if [ "$HTTP" = "400" ]; then
  log_result "PASS" "STAFF-AUTH" "Invalid phone format rejected" "HTTP 400"
else
  log_result "WARN" "STAFF-AUTH" "Invalid phone format" "HTTP $HTTP — verify phone validation"
fi

# 11.3 Phone number too short
HTTP=$(curl -s -o /tmp/sec_resp.json -w "%{http_code}" -X POST "$STAFF_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"123"}')
if [ "$HTTP" = "400" ]; then
  log_result "PASS" "STAFF-AUTH" "Short phone number rejected" "HTTP 400"
else
  log_result "WARN" "STAFF-AUTH" "Short phone number" "HTTP $HTTP — verify length validation"
fi

# ─────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────
printf "\n${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"
printf "${BOLD}  SECURITY TEST SUMMARY${NC}\n"
printf "${BOLD}═══════════════════════════════════════════════════════════════${NC}\n"
printf "  Total tests:  ${BOLD}$TOTAL${NC}\n"
printf "  ${GREEN}Passed:  $PASS${NC}\n"
printf "  ${RED}Failed:  $FAIL${NC}\n"
printf "  ${YELLOW}Warnings: $WARN${NC}\n"
printf "${BOLD}═══════════════════════════════════════════════════════════════${NC}\n\n"

if [ "$FAIL" -gt 0 ]; then
  printf "${RED}${BOLD}RESULT: SECURITY ISSUES FOUND — see FAIL items above${NC}\n\n"
else
  printf "${GREEN}${BOLD}RESULT: No critical failures detected${NC}\n\n"
fi

rm -f /tmp/sec_resp.json /tmp/sec_resp1.json /tmp/sec_resp2.json /tmp/staff_login.json /tmp/staff_otp.json
