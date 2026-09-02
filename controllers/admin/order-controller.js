const Order = require("../../models/Order");

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
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

const getOrderDeatilsForAdmin = async (req, res) => {
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
const updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    order.orderStatus = status;

    await order.save();
    res.status(200).json({
      success: true,
      message: "Order status ubdate successfully!",
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

const getAdminAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // استقبال تواريخ الفلترة لو الـ Admin حدد شهر معين

    // 1️⃣ بناء شرط الفلترة الأساسي (الطلبات الناجحة فقط)
    let matchQuery = {
      orderStatus: {
        $in: ["Delivered"],
      },
    };

    // لو الـ Admin بعت تواريخ، نحدد الفترة الزمنية في الفلترة
    if (startDate && endDate) {
      matchQuery.orderDate = {
        $gte: new Date(startDate), // من تاريخ
        $lte: new Date(endDate), // إلى تاريخ
      };
    }

    // 2️⃣ بدء خط الإنتاج (Aggregation Pipeline) داخل المونجو

    // إذا كانت الداتابيز فارغة أو مفيش طلبات delivered، نرجع أصفار بدل null
    const result = await Order.aggregate([
      // 1️⃣ فلترة الطلبات المكتملة وفي الفترة المحددة
      { $match: matchQuery },

      // 2️⃣ تفكيك مصفوفة المنتجات (Array) عشان المونجو يمسك كل منتج لوحده 🌟
      { $unwind: "$cartItems" },

      // 3️⃣ حساب الإجماليات بدقة بضرب السعر في الكمية لكل منتج مفكك
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] }, // 50
          },
          totalCost: {
            $sum: {
              $multiply: [
                { $ifNull: ["$cartItems.coastPrice", 0] },
                "$cartItems.quantity",
              ], // 25
            },
          },
        },
      },

      // 4️⃣ طرح التكلفة من المبيعات لإخراج صافي الربح الحقيقي
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalCost: 1,
          netProfit: { $subtract: ["$totalRevenue", "$totalCost"] },
        },
      },
    ]);

    // للتأكد من إرسال كائن واحد وليس مصفوفة للـ Frontend
    const analyticsData = result[0] || {
      totalRevenue: 0,
      totalCost: 0,
      netProfit: 0,
    };
    res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
};
const getOrderStatusStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus", // التجميع حسب الحالة
          totalSales: { $sum: "$totalAmount" }, // جمع إجمالي الأوردر مباشرة
          orderCount: { $sum: 1 }, // عد الأوردرات في كل حالة
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          totalSales: 1,
          orderCount: 1,
        },
      },
    ]);

    const ALL_STATUSES = [
      "pending",
      "inProcess",
      "confirmed",
      "delivered",
      "rejected",
    ];

    // 3️⃣ دمج البيانات القادمة من قاعدة البيانات مع الحالات الافتراضية الصفرية
    const finalStats = ALL_STATUSES.map((statusName) => {
      // البحث عن الحالة داخل المصفوفة القادمة من المونجو
      const foundStatus = stats.find(
        (item) => item.status?.toLowerCase() === statusName.toLowerCase(),
      );
      console.log(stats);

      return (
        foundStatus || {
          status: statusName,
          totalSales: 0,
          orderCount: 0,
        }
      );
    });

    // 4️⃣ إرسال المصفوفة الكاملة والمنظمة إلى الـ Frontend
    res.status(200).json({ success: true, data: finalStats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};
module.exports = {
  getAllOrders,
  getOrderDeatilsForAdmin,
  updateOrderStatus,
  getAdminAnalytics,
  getOrderStatusStats,
};
