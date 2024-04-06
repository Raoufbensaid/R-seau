const UserModel = require("../models/user.model");
const sharp = require("sharp");
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfil = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier uploadé.");
  }

  try {
    // Vérification du format de l'image
    if (!["image/jpg", "image/jpeg", "image/png"].includes(req.file.mimetype)) {
      throw new Error("invalid file");
    }

    // Vérification de la taille du fichier
    if (req.file.size > 500000) {
      // Taille en octets
      throw Error("max size");
    }

    // Chemin du fichier source (temporaire)
    const tempPath = req.file.path;
    const fileName = req.body.name;
    // Chemin et nom du fichier de destination
    const targetPath = `./client/public/uploads/profil/${fileName}.jpg`;

    // Utiliser sharp pour convertir l'image au format jpg
    await sharp(tempPath).toFormat("jpeg").toFile(targetPath);

    // Mettre à jour l'utilisateur avec le chemin du nouveau fichier image
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: targetPath } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Répondre avec les informations de l'utilisateur mis à jour
    res.send(updatedUser);
  } catch (error) {
    const errors = uploadErrors(error);
    return res.status(201).json({ errors });
  }
};
