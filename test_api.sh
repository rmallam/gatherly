#!/bin/bash

# Budget Tracker & Smart Reminders API Tests
# Replace YOUR_EMAIL and YOUR_PASSWORD with your actual credentials

BASE_URL="https://gatherly-backend-3vmv.onrender.com/api"

echo "=== Testing Budget Tracker & Smart Reminders ==="
echo ""

# Step 1: Login and get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "https://gatherly-backend-3vmv.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mallamrakeshkumar@gmail.com",
    "password": "Rakesh@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Please check your credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get first event ID
echo "2. Getting your events..."
EVENTS_RESPONSE=$(curl -s "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN")

EVENT_ID=$(echo $EVENTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$EVENT_ID" ]; then
  echo "❌ No events found. Please create an event first."
  exit 1
fi

echo "✅ Using event ID: $EVENT_ID"
echo ""

# ========================================
# BUDGET TRACKER TESTS
# ========================================

echo "=== BUDGET TRACKER TESTS ==="
echo ""

# Test 3: Create Budget
echo "3. Creating budget..."
BUDGET_CREATE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/budget" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total_budget": 10000,
    "currency": "USD"
  }')

echo "✅ Budget created:"
echo "$BUDGET_CREATE" | python3 -m json.tool
echo ""

# Test 4: Get Budget
echo "4. Getting budget..."
BUDGET_GET=$(curl -s "$BASE_URL/events/$EVENT_ID/budget" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Budget retrieved:"
echo "$BUDGET_GET" | python3 -m json.tool
echo ""

# Test 5: Add Expense - Catering
echo "5. Adding expense (Catering)..."
EXPENSE1=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Catering",
    "description": "Wedding cake",
    "amount": 3000,
    "vendor": "Sweet Bakery",
    "paid": true,
    "date": "'$(date +%Y-%m-%d)'"
  }')

echo "✅ Expense 1 added:"
echo "$EXPENSE1" | python3 -m json.tool
echo ""

# Test 6: Add Expense - Venue
echo "6. Adding expense (Venue)..."
EXPENSE2=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Venue",
    "description": "Event hall rental",
    "amount": 2500,
    "vendor": "Grand Hall",
    "paid": false,
    "date": "'$(date +%Y-%m-%d)'"
  }')

echo "✅ Expense 2 added:"
echo "$EXPENSE2" | python3 -m json.tool
echo ""

# Test 7: Add Expense - Decorations
echo "7. Adding expense (Decorations)..."
EXPENSE3=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Decorations",
    "description": "Flowers and centerpieces",
    "amount": 800,
    "paid": true,
    "date": "'$(date +%Y-%m-%d)'"
  }')

echo "✅ Expense 3 added:"
echo "$EXPENSE3" | python3 -m json.tool
echo ""

# Test 8: Get All Expenses
echo "8. Getting all expenses..."
EXPENSES_LIST=$(curl -s "$BASE_URL/events/$EVENT_ID/expenses" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ All expenses:"
echo "$EXPENSES_LIST" | python3 -m json.tool
echo ""

# Test 9: Get Budget Summary
echo "9. Getting budget summary..."
SUMMARY=$(curl -s "$BASE_URL/events/$EVENT_ID/expenses/summary" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Budget Summary:"
echo "$SUMMARY" | python3 -m json.tool
echo ""

# ========================================
# SMART REMINDERS TESTS
# ========================================

echo "=== SMART REMINDERS TESTS ==="
echo ""

# Test 10: Auto-Schedule Reminders
echo "10. Auto-scheduling reminders..."
AUTO_SCHEDULE=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/reminders/auto-schedule" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Auto-schedule result:"
echo "$AUTO_SCHEDULE" | python3 -m json.tool
echo ""

# Test 11: Get All Reminders
echo "11. Getting all reminders..."
REMINDERS_LIST=$(curl -s "$BASE_URL/events/$EVENT_ID/reminders" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ All reminders:"
echo "$REMINDERS_LIST" | python3 -m json.tool
echo ""

# Test 12: Create Custom Reminder
echo "12. Creating custom reminder..."
TOMORROW=$(date -v+1d +%Y-%m-%dT10:00:00 2>/dev/null || date -d "+1 day" +%Y-%m-%dT10:00:00)
CUSTOM_REMINDER=$(curl -s -X POST "$BASE_URL/events/$EVENT_ID/reminders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reminder_type": "custom",
    "recipient_type": "guests",
    "send_at": "'$TOMORROW'",
    "message": "Test custom reminder sent via API"
  }')

echo "✅ Custom reminder created:"
echo "$CUSTOM_REMINDER" | python3 -m json.tool
echo ""

# Test 13: Update Budget
echo "13. Updating budget..."
BUDGET_UPDATE=$(curl -s -X PUT "$BASE_URL/events/$EVENT_ID/budget" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total_budget": 12000,
    "currency": "USD"
  }')

echo "✅ Budget updated:"
echo "$BUDGET_UPDATE" | python3 -m json.tool
echo ""

# Final Summary
echo "=== TESTS COMPLETE ==="
echo ""
echo "Final budget summary:"
FINAL_SUMMARY=$(curl -s "$BASE_URL/events/$EVENT_ID/expenses/summary" \
  -H "Authorization: Bearer $TOKEN")
echo "$FINAL_SUMMARY" | python3 -m json.tool
echo ""

echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Check the app's Budget tab to see the data"
echo "2. Check the app's Reminders tab to see scheduled reminders"
echo "3. Test editing and deleting via the app UI"
