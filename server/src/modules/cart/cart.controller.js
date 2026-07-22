const cartService = require("./cart.service");

const addItem = async (req, res) => {
  try {
    const item = await cartService.addItem(req.user.id, req.validatedData);

    return res.status(201).json({
      success: true,
      message: "Item added to cart.",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const result = await cartService.updateItem(
      req.user.id,
      req.params.mealId,
      req.validatedData.quantity
    );

    if (result === null) {
      return res.status(200).json({
        success: true,
        message: "Item removed from cart.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item updated.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const removeItem = async (req, res) => {
  try {
    await cartService.removeItem(req.user.id, req.params.mealId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addItem,
  getCart,
  updateItem,
  removeItem,
  clearCart,
};
