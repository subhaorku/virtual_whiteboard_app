const mongoose = require('mongoose');

// Define the schema for the posts -> Document's Structure
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
    },
    content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 5000
    },
    numberofLikes: {
    type: Number,   
    default: 0
    },  
},
{
    timestamps: true,
    collection:'posts' // Specify the collection name
});


postSchema.statics.createPost = async function (title, content) {
  try {
    const post = new this({
       title, content 
      });
    return await post.save();
  } catch (err) {
    throw new Error('Error creating post: ' + err.message);
  } 
};


postSchema.statics.getAllPosts = async function() {
  try {
    return await this.find().sort({ createdAt: -1 }); // Newest first
  } catch (err) {
    throw new Error('Error fetching posts: ' + err.message);
  }
};


const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
module.exports.postSchema = postSchema; // Export the schema if needed elsewhere