import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiDeleteBin3Line } from "react-icons/ri";
import { updateCartItemQuantity, removeFromCart } from "../../redux/slices/cartSlice";

const CartContents = ({ userId, guestId, cartItems: propCartItems }) => {
  const dispatch = useDispatch();
  const inferred = useSelector((s) => s.cart?.cartItems || JSON.parse(localStorage.getItem("cart") || "[]"));
  const cartItems = Array.isArray(propCartItems) ? propCartItems : inferred;
  
  // Get current user info from Redux store if available
  const currentUser = useSelector((state) => state.auth?.user || null);
  const effectiveUserId = userId || currentUser?._id || null;

  const handleChangeQty = (product, newQty) => {
    dispatch(updateCartItemQuantity({ 
      productId: product.productId || product._id || product.product, 
      quantity: newQty, 
      size: product.size || "", 
      color: product.color || "", 
      guestId, 
      userId: effectiveUserId 
    }));
  };

  const handleRemove = (product) => {
    dispatch(removeFromCart(product.productId || product._id || product.product));
  };

  return (
    <div>
      {cartItems && cartItems.length ? (
        cartItems.map((product, idx) => (
          <div key={product.productId || product._id || idx} className="py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {product.image && <img src={product.image} alt={product.name} className="w-20 h-24 object-cover rounded" />}
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">Unit: FCFA {Number(product.price || 0).toLocaleString()}</div>
                  {product.size && <div className="text-sm text-gray-500">Size: {product.size}</div>}
                  {product.color && <div className="text-sm text-gray-500">Color: {product.color}</div>}
                  {product.isCustomBuild && (
                    <div className="mt-2 text-sm">
                      <div className="font-semibold">Build components:</div>
                      <ul className="text-sm list-disc list-inside">
                        {(product.components || []).map((c, i) => (
                          <li key={i}>
                            <span className="font-medium">{c.slot}</span>: {c.name || (c.product && String(c.product).slice(0,8))} — FCFA {Number(c.price || 0).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                      {product.notes && <div className="text-xs mt-1 text-gray-600">Notes: {product.notes}</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium mb-2">FCFA {(Number(product.price || 0) * Number(product.quantity || 1)).toLocaleString()}</div>
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleChangeQty(product, Math.max(0, (product.quantity || 1) - 1))} 
                    className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <div className="min-w-[20px] text-center">{product.quantity}</div>
                  <button 
                    onClick={() => handleChangeQty(product, (product.quantity || 1) + 1)} 
                    className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => handleRemove(product)} 
                    className="ml-3 hover:bg-gray-100 p-1 rounded transition-colors"
                  >
                    <RiDeleteBin3Line className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-600">Your cart is empty</div>
      )}
    </div>
  );
};

export default CartContents;