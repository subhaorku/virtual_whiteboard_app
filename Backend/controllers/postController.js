const Posts = require('../models/postsModel');

const createPost = async (req, res) => {
  try {
    // Logic to create a post
    // It will extract title and content from the request body + Create a new post object + respond with success message
    // But if we have to handle some validation like is the title null ? is the content safe? we can handle it in postsModel.js 
    // we dont have to handle it in controller always 
    // database level validation can be handled in the model 
    // Controller doesnt have to worry about validation or [DB me post create hoti kaise hai] , it just needs to work with req , response objects 
    // Controller does not have to take responsibility of how the record is created in database
   // Record Creation is the responsibility of the model
   // Controller only handles business logic and interacts with the model

    const {title, content} = req.body;
     // This would typically involve saving to a database
    const post = await Posts.createPost(title, content); 
    console.log('Post created:', post);  
    res.status(201).json({ message: 'Post created successfully',post }); // Respond with success message and created post
  } 
  catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}   



const getPosts = async (req, res) => {
  try {
    // Logic to get all posts
    // This would typically involve fetching from a database
    const posts = await Posts.find(); // Assuming Posts is a model that interacts with the database
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}       

// pass as object to export
// This allows us to import these functions in other files easily
module.exports = {
  createPost,           
  getPosts
};