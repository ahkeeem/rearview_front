#!/bin/bash
set -e

echo "Logging in Simon..."
SIMON_RES=$(curl -s -X POST http://localhost:4000/api/users/login -H "Content-Type: application/json" -d '{"email":"SimonDown@example.com","password":"TestPass123!"}')
SIMON_TOKEN=$(echo $SIMON_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Logging in Simple Pharma..."
SIMPLE_RES=$(curl -s -X POST http://localhost:4000/api/users/login -H "Content-Type: application/json" -d '{"email":"simple@yahoo.com","password":"TestPass123!"}')
SIMPLE_TOKEN=$(echo $SIMPLE_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Simon sending connection request to Simple Pharma..."
CONN_RES=$(curl -s -X POST http://localhost:4000/api/connections -H "Content-Type: application/json" -H "Authorization: Bearer $SIMON_TOKEN" -d '{"connected_user_id": 13}')
CONN_ID=$(echo $CONN_RES | grep -o '"connectionId":[0-9]*' | cut -d':' -f2)
echo "Connection ID: $CONN_ID"

echo "Simple Pharma accepting connection..."
curl -s -X PUT http://localhost:4000/api/connections/$CONN_ID/status -H "Content-Type: application/json" -H "Authorization: Bearer $SIMPLE_TOKEN" -d '{"status": "accepted"}'

echo "Simon creating conversation..."
CONV_RES=$(curl -s -X POST http://localhost:4000/api/conversations -H "Content-Type: application/json" -H "Authorization: Bearer $SIMON_TOKEN" -d '{"userId": 13}')
CONV_ID=$(echo $CONV_RES | grep -o '"conversationId":[0-9]*' | cut -d':' -f2)
echo "Conversation ID: $CONV_ID"

echo "Simon sending message..."
curl -s -X POST http://localhost:4000/api/messages -H "Content-Type: application/json" -H "Authorization: Bearer $SIMON_TOKEN" -d "{\"conversationId\": $CONV_ID, \"content\": \"Hello from Simon over API test!\"}"

echo -e "\nFlow test complete."
