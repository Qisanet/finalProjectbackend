

const Recipes = require("../models/recipe");
const multer = require("multer");
const User = require("../models/user");
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
  const { title, ingredients, instructions, time, file } = req.body;

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
  const { title, ingredients, instructions, time, file } = req.body;
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
    { title, ingredients, instructions, time, coverImage: file },
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




// const removeFavorite = async (req, res) => {
//   const { id } = req.params; // Recipe ID to remove from favorites
//   const userId = req.user.id; // User ID from the verified token

//   try {
//     // Remove the favorite record from the database
//     await Favorite.deleteOne({ user: userId, recipe: id });

//     res.status(200).json({ message: "Recipe removed from favorites" });
//   } catch (error) {
//     console.error("Error removing favorite:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const removeFavorite = async (req, res) => {
  const { id } = req.params; // Recipe ID to remove from favorites
  const userId = req.user.id; // User ID from the verified token

  try {
    // Permanently delete the favorite record from the database
    await Favorite.deleteOne({ user: userId, recipe: id });

    res.status(200).json({ message: "Recipe removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// backend/controller/recipe.js
const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body; // Expecting recipeId in the request body
    const userId = req.user.id; // User ID from the authenticated token

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Check if the recipe is already in favorites
    const existingFavorite = await Favorite.findOne({ user: userId, recipe: recipeId });
    if (existingFavorite) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    // Add the recipe to favorites
    const newFavorite = new Favorite({ user: userId, recipe: recipeId });
    await newFavorite.save();

    res.json({ message: "Recipe added to favorites", favorite: newFavorite });
  } catch (error) {
    console.error("Error adding recipe to favorites:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
  isRecipeOwner,
  addFavorite,
  getFavorites,
  removeFavorite,
};