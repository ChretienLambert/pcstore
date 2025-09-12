import { useDispatch, useSelector } from "react-redux";
import { RiDeleteBin3Line } from "react-icons/ri";
import {
  updateCartItemQuantity,
  removeFromCart,
} from "../../redux/slices/cartSlice"; // adjust path

const CartContents = ({ userId, guestId }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart); // pull from redux

  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  return (
    <div>
      {cart.products?.length > 0 ? (
        cart.products.map((product, index) => (
          <div
            key={index}
            className="flex items-start justify-between py-4 border-b"
          >
            <div className="flex items-start">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-24 object-cover mr-4 rounded"
              />
              <div>
                <h3>{product.name}</h3>
                <p className="text-sm text-gray-500">Price: {product.price}</p>
                <div className="flex items-center mt-2">
                  <button
                    className="border rounded px-2 py-1 text-xl font-bold text-blue-500 cursor-pointer"
                    onClick={() =>
                      handleAddToCart(
                        product._id || product.productId,
                        1,
                        product.quantity,
                        product.size,
                        product.color
                      )
                    }
                  >
                    +
                  </button>
                  <span className="mx-4">{product.quantity}</span>
                  <button
                    className="border rounded px-2 py-1 text-xl font-bold text-blue-500 cursor-pointer"
                    onClick={() =>
                      handleAddToCart(
                        product._id || product.productId,
                        -1,
                        product.quantity,
                        product.size,
                        product.color
                      )
                    }
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium">
                FCFA {(product.price * product.quantity).toLocaleString()}
              </p>
              <button
                onClick={() =>
                  handleRemoveFromCart(
                    product._id || product.productId,
                    product.size,
                    product.color
                  )
                }
              >
                <RiDeleteBin3Line className="h-6 w-6 mt-2 text-red-500 cursor-pointer" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Your cart is empty</p>
      )}
    </div>
  );
};

export default CartContents;
