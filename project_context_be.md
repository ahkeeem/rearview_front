# Rearview Project Context

## Database Structure
- users (with admin role support)
- reviews
- verifications
- reports
- user_sessions
- activity_logs
- connections (with request status: pending/accepted/rejected)
- conversations
- conversation_participants
- messages

## Implemented Features
1. User Management
   - Registration
   - Login with session management
   - Activity logging
   - Profile management

2. Admin System
   - Admin role verification
   - Verification review capabilities
   - Protected admin routes

3. Authentication
   - JWT token implementation
   - Session management
   - Admin middleware
   - Auth middleware

4. Trust Score System
   - 100-point scale calculation
   - Weighted components (60% reviews, 25% verification, 15% connections)
   - Time decay factor for reviews
   - Integration with user stats

5. Report Management
   - Report submission
   - Admin review system
   - Status tracking
   - Integration with trust scores

6. Connection System
   - Connection requests (pending by default)
   - Accept/Reject functionality
   - Status tracking (pending/accepted/rejected)
   - Bi-directional connection representation
   - Single database entry per connection
   - Connection count based on accepted status only

7. Messaging System
   - Real-time messaging with Socket.IO
   - Conversation management
   - Message history
   - Read status tracking
   - User typing indicators
   - Real-time notifications

## API Design
1. User Routes
   - POST /api/users/ (create user)
   - POST /api/users/login
   - GET /api/users/ (get all users)
   - GET /api/users/:id/stats (get user trust score and stats)

2. Admin Routes
   - PUT /api/admin/verifications/:id (review verification)
   - GET /api/admin/verifications/pending

3. Report Routes
   - POST /api/reports (create report)
   - GET /api/reports (admin: get all reports)
   - PUT /api/reports/:id/status (update report status)

4. Connection Routes
   - POST /api/connections (create connection request)
   - GET /api/connections (get user connections with status)
   - PUT /api/connections/:id/status (accept/reject connection)

5. Message Routes
   - GET /api/conversations (get user conversations)
   - GET /api/messages/:conversationId (get conversation messages)
   - POST /api/messages (create new message)

## WebSocket Events
- join-conversation
- send-message
- new-message
- typing
- user-typing

## Test Credentials
Test User: Simon Down
Email: simondown@example.com
Password: TestPass123!

## Tech Stack
- Node.js/Express
- MySQL
- JWT Authentication
- Socket.IO for real-time features

## Frontend Integration Points
1. Connection Management
   - Display connection status (pending/accepted)
   - Show appropriate action buttons based on status
   - Update connection count only for accepted connections
   - Separate views for incoming and outgoing requests

## Next Steps
1. Frontend Development
2. Enhanced Admin Dashboard
3. User Experience Improvements




curl -X PUT -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR
5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczOTY2MDcyO
SwiZXhwIjoxNzM5NzQ3MTI5fQ.XQY7stvsqgazePaHiOkmZ6jR_
XuNkIyUT4adT7MKlX8" -H "Content-Type: application/json" -d '{"status":"accepted"}' http://localhost:4000/api/connections/6/status
