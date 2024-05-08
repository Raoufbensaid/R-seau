const sharp = require("sharp");
const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createPost = async (req, res) => {
  let fileName = ""; // Initialiser fileName avec une chaîne vide par défaut

  // Vérifier si un fichier est envoyé avec le post
  if (req.file) {
    try {
      // Vérification du format de l'image
      if (
        !["image/jpg", "image/jpeg", "image/png"].includes(req.file.mimetype)
      ) {
        throw new Error("invalid file");
      }

      // Vérification de la taille du fichier
      if (req.file.size > 500000) {
        // Taille en octets
        throw new Error("max size");
      }

      fileName = req.body.posterId + Date.now() + ".jpg";
      // Chemin et nom du fichier de destination
      const targetPath = `./client/public/uploads/posts/${fileName}`;
      const tempPath = req.file.path;

      // Utiliser sharp pour convertir l'image au format jpg
      await sharp(tempPath).toFormat("jpeg").toFile(targetPath);
    } catch (error) {
      const errors = uploadErrors(error);
      return res.status(400).json({ errors });
    }
  }

  // Créer un nouvel objet post avec ou sans fichier selon le cas
  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: fileName ? "./client/public/uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (error) {
    return res.status(400).send(error);
  }
};

module.exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const message = req.body.message;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + postId);

  const updateRecord = {
    message: message,
  };

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $set: updateRecord },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.send(updatedPost);
  } catch (error) {
    console.log("Update error : " + error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.deletePost = async (req, res) => {
  const deleteId = req.params.id;

  if (!ObjectID.isValid(deleteId))
    return res.status(400).send("ID unknown : " + deleteId);

  try {
    await PostModel.deleteOne({ _id: deleteId }).exec();
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.likePost = async (req, res) => {
  const postId = req.params.id;
  const likePost = req.body.id;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + deleteId);

  try {
    // Mettez à jour le post pour ajouter l'utilisateur aux likers
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likers: likePost },
      },
      { new: true }
    );

    // Mettez à jour l'utilisateur pour ajouter le post à ses likes
    const updatedUser = await UserModel.findByIdAndUpdate(
      likePost,
      {
        $addToSet: { likes: postId },
      },
      { new: true }
    );

    // Envoyez la réponse
    res.status(200).json({ post: updatedPost, user: updatedUser });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(400).send(error);
  }
};

module.exports.unlikePost = async (req, res) => {
  const postId = req.params.id;
  const likePost = req.body.id;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + deleteId);

  try {
    // Mettez à jour le post pour ajouter l'utilisateur aux likers
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: { likers: likePost },
      },
      { new: true }
    );

    // Mettez à jour l'utilisateur pour ajouter le post à ses likes
    const updatedUser = await UserModel.findByIdAndUpdate(
      likePost,
      {
        $pull: { likes: postId },
      },
      { new: true }
    );

    // Envoyez la réponse
    res.status(200).json({ post: updatedPost, user: updatedUser });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(400).send(error);
  }
};

module.exports.commentPost = async (req, res) => {
  const postId = req.params.id;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + postId);

  try {
    const newComment = {
      commenterId: req.body.commenterId,
      commenterPseudo: req.body.commenterPseudo,
      text: req.body.text,
      timestamp: new Date().getTime(),
    };

    // Mettez à jour le post pour ajouter le nouveau commentaire
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: newComment,
        },
      },
      { new: true }
    );

    // Envoyez la réponse avec le post mis à jour
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(400).send(error);
  }
};

module.exports.editCommentPost = async (req, res) => {
  const postId = req.params.id;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + postId);

  try {
    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    const theComment = post.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    );

    if (!theComment) return res.status(404).send("Comment not found");

    theComment.text = req.body.text;

    await post.save();

    return res.status(200).send(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

// Dans votre fichier de contrôleur post.controller.js

module.exports.deleteCommentPost = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.body.commentId;

  if (!ObjectID.isValid(postId))
    return res.status(400).send("ID unknown : " + postId);

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: commentId } },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(400).send(error);
  }
};
