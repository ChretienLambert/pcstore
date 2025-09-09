import Dellimage from "../../assets/7.jpg";
import Asusimage from "../../assets/9.jpg";
import Hpimage from "../../assets/8.jpg";
import Macbookimage from "../../assets/6.jpg";
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const NewArrivals = () => {
  const scrollref = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const newArrival = [
    { _id: "1", name: "DELL", price: "500000 FCFA", images: [Dellimage] },
    { _id: "2", name: "ASUS", price: "800000 FCFA", images: [Asusimage] },
    { _id: "3", name: "HP", price: "600000 FCFA", images: [Hpimage] },
    {
      _id: "4",
      name: "MacBook Air",
      price: "300000 FCFA",
      images: [Macbookimage],
    },
  ];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollref.current.offsetLeft);
    setScrollLeft(scrollref.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    scrollref.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Scroll function
  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Check scroll positions
  const updateScrollButtons = () => {
    const container = scrollref.current;
    if (container) {
      const leftScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(leftScroll < maxScroll);
    }
  };

  useEffect(() => {
    const container = scrollref.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollButtons);
      }
    };
  }, []);

  return (
    <section>
      <div
        ref={scrollref}
        className="container mx-auto text-center mb-10 relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <h2 className="text-3xl font-blue mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest Laptops
        </p>

        {/* Button scrolls */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded border ${
              canScrollLeft
                ? "bg-white text-black"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded border ${
              canScrollRight
                ? "bg-white text-black"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollref}
        className="container mx-auto overflow-x-scroll flex space-x-6 relative scroll-smooth"
      >
        {newArrival.map((product) => (
          <div
            key={product._id}
            className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-medium">{product.name}</h4>
                <p className="mt-1">{product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
