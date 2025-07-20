const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log(" Request received at /api/register");
  // Sending a response with custom data added by middleware

  const sampleData = {
    message: 'Registration endpoint',
    status: 'success'
  };
  res.json(sampleData); // Removed res.customData to avoid undefined error
}); 

module.exports = router;