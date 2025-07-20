const canvasModel = require ('../models/canvasModel');
require('dotenv').config();

const getAllCanvas = async (req, res) => {
    const email = req.email; // Assuming you have user authentication middleware that sets req.user
    try{
        const canvases = await canvasModel.getAllCanvasesForUser(email);
        res.status(200).json(canvases);
    } catch (error) {
        console.error('Error fetching canvases:', error);
        res.status(500).json({ message: 'Error fetching canvases', error: error.message });
    }   
};

const createCanvas = async (req, res) => {
    const email = req.email; // Assuming you have user authentication middleware that sets req.user
    // Assuming you have user authentication middleware that sets req.user
   const { name} = req.body; // Assuming the request body contains name and description
    if (!name) {
        return res.status(400).json({ message: 'Name required' });
    }
    try {
        const newCanvas = await canvasModel.createCanvasForUser(email, {
            canvasName: name
        });
        res.status(201).json(newCanvas);
    } catch (error) {
        console.error('Error creating canvas:', error); 
        res.status(400).json({ message: 'Error creating canvas', error: error.message });
    }
};

const loadCanvas = async (req, res) => {
    const email = req.email; // Assuming you have user authentication middleware that sets req.user
    const canvasId = req.params.canvasId; // Get the canvas ID from the request parameters  
    try {
        const canvas = await canvasModel.loadCanvasByIdForUser(email, canvasId);
        if (!canvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }
        res.status(200).json(canvas);
    } catch (error) {
        console.error('Error loading canvas:', error);
        res.status(500).json({ message: 'Error loading canvas', error: error.message });
    }
}

const updateCanvas = async (req, res) => {
    const email = req.email; // Assuming you have user authentication middleware that sets req.user
    const canvasId = req.params.canvasId; // Get the canvas ID from the request parameters
    const updateData = req.body; // Get the update data from the request body
    try {
        const updatedCanvas = await canvasModel.updateCanvasForUser(email, canvasId, updateData);
        if (!updatedCanvas) {
            return res.status(404).json({ message: 'Canvas not found' });
        }
        res.status(200).json(updatedCanvas);
    } catch (error) {
        console.error('Error updating canvas:', error);
        res.status(500).json({ message: 'Error updating canvas', error: error.message });
    }
    }
    


const shareCanvas = async (req, res) => {
  const ownerEmail = req.email; // from auth
  const canvasId = req.params.canvasId;
  const { email } = req.body; // target email from frontend

  if (!email) {
    return res.status(400).json({ message: 'Target email to share with is required' });
  }

  try {
    const updatedCanvas = await canvasModel.addUserToSharedWith(ownerEmail, canvasId, email);
    res.status(200).json({ message: 'Canvas shared successfully', canvas: updatedCanvas });

  } catch (error) {
    console.error('Error sharing canvas:', error);

    switch (error.message) {
      case 'OwnerNotFound':
        return res.status(404).json({ message: 'Owner not found' });
      case 'CanvasNotFound':
        return res.status(404).json({ message: 'Canvas not found' });
      case 'NotAuthorized':
        return res.status(403).json({ message: 'You do not have permission to share this canvas' });
      case 'TargetUserNotFound':
        return res.status(404).json({ message: 'User to share with not found' });
      case 'AlreadyShared':
        return res.status(400).json({ message: 'Canvas already shared with this user' });
      default:
        return res.status(500).json({ message: 'Error sharing canvas', error: error.message });
    }
  }
};

const deleteCanvas = async (req, res) => {
  const ownerEmail = req.email; // ✅ from authenticationMiddleware
  const canvasId = req.params.canvasId;

  try {
    const deletedCanvas = await canvasModel.deleteCanvasForUser(ownerEmail, canvasId);

    return res.status(200).json({
      message: '✅ Canvas deleted successfully',
      canvas: deletedCanvas,
    });
  } catch (error) {
    console.error('Error deleting canvas:', error.message);

    // Map errors from model
    switch (error.message) {
      case 'Owner not found':
        return res.status(404).json({ message: 'Owner not found' });

      case 'Canvas not found or you do not have permission to delete it':
        return res.status(404).json({ message: 'Canvas not found or not owned by you' });

      case 'Not authorized to delete this canvas':
        return res.status(403).json({ message: 'You are not authorized to delete this canvas' });

      case 'Error deleting canvas':
        return res.status(500).json({ message: 'Error deleting canvas' });

      default:
        return res.status(500).json({ message: 'Error deleting canvas', error: error.message });
    }
  }
};


module.exports = {
    getAllCanvas,
    createCanvas,
    loadCanvas,
    updateCanvas,
    shareCanvas,
    deleteCanvas,
};