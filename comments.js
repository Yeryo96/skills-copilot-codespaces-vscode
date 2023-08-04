// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto'); // randomBytes is asynchronous
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []); // [] is returned if commentsByPostId[req.params.id] is undefined
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex'); // Generate random string
  const { content } = req.body; // Extract content from request body

  const comments = commentsByPostId[req.params.id] || []; // Get comments for a post
  comments.push({ id: commentId, content, status: 'pending' }); // Add new comment to comments
  commentsByPostId[req.params.id] = comments; // Update comments for a post

  // Emit comment created event
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' },
  });

  res.status(201).send(comments); // Return created comments
});

// Receive events from event bus
app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, content, postId, status } = data;

    // Get comments for a post
    const comments = commentsByPostId[postId];
    // Find comment with id
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    // Set the status of the comment
    comment.status = status;

    // Emit comment updated event
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: { id, content, postId, status },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
