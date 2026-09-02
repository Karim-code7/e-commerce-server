const User = require("../../models/User");

const fetchUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const findUser = await User.findById(userId).select("userName");

    if (!findUser) {
      return res.status(200).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: findUser,
    });
  } catch (err) {
    console.log(err);

    res.status(404).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = fetchUser;
