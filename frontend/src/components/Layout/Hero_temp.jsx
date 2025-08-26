import Heroimg from "../../assets/2.jpg"
import { Link } from "react-router-dom" 
const Hero_temp = () => {
  return (
    <section className="relative">
      <img src={Heroimg} alt="PCSTORE" className="w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover"></img>
      <div className="absolute inset-0  flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h1 className="text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
            LAPTOP & MACBOOK <br /> TECH
          </h1>
          <p className="text-sm tracking-tighter md:text-lg mb-6">
            Explore our vacation-ready outfits with fast worldwide shipping 
          </p>
          <Link to="#" className="bg-[#5C5CFF] text-white px-6 py-2 rounded-sm text-lg">Shop Now</Link>
        </div>
      </div>
    </section>
  )
}

export default Hero_temp