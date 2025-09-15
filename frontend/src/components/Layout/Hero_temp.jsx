import Heroimg from "../../assets/2.jpg";
import { Link } from "react-router-dom";

const Hero_temp = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen background image */}
      <img
        src={Heroimg}
        alt="PCSTORE"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>

      {/* Centered content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-6 max-w-3xl">
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6">
            Laptops & Macbooks <br />
            <span className="text-indigo-400">Built for Performance</span>
          </h1>

          <p className="text-base md:text-lg text-gray-200 mb-8">
            Explore our latest tech with{" "}
            <span className="font-medium">fast worldwide shipping</span> and unbeatable support.
          </p>

          <Link
            to="/collections/all"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition-transform transform hover:-translate-y-1"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero_temp;
