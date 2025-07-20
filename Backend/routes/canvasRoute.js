const  express = require('express');

const { getAllCanvas, createCanvas, loadCanvas, updateCanvas, shareCanvas, deleteCanvas} = require('../controllers/canvasController');
const authenticationMiddleware = require('../Middlewares/authenticationMiddleware');

const router = express.Router();    

router.get('/',authenticationMiddleware, getAllCanvas); // Route to get all canvases for the authenticated user
router.post('/', authenticationMiddleware, createCanvas); // Route to create a new canvas for the authenticated user
router.get('/load/:canvasId', authenticationMiddleware, loadCanvas); // Route to load a specific canvas by ID for the authenticated user
router.put('/:canvasId', authenticationMiddleware, updateCanvas); // Route to update a specific canvas by ID for the authenticated user
router.put('/share/:canvasId', authenticationMiddleware, shareCanvas); // Route to share a canvas with another user
// Delete canvas 
router.delete('/:canvasId', authenticationMiddleware, deleteCanvas); // Route to delete a specific canvas by ID for the authenticated user
module.exports = router;

