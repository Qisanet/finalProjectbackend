const express = require("express");
const { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, upload ,isRecipeOwner,addFavorite,getFavorites, removeFavorite } = require("../controller/recipe");
const verifyToken = require("../middleware/auth");
const router = express.Router();

router.get("/", getRecipes); // Get all recipes
router.get("/:id", getRecipe); // Get recipe by ID
router.post("/", upload.single("file"), verifyToken, addRecipe); // Add recipe
router.put("/:id", upload.single("file"), verifyToken, editRecipe); // Edit recipe
router.delete("/:id", verifyToken, deleteRecipe); // Delete recipe
router.get("/:id/isOwner", verifyToken, isRecipeOwner);
router.post("/addFavorite", verifyToken, addFavorite);
router.get("/my/getFavorites", verifyToken, getFavorites);
router.delete("/:id/removeFavorite", verifyToken, removeFavorite);




module.exports = router;
