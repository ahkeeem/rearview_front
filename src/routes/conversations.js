const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all conversations for current user
router.get('/api/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    const conversations = await db.query(
      `SELECT 
        c.id,
        c.created_at,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        u.name as other_user_name,
        u.photo_url as other_user_photo
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       JOIN users u ON cp.user_id = u.id
       WHERE cp.user_id = ?
       ORDER BY c.updated_at DESC`,
      [currentUserId, currentUserId]
    );

    res.json(conversations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});
// Create new conversation
router.post('/api/conversations', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id; // This comes from your token
    
    console.log('Token user:', currentUserId);
    console.log('Target user:', userId);
    
    // Start transaction
    await db.query('START TRANSACTION');

    // Create new conversation
    const result = await db.query(
      'INSERT INTO conversations (created_at) VALUES (NOW())',
      [],
      true // Enable detailed error logging
    );

    console.log('Conversation created:', result);

    // Add participants
    await db.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
      [result.insertId, currentUserId, result.insertId, userId],
      true
    );

    await db.query('COMMIT');

    const newConversation = {
      id: result.insertId,
      created_at: new Date(),
      participants: [currentUserId, userId]
    };

    res.status(201).json(newConversation);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Detailed error:', error);
    res.status(500).json({ error: error.message || 'Failed to create conversation' });
  }
});

module.exports = router;