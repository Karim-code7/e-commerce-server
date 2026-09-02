const paypal = require("../../helpres/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems, // سنأخذ منها الـ productId والـ quantity فقط
      addressInfo,
      orderStatus,
      paymentStatus,
      paymentMethods,
      orderDate,
      orderUpdateDate, // تصحيح الاسم الإملائي
      paymentId,
      payerId,
    } = req.body;

    const verifiedCartItems = [];
    let calculatedTotalAmount = 0;

    // 1️⃣ خطوة الأمان: فحص الأسعار وجلب تكلفة المورد من الداتابيز 🛡️
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.title} not found in database!`,
        });
      }

      // حساب سعر البيع الفعلي (لو عليه عرض نأخذ الـ salePrice وإلا السعر الأصلي)
      const currentSellingPrice =
        product.salePrice && product.salePrice > 0
          ? product.salePrice
          : product.price;

      // بناء مصفوفة المنتجات المؤمنة وحقن الـ costPrice للأرباح 🌟
      verifiedCartItems.push({
        productId: item.productId,
        title: product.title,
        image: product.image[0] || item.image,
        price: currentSellingPrice, // السعر الحقيقي من الداتابيز
        coastPrice: product.coastPrice || 0, // سعر التكلفة من الداتابيز لحساب المكسب لاحقاً
        quantity: item.quantity,
      });

      // حساب الإجمالي الحقيقي تراكمياً في السيرفر
      calculatedTotalAmount += currentSellingPrice * item.quantity;
    }

    // 2️⃣ بناء الـ JSON الخاص بـ PayPal بالأسعار المؤمنة والمحسوبة في السيرفر
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cansel",
      },
      transactions: [
        {
          item_list: {
            items: verifiedCartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2), // باي بال يتطلب الأسعار بصيغة نصوص عشرية
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: calculatedTotalAmount.toFixed(2), // الإجمالي الحقيقي الآمن
          },
          description: "OrderPayment",
        },
      ],
    };

    // 3️⃣ إرسال البيانات لباي بال وحفظ الطلب عند النجاح
    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        console.log(
          "=== PAYPAL ERROR DETAILS ===",
          JSON.stringify(error.response, null, 2),
        );
        return res.status(500).json({
          success: false,
          message: "Failed to create payment!",
        });
      } else {
        // حفظ الـ Order بالنسخة المؤمنة والمضاف إليها أسعار التكلفة
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems: verifiedCartItems, // 🌟 المصفوفة المؤمنة وبها الـ costPrice
          addressInfo,
          orderStatus,
          paymentStatus,
          paymentMethods,
          totalAmount: calculatedTotalAmount, // 🌟 الإجمالي الحقيقي
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvaleURL = payment.links.find(
          (link) => link.rel === "approval_url",
        ).href;

        res.status(200).json({
          success: true,
          message: "Payment created successfully!",
          orderId: newlyCreatedOrder._id,
          approvaleURL,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerID, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerID;

    await Promise.all(
      order.cartItems.map(async (item) => {
        let product = await Product.findById(item.productId);
        if (product) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }),
    );
    await order.save();
    const gerCartId = order.cartId;
    await Cart.findByIdAndDelete(gerCartId);

    res.status(200).json({
      success: true,
      message: "Payment captured successfully!",
      data: order,
    });
  } catch (err) {
    // console.log(err);

    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};
const getAllOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "Please login first!",
      });
    }
    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully!",
      data: orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDeatils = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order fetched successfully!",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrderByUser,
  getOrderDeatils,
};
