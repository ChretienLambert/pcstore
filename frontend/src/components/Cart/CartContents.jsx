import { useState } from "react";
import { RiDeleteBin3Line } from "react-icons/ri"
const CartContents = () => {
 const [cartProducts, setCartProducts] = useState([
    {
      productId: 1,
      name: "PC",
      quantity:1,
      price:200000,
      image: "https//picsum.photos/200?random=1",
    },
    {
      productId: 2,
      name: "LAPTOP",
      quantity:1,
      price:200000,
      image: "https//picsum.photos/200?random=2",
    },
    {
      productId: 3,
      name: "MACBOOK",
      quantity:1,
      price:200000,
      image: "https//picsum.photos/200?random=3",
    },

  ])
  // Increase quantity
  const increaseQuantity = (id) => {
    setCartProducts((prev) =>
      prev.map((product) =>
        product.productId === id
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartProducts((prev) =>
      prev.map((product) =>
        product.productId === id && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setCartProducts((prev) =>
      prev.filter((product) => product.productId !== id)
    );
  };

  return (
    <div>
       {cartProducts.map((product, index) => (
        <div key={index} className='flex items-start justify-between py-4 border-b'>
          <div className="flex items-start">
            <img src={product.image} alt={product.name} className='w-20 h-24 object-cover mr-4 rounded'/>
            <div>
              <h3>{product.name}</h3>
              <p className='text-sm text-gray-500'>
                Price:{product.price}
              </p>
              <div className="flex items-center mt-2">
                <button className="border rounded px-2 py-1 text-xl font-bold text-blue-500 cursor-pointer" onClick={() => increaseQuantity(product.productId)}>+</button>
                <span className="mx-4">{product.quantity}</span>
                <button className="border rounded px-2 py-1 text-xl font-bold text-blue-500 cursor-pointer" onClick={() => decreaseQuantity(product.productId)}>-</button>
              </div>
            </div>
            </div>
            <div>
            <p className="font-medium">FCFA {(product.price * product.quantity).toLocaleString()}</p>
            <button  onClick={() => deleteProduct(product.productId)}>
              <RiDeleteBin3Line  className="h-6 w-6 mt-2 text-red-500 cursor-pointer" />
            </button>
          </div>
          </div>
      ))}
    </div>
  )
}

export default CartContents
