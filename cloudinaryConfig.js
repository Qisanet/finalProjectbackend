const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dw4mybyma",
  api_key: "CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dw4mybyma",
  api_secret: "K9jhXXaCPESkZglqJsnhd41Qkkg",
});

module.exports = cloudinary;
