const mongoose = require('mongoose');
require('dotenv').config();
const canvasSchema = new mongoose.Schema(
  {
    canvasId: {
      type: String,
      required: true,
      unique: true, // each canvas gets its own unique id
      index: true,
    },
    canvasName: {
      type: String,
      required: true,
      trim: true,
    },

    // Owner of this canvas
    owner: {
      type: mongoose.Schema.Types.ObjectId, // reference to another document id 
      ref: 'User',// reference to User model
      required: true,
    },

    // Elements drawn on canvas (could be shapes, paths, text etc.)
    elements: {
        type: [{type : mongoose.Schema.Types.Mixed}], // Mixed type allows for flexibility in element structure
        default: [], // Default to an empty array
    },

    // List of users this canvas is shared with
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Optional metadata (like background color or size)
    backgroundColor: {
      type: String,
      default: '#FFFFFF',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
    // collection: 'canvases',
  }
);

// Get all canvases for a specific user (both owner and shared with) given their email

canvasSchema.statics.getAllCanvasesForUser = async function (email) {
   
        const user = await mongoose.model('User').findOne({ email });
        try{
        if (!user) {
            return  Error('User not found');

        }
        const canvases = await this.find(
           {$or: [{ owner: user._id }, { sharedWith: user._id }]},
        'canvasId canvasName owner sharedWith createdAt updatedAt'
    )
    .populate('owner', 'username email')
    .populate('sharedWith', 'username email')
    .sort({ createdAt: -1 }); // Sort by creation date, most recent first 

    return canvases;

    } 
      catch (error) {
          return Error('Error finding user: ' + error.message);
        }       
}


// Create a new canvas for a user with given email 

canvasSchema.statics.createCanvasForUser = async function (email, canvasData) {
    const user = await mongoose.model('User').findOne({ email });
    try {
      if (!user) {
        throw new Error('User not found');
    }
    const newCanvas = new this({
        owner: user._id, // Set the owner to the found user
        canvasName: canvasData.canvasName || 'Untitled Canvas',
        canvasId: canvasData.canvasId || new mongoose.Types.ObjectId().toString(), // Generate a unique canvasId if not provided
        elements: canvasData.elements || [],
        backgroundColor: canvasData.backgroundColor || '#FFFFFF',
        isLocked: canvasData.isLocked || false,
        sharedWith: canvasData.sharedWith || [],
    });
    
    await newCanvas.save();
    return newCanvas;
    }
    catch (error) {
        throw new Error('Error creating canvas: ' + error.message);
    }
}

canvasSchema.statics.loadCanvasByIdForUser = async function (email, canvasId) {
    const user = await mongoose.model('User').findOne({ email });
    try {
        if (!user) {
            throw new Error('User not found');
        }
        const canvas = await this.findOne({
            canvasId: canvasId,
            $or: [{ owner: user._id }, { sharedWith: user._id }],
        })
        .populate('owner', 'username email')
        .populate('sharedWith', 'username email');

        if (!canvas) {
            throw new Error('Canvas not found');
        }
        return canvas;
    } catch (error) {
        throw new Error('Error loading canvas: ' + error.message);
    }
};

canvasSchema.statics.updateCanvasForUser = async function (email, canvasId, updateData) {
  const user = await mongoose.model('User').findOne({ email });
  try {
    if (!user) {
      throw new Error('User not found');
    }
    const canvas = await this.findOne({
      canvasId: canvasId,
      $or: [{ owner: user._id }, { sharedWith: user._id }],
    })
    if(!canvas) {
      return Error('Canvas not found');
    }
    // Update the canvas properties
    if (updateData.canvasName) {
      canvas.canvasName = updateData.canvasName;
    }
    if (updateData.backgroundColor!== undefined) {
      canvas.backgroundColor = updateData.backgroundColor;
    }
    if (updateData.isLocked !== undefined) {
      canvas.isLocked = updateData.isLocked;
    }
    if (updateData.sharedWith) {
      canvas.sharedWith = updateData.sharedWith;
    }
    if (updateData.elements) {
      canvas.elements = updateData.elements;
    }
    // Save the updated canvas

    const updatedCanvas = await canvas.save();
    return updatedCanvas;
  }
  catch (error) {
    throw new Error('Error updating canvas: ' + error.message);
  } 
}

canvasSchema.statics.addUserToSharedWith = async function (ownerEmail, canvasId, targetEmail) {
  try {
    // Find owner
    const owner = await mongoose.model('User').findOne({ email: ownerEmail });
    if (!owner) throw new Error('Owner not found');

    const canvas = await this.findOne({ canvasId });
    if (!canvas) throw new Error('CanvasNotFound'); 

    // Check if the requester is actually the owner
    if (canvas.owner.toString() !== owner._id.toString()) {
      throw new Error('NotAuthorized');
    }

    // Find target user
    const targetUser = await mongoose.model('User').findOne({ email: targetEmail });
    if (!targetUser) throw new Error('User to share with not found');

    // Check if already shared
    if (canvas.sharedWith.some(id => id.toString() === targetUser._id.toString())) {
      throw new Error('Already shared with this user');
    }

    // Add to sharedWith
    canvas.sharedWith.push(targetUser._id);
    const updatedCanvas = await canvas.save();
    return updatedCanvas;
  } catch (err) {
    throw err;
  }
};

canvasSchema.statics.deleteCanvasForUser = async function (owneremail, canvasId) {
  try{
    const owner = await mongoose.model('User').findOne({ email: owneremail });
  if (!owner) {
    throw new Error('Owner not found');
  }
  const canvas = await this.findOne({
    canvasId: canvasId,
    owner: owner._id,
  });

  if (!canvas) {
    throw new Error('Canvas not found or you do not have permission to delete it');
  }

  // check if the requeeter is the owner of the canvas
  if (canvas.owner.toString() !== owner._id.toString()) { 
    throw new Error('Not authorized to delete this canvas');
  }

  // const deletedCanvas = await this.findOneAndDelete({ canvasId});
  const deletedCanvas = await this.findOneAndDelete({ canvasId, owner: owner._id });

  if (!deletedCanvas) {
    throw new Error('Error deleting canvas');
  } 
  return deletedCanvas;
  }catch (error) {
    throw error;
  }
};  


const Canvas = mongoose.model('Canvas', canvasSchema);
module.exports = Canvas;
