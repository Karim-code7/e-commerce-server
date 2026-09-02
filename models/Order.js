const mongoose = require("mongoose"); // تصحيح إملائي لـ mongoose

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number, // 🌟 تم تحويله لـ Number بدلاً من String لعمل الحسابات بدقة
      coastPrice: Number, // 🌟 الخانة الجديدة: سعر التكلفة من المورد وقت البيعة
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethods: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now }, // جعل التاريخ يسجل تلقائياً
  orderUpdateDate: Date, // تصحيح إملائي من Ubdate لـ Update
  paymentId: String,
  payerId: String,
});

module.exports = mongoose.model("Order", OrderSchema); // يفضل دائماً اسم الموديل يبدأ بحرف كبير
