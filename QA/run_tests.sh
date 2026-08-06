#!/usr/bin/env bash
#
# QA regression test suite - Task Manager Backend
# Run against a local instance: npm run dev (default http://localhost:3000)
#
# Usage:
#   chmod +x run_tests.sh
#   ./run_tests.sh
#
# Notes:
# - Requires curl and jq (https://stedolan.github.io/jq/) for parsing responses.
# - Uses two disposable test users. Re-running registers the same emails again,
#   which will correctly fail with 409 Conflict on the second run - that's expected,
#   the script still proceeds to login.

BASE_URL="${BASE_URL:-http://localhost:3000}"
USER_A_EMAIL="qa-user-a@test.com"
USER_B_EMAIL="qa-user-b@test.com"
PASSWORD="Password123!"

PASS=0
FAIL=0

check_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" == "$expected" ]; then
    echo "  PASS - $description (expected $expected, got $actual)"
    PASS=$((PASS+1))
  else
    echo "  FAIL - $description (expected $expected, got $actual)"
    FAIL=$((FAIL+1))
  fi
}

echo "=============================================="
echo "1. AUTH MIDDLEWARE - error status codes"
echo "=============================================="

echo "-- No Authorization header"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" "$BASE_URL/tasks")
check_status "No auth header returns 401" "401" "$STATUS"
cat /tmp/resp.json; echo

echo "-- Invalid/garbage token"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" \
  -H "Authorization: Bearer garbage.invalid.token" \
  "$BASE_URL/tasks")
check_status "Invalid token returns 401" "401" "$STATUS"
cat /tmp/resp.json; echo

echo "-- Malformed auth scheme (Basic instead of Bearer)"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" \
  -H "Authorization: Basic sometoken" \
  "$BASE_URL/tasks")
check_status "Malformed scheme returns 401" "401" "$STATUS"
cat /tmp/resp.json; echo


echo "=============================================="
echo "2. REGISTRATION + LOGIN - setup for IDOR tests"
echo "=============================================="

echo "-- Register User A"
curl -s -X POST "$BASE_URL/registration" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_A_EMAIL\",\"password\":\"$PASSWORD\"}" | tee /tmp/reg_a.json
echo

echo "-- Register User B"
curl -s -X POST "$BASE_URL/registration" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_B_EMAIL\",\"password\":\"$PASSWORD\"}" | tee /tmp/reg_b.json
echo

echo "-- Login User A"
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_A_EMAIL\",\"password\":\"$PASSWORD\"}" > /tmp/login_a.json
TOKEN_A=$(jq -r '.accessToken' /tmp/login_a.json)
echo "  Got TOKEN_A: ${TOKEN_A:0:20}..."

echo "-- Login User B"
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_B_EMAIL\",\"password\":\"$PASSWORD\"}" > /tmp/login_b.json
TOKEN_B=$(jq -r '.accessToken' /tmp/login_b.json)
echo "  Got TOKEN_B: ${TOKEN_B:0:20}..."

if [ "$TOKEN_A" == "null" ] || [ "$TOKEN_B" == "null" ]; then
  echo "ERROR: could not obtain access tokens, aborting IDOR tests."
  echo "Passed: $PASS  Failed: $FAIL"
  exit 1
fi


echo "=============================================="
echo "3. TASK VALIDATION (Zod)"
echo "=============================================="

echo "-- Create task with missing 'name' field (should fail validation)"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"description":"missing name field"}')
check_status "Missing name returns 400" "400" "$STATUS"
cat /tmp/resp.json; echo


echo "=============================================="
echo "4. IDOR TEST - cross-user task access"
echo "=============================================="

echo "-- Create a task as User A"
curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"name":"User A private task","description":"IDOR regression test"}' > /tmp/task_created.json
cat /tmp/task_created.json
TASK_ID=$(jq -r '.[0].id' /tmp/task_created.json)
echo "  Created task ID: $TASK_ID"

if [ "$TASK_ID" == "null" ] || [ -z "$TASK_ID" ]; then
  echo "ERROR: could not create test task, aborting IDOR checks."
  echo "Passed: $PASS  Failed: $FAIL"
  exit 1
fi

echo "-- User B attempts to UPDATE User A's task"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X PATCH "$BASE_URL/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{"name":"Hijacked by User B","description":"should not be allowed"}')
check_status "Cross-user update is blocked (non-2xx)" "500" "$STATUS"
echo "  (NOTE: expected long-term is 403/404, currently returns 500 - see QA report)"
cat /tmp/resp.json; echo

echo "-- User B attempts to COMPLETE User A's task"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X PATCH "$BASE_URL/tasks/$TASK_ID/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{"finished":true}')
check_status "Cross-user complete is blocked (non-2xx)" "500" "$STATUS"
cat /tmp/resp.json; echo

echo "-- User B attempts to DELETE User A's task"
STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X DELETE "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN_B")
check_status "Cross-user delete is blocked (non-2xx)" "500" "$STATUS"
cat /tmp/resp.json; echo

echo "-- Verify User A's task is unchanged after all 3 attempts"
curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN_A" > /tmp/verify.json
cat /tmp/verify.json
UNCHANGED_NAME=$(jq -r ".[] | select(.id==$TASK_ID) | .name" /tmp/verify.json)
if [ "$UNCHANGED_NAME" == "User A private task" ]; then
  echo "  PASS - Task name unchanged after IDOR attempts"
  PASS=$((PASS+1))
else
  echo "  FAIL - Task was modified! Got name: $UNCHANGED_NAME"
  FAIL=$((FAIL+1))
fi


echo "=============================================="
echo "RESULTS: $PASS passed, $FAIL failed"
echo "=============================================="
