const express = require('express');
// Destructure the functions from postController.js
const {createPost, getPosts} = require('../controllers/postController');  
const router = express.Router();

router.get('/', (req, res) => {
  getPosts(req, res);
});     

router.post('/', (req, res) => {
  createPost(req, res);
}); 

//Export the router 
module.exports = router;    