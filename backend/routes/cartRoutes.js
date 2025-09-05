const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const PcBuild = require("../models/PcBuild");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//Helper function to get a cart by user ID or guest ID
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

//@route POST /api/cart
//@desc Add a product to the cart for a guest or logged-in user\
//@access Public
router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    //Determing if the user is logged-in or a guest
    let cart = await getCart(userId, guestId);
    //If the cart exists, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        //If the product already exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: Array.isArray(product.images)
            ? product.images[0]?.url || ""
            : product.images || "",
          price: product.price,
          size,
          color,
          quantity,
        });
      }

      //Recalculate the total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      //Create a new cart
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route PUT /api/cart
//@desc Update product in the cart for a guest or logged-in user
//@access Public
router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      //Update quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); //Remove the product if quantity is 0
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route DELETE /api/cart
//@desc Remove a product form the cart
//@access Public
router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//@route GET  /api/cart
//@desc Get logged-in user's or guest user's cart
//@access Public
router.get("/", async (req, res) => {
  const { userId, guestId } = req.query;
  try {
    const cart = await getCart(userId, guestId);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//@route POST /api/cart/merge
//@desc Merge guest cart into user cart on login
//@access Private
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;
  try {
    //Find the guest cart and user cart
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (guestCart) {
      if (guestCart.products.length === 0) {
        res.status(404).json({ message: "Guest cart not found" });
      }

      if (userCart) {
        //Merge guest cart into user cart
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );
          if (productIndex > -1) {
            //If the items exists in the user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            //Otherwise, add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });
        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        await userCart.save();
        //Remove the guest cart after merging
        try {
          await Cart.findOneAndDelete({ guestId });
        } catch (error) {
          console.error("Error deleting guest cart", error);
        }
        res.status(200).json(userCart);
      } else {
        //If the user has no existing cart, assign the guest cart to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();

        res.status(200).json(guestCart);
      }
    } else {
      if (userCart) {
        //Guest cart has already been merged
        return res.status(200).json(userCart);
      }
      res.status(404).json({ message: "Guest cart not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/cart/pc-build
// @desc Add a PC build to the cart
// @access Private
router.post("/pc-build", protect, async (req, res) => {
  const { pcBuildId, quantity = 1 } = req.body;

  try {
    const pcBuild = await PcBuild.findById(pcBuildId).populate(
      "components.productId"
    );

    if (!pcBuild) {
      return res.status(404).json({ message: "PC Build not found" });
    }

    // Check if user owns the build or it's public
    if (
      pcBuild.user.toString() !== req.user._id.toString() &&
      !pcBuild.isPublic
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to add this build to cart" });
    }

    // Calculate total price of the build
    const buildTotalPrice = pcBuild.components.reduce((total, component) => {
      return total + (component.productId?.price || 0) * component.quantity;
    }, 0);

    let cart = await Cart.findOne({ user: req.user._id });

    // Get a representative image from the build components
    let buildImage = "";
    if (
      pcBuild.components.length > 0 &&
      pcBuild.components[0].productId?.images?.length > 0
    ) {
      buildImage = pcBuild.components[0].productId.images[0].url;
    }

    if (cart) {
      // Check if this PC build is already in the cart
      const existingBuildIndex = cart.products.findIndex(
        (item) => item.pcBuildId && item.pcBuildId.toString() === pcBuildId
      );

      if (existingBuildIndex > -1) {
        // Update quantity if already exists
        cart.products[existingBuildIndex].quantity += quantity;
      } else {
        // Add new PC build to cart - don't include productId for PC builds
        cart.products.push({
          pcBuildId: pcBuild._id,
          name: pcBuild.name,
          image: buildImage,
          price: buildTotalPrice,
          quantity: quantity,
          isPcBuild: true,
          // Note: productId is intentionally omitted for PC builds
        });
      }
    } else {
      // Create new cart with PC build - don't include productId for PC builds
      cart = new Cart({
        user: req.user._id,
        products: [
          {
            pcBuildId: pcBuild._id,
            name: pcBuild.name,
            image: buildImage,
            price: buildTotalPrice,
            quantity: quantity,
            isPcBuild: true,
            // Note: productId is intentionally omitted for PC builds
          },
        ],
        totalPrice: buildTotalPrice * quantity,
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );

    await cart.save();
    await cart.populate({
      path: "products.pcBuildId",
      select: "name components", // explicitly select only needed fields
      options: {
        virtuals: false, // disable virtuals during population
      },
    });

    res.json(cart);
  } catch (error) {
    console.error("Error adding PC build to cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
