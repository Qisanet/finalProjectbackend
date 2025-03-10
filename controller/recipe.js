const Recipes = require("../models/recipe");
const multer = require("multer");
const User=require("../models/user");
const Recipe = require("../models/recipe");
const Favorite = require("../models/favorite");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.fieldname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const getRecipes = async (req, res) => {
  const recipes = await Recipes.find();
  return res.json(recipes);
};

const getRecipe = async (req, res) => {
  const recipe = await Recipes.findById(req.params.id);
  res.json(recipe);
};

const addRecipe = async (req, res) => {
  const { title, ingredients, instructions, time,file } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: "Required fields can't be empty" });
  }

  const newRecipe = await Recipes.create({
    title,
    ingredients,
    instructions,
    time,
    coverImage: file,
    createdBy: req.user.id,
  });
  return res.json(newRecipe);
};

const editRecipe = async (req, res) => {
  const { title, ingredients, instructions, time,file } = req.body;
  const recipe = await Recipes.findById(req.params.id);

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  // Check if the user is the creator of the recipe
  if (recipe.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "You are not authorized to edit this recipe" });
  }


  const updatedRecipe = await Recipes.findByIdAndUpdate(
    req.params.id,
    { title, ingredients, instructions, time, coverImage:file },
    { new: true }
  );
  res.json(updatedRecipe);
};

const deleteRecipe = async (req, res) => {
  const recipe = await Recipes.findById(req.params.id);

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  // Check if the user is the creator of the recipe
  if (recipe.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "You are not authorized to delete this recipe" });
  }

  await Recipes.deleteOne({ _id: req.params.id });
  res.json({ status: "ok" });
};

const isRecipeOwner = async (req, res) => {
  const recipe = await Recipes.findById(req.params.id);

  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  const isOwner = recipe.createdBy.toString() === req.user.id;
  res.json({ isOwner });
};



const getFavorites = async (req, res) => {
  try {
    // Validate the ObjectId to avoid errors
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Query the Favorite model and populate the 'recipe' field to get recipe details
    const favorites = await Favorite.find({ user: req.user.id }).populate("recipe");

    // Check if there are no favorites
    if (!favorites.length) {
      return res.status(404).json({ message: "No favorites found" });
    }

    res.json(favorites); // Return the populated favorites list with recipe details
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//an endpoint to get add a recipie to favorites
const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body; // recipeId will be sent in the request body


    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: "Invalid Recipe ID" });
    }

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Find the user from the database based on the authenticated user
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if the recipe is already in the favorites for the user
    const existingFavorite = await Favorite.findOne({ user: user._id, recipe: recipeId });
    if (existingFavorite) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    // Create a new favorite record
    const newFavorite = new Favorite({
      user: user._id,
      recipe: recipeId,
    });

    await newFavorite.save();

    res.json({ message: "Recipe added to favorites", favorite: newFavorite });
  } catch (error) {
    console.error("Error adding recipe to favorites:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, upload,isRecipeOwner,addFavorite ,getFavorites};


