import pcCollectionimg from "../../assets/4.jpg"
import macbookCollectionimg from "../../assets/5.jpg"
import gamingCollectionimg from "../../assets/10.png"

import {Link} from "react-router-dom"

const PCCollection = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto flex flex-col md:flex-row gap-8">
            {/*PC Collection*/}
            <div className="relative flex-1">
                <img src={pcCollectionimg} alt="PC Collection" className="w-full h-[700px] object-cover"/>
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">LAPTOP's Collection</h2>
                    <Link to="/collections/all?name=LAPTOP" className="underline">Shop Now</Link>
                </div>
            </div>
            {/*MACBOOK Collection*/}
            <div className="relative flex-1">
                <img src={macbookCollectionimg} alt="MACBOOK Collection" className="w-full h-[700px] object-cover"/>
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">MACBOOK's Collection</h2>
                    <Link to="/collections/all?name=MACBOOk " className="underline">Shop Now</Link>
                </div>
            </div>
            {/*GAMING LAPTOP Collection*/}
            <div className="relative flex-1">
                <img src={gamingCollectionimg} alt="MACBOOK Collection" className="w-full h-[700px] object-cover"/>
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">GAMING LAPTOP's Collection</h2>
                    <Link to="/collections/all?name=MACBOOk " className="underline">Shop Now</Link>
                </div>
            </div>

            
        </div>
        
        
      
    </section>
  )
}

export default PCCollection

