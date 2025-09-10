import { useState } from "react";
import { HiMiniXMark, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProductsByFilters, setFilters } from "../../redux/slices/productsSlice";
const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch=useDispatch()
  const navigate=useNavigate() 
  const handleSearcToggle = () => {
    setIsOpen(!isOpen);
  };
  const Handlesearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({search:searchTerm}))
    dispatch(fetchProductsByFilters({search:searchTerm}))
    navigate(`/collections/all?search=${searchTerm}`)
    
  };
  return (
    <div
      className={`flex items-center justify-center w-ful transition-all duration-300 ${
        isOpen ? "absolute top-0 left-0 w-full bg-white h-24 z-50" : "w-auto"
      }`}
    >
      {isOpen ? (
        <form
          className="relative flex items-center justify-center w-full"
          onSubmit={Handlesearch}
        >
          <div className="relative w-1/2">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              className="bg-gray-100 px-4 py-2 pl-2 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
            >
              <HiOutlineMagnifyingGlass className="h-6 w-6 hover:bg-blue-500"></HiOutlineMagnifyingGlass>
            </button>
          </div>
          <button
            type="button"
            onClick={handleSearcToggle}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
          >
            <HiMiniXMark className="h-6 w-6"></HiMiniXMark>
          </button>
        </form>
      ) : (
        <button onClick={handleSearcToggle}>
          <HiOutlineMagnifyingGlass className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Searchbar;
