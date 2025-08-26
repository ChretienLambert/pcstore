import {HiOutlineCreditCard,HiArrowPathRoundedSquare,HiShoppingBag } from "react-icons/hi2"
const ProductDetails = () => {
  return (
    <section>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/*Feature No.1*/}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiShoppingBag className="text-xl" />
                </div>
                <h4 className="tracking-tighter mb-2">FREE SHIPPING</h4> 
                <p className="text-gray-600 text-sm tracking-tighter">Free shipping across Douala</p>
            </div>
        
    
            {/*Feature No.2*/}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiArrowPathRoundedSquare className="text-xl" />
                </div>
                <h4 className="tracking-tighter mb-2">30 DAYS RETURN</h4> 
                <p className="text-gray-600 text-sm tracking-tighter">Money back guaranteed</p>
            </div>

            {/*Feature No.3*/}
            <div className="flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                    <HiOutlineCreditCard className="text-xl" />
                </div>
                <h4 className="tracking-tighter mb-2">SECURE CHECKOUT</h4>
                <p className="text-gray-600 text-sm tracking-tighter">100% secured checkout process</p>
            </div>
        </div>
    </section>
  )
}

export default ProductDetails
