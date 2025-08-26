import { RiDeleteBin3Line } from "react-icons/ri"
const CartContents = () => {
  const cartProducts=[
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

  ]
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
                <button className="border rounded px-2 py-1 text-xl font-bold text-blue-500">+</button>
                <span className="mx-4">{product.quantity}</span>
                <button className="border rounded px-2 py-1 text-xl font-bold text-blue-500">-</button>
              </div>
            </div>
            </div>
            <div>
            <p className="font-medium">FCFA {product.price.toLocaleString()}</p>
            <button>
              <RiDeleteBin3Line className="h-6 w-6 mt-2 text-red-500" />
            </button>
          </div>
          </div>
      ))}
    </div>
  )
}

export default CartContents
