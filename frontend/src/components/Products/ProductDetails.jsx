import { useEffect, useState } from "react"
import {HiOutlineCreditCard,HiArrowPathRoundedSquare,HiShoppingBag } from "react-icons/hi2"
const selectedProduct={
    name: "DELL BUSINESS PC",
    price: 400000,
    originalPrice: 450000,
    description: "Business Pc",
    brand:"DELL",
    material:"Plastic",
    sizes:["Compact", "Standard", "Large"],
    colors:["Red", "Blue", "Black", "Green", "Yellow"],
    images:[{
        url:"https://picsum.photos/500/500?random=1",
        altText:"DELL 1"
    },
    {
        url:"https://picsum.photos/500/500?random=2",
        altText:"DELL 2"
    },
    {
        url:"https://picsum.photos/500/500?random=3",
        altText:"DELL 3"
    }
]

}
const ProductDetails = () => {
    const [mainImage, setMainImage]=useState("")
    useEffect(()=>{
        if(selectedProduct?.images?.length>0){
            setMainImage(selectedProduct.images[0].url)
        }
    },[selectedProduct])
  return (
    <section>
        <div className="p-6">
            <p className="text-center font-bold text-black text-2xl">BEST SELLER</p>
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
                <div className="flex flex-col md:flex-row">
                    <div className="hidden md:flex flex-col space-y-4 mr-6">
                        {selectedProduct.images.map((image,index)=>(
                            <img key={index} src={image.url} alt={image.altText || `Thumbnail ${index}`}
                            className="w-20 h-20 object-cover rounded=lg cursor-pointer border" onClick={()=>setMainImage(image.url)}/>
                        ))}
                    </div>
                    <div className="md:w-1/2">
                        <div className="mb-4">
                            <img src={mainImage} alt="Main Product" className="w-full h-auto object-cover rounded-lg" />
                        </div>
                    </div>
                    <div className="md:w-1/2 md:ml-10">
                        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                            {selectedProduct.name}
                        </h1>
                        <p className="text-lg text-gray-600 mb-1 line-through">
                            {selectedProduct.originalPrice&&`${selectedProduct.originalPrice}`}
                        </p>
                        <p className="text-xl text-gray-500 mb-2">
                            {selectedProduct.price} FCFA
                        </p>
                        <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                        <div className="mb-4">
                            <p className="text-gray-700">Color:</p>
                            <div className="flex gap-2 mt-2">
                                {selectedProduct.colors.map((color)=>(
                                    <button key={color}
                                    className="w-8 h-8 rounded-full border"
                                    style={{backgroundColor:color.toLocaleLowerCase(),
                                        filter:"brightness(0.5)"
                                    }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-700">Size:</p>
                            <div className="flex gap-2 mt-2">
                                {selectedProduct.sizes.map((size)=>{
                                    <button key={size} className="px-4 py-2 rounded border">
                                        {size}
                                    </button>
                                })}
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">Quantiy:</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <button className="px-2 py-1 bg-gray-200 rounded text-lg">
                                    -
                                </button>
                                <span className="text-lg">1</span>
                                <button className="px-2 py-1 bg-gray-200 rounded text-lg">
                                    +
                                </button>
                            </div>
                        </div>
                        <button className="bg-[#5C5CFF] text-white py-2 px-6 rounded w-full mb-4 cursor-pointer">ADD TO CART</button>
                        <div className="mt-10 text-gray-700">
                            <h3 className="text-xl font-bold mb-4">Characteristics</h3>
                            <table className="w-full text-left text-sm text-gray-600">
                                <tbody>
                                    <tr>
                                        <td className="py-1">Brand</td>
                                        <td className="py-1">{selectedProduct.brand}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Material</td>
                                        <td className="py-1">{selectedProduct.material}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
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
