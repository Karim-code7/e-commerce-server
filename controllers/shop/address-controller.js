const Address = require("../../models/Address");

const addAddress = async (req, res) => {
  try {
    const { userId, address, city, pincode, phone, notes } = req.body;

    if (!userId || !address || !city || !pincode || !phone || !notes) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid data provided" });
    }

    const newAddress = new Address({
      userId,
      address,
      city,
      pincode,
      phone,
      notes,
    });

    await newAddress.save();

    res
      .status(201)
      .json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const addresses = await Address.find({ userId });

    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};
const editAddress = async (req, res) => {
  try {
    const { addressId, userId } = req.params;

    const formData = req.body;

    if (!userId || !addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Address ID is required" });
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
      },
      formData,
      { returnDocument: "after" },
    );

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId, userId } = req.params;

    console.log("Deleting address with ID:", addressId, "for user ID:", userId);
    if (!userId || !addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Address ID is required" });
    }

    const address = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addAddress,
  fetchAllAddress,
  deleteAddress,
  editAddress,
};
