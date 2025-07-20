const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(req);
  res.send('Hello, User!');
});     

router.post('/', (req, res) => {
  res.send('User created!');
}); 

//Export the router 
module.exports = router;    
