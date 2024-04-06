const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

module.exports.userInfo = async (req, res) => {
  const userId = req.params.id;

  if (!ObjectID.isValid(userId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const bio = req.body.bio;

  if (!ObjectID.isValid(userId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { bio: bio } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!ObjectID.isValid(userId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    await UserModel.deleteOne({ _id: userId }).exec();
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.follow = async (req, res) => {
  const userId = req.params.id;
  const followId = req.body.idToFollow;

  if (!ObjectID.isValid(userId) || !ObjectID.isValid(followId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    // add to the follower list
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { following: followId } },
      { new: true, upsert: true }
    );

    // add to following list
    await UserModel.findByIdAndUpdate(
      followId,
      { $addToSet: { followers: userId } },
      { new: true, upsert: true }
    );

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.unfollow = async (req, res) => {
  const userId = req.params.id;
  const unfollowId = req.body.idToUnFollow;

  if (!ObjectID.isValid(userId) || !ObjectID.isValid(unfollowId))
    return res.status(400).send("ID unknown : " + userId);

  try {
    // add to the follower list
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { following: unfollowId } },
      { new: true, upsert: true }
    );

    // add to following list
    await UserModel.findByIdAndUpdate(
      unfollowId,
      { $pull: { followers: userId } },
      { new: true, upsert: true }
    );

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
