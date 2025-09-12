import { Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import Searchbar from "./Searchbar";
import CartDrawer from "../Layout/CartDrawer";
import { useState } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navdraweropen, setnavdraweropen] = useState(false);
  const {cart}=useSelector((state)=>state.cart)
  const {user}=useSelector((state)=>state.auth)

  const cartItemCount=cart?.products?.reduce((total,product)=>total+product.quantity,0)||0

  const togglenavdrawer = () => {
    setnavdraweropen(!navdraweropen);
  };
  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  return (
    <nav className="container mx-auto flex justify-between items-center py-4 px-6">
      <div>
        <Link to="/" className="text-1xl">
          PCSTORE
        </Link>
      </div>
      <div className="hidden md:flex text-sm space-x-10">
        <Link
          to="/collections/all?category=Laptops"
          className="text-black hover:text-blue-500 text-sm font-medium"
        >
          LAPTOPS
        </Link>
        <Link
          to="/collections/all?category=Mini PC"
          className="text-black hover:text-blue-500 text-sm font-medium"
        >
          MINI PC
        </Link>
        <Link
          to="/collections/all?category=Workstations"
          className="text-black hover:text-blue-500 text-sm font-medium"
        >
          WORKSTATIONS
        </Link>
        <Link
          to="/collections/all?category=Desktops"
          className="text-black hover:text-blue-500 text-sm font-medium"
        >
          DESKTOPS
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user && user.role==="admin" &&(<Link to="/admin" className="block bg-black px-2 text-white rounded">
          ADMIN
        </Link>)}
        
        <Link to="/profile" className="hover:text-blue-500">
          <HiOutlineUser className="h-6 w-6 text-black hover:text-blue-500"></HiOutlineUser>
        </Link>
        <button
          onClick={toggleCartDrawer}
          className="relative hover:text-blue-500"
        >
          <HiOutlineShoppingBag className="h-6 w-6 text-black hover:text-blue-500 cursor-pointer"></HiOutlineShoppingBag>
          {cartItemCount>0&&(<span className="absolute -top-1 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">
          {cartItemCount}</span>)}
        </button>

        {/* search function */}
        <div className="overflow-hidden">
          <Searchbar />
        </div>
        <button onClick={togglenavdrawer} className="md:hidden">
          <HiBars3BottomRight className="h-6 w-6 text-black hover:text-blue-500"></HiBars3BottomRight>
        </button>
      </div>
      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {/*Mobile navigation*/}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          navdraweropen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={togglenavdrawer}>
            <IoMdClose className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            <Link
              to="/collections/all?category=Laptops"
              onClick={togglenavdrawer}
              className="block text-gray-600 hover:text-blue-500"
            >
              LAPTOPS
            </Link>
            <Link
              to="/collections/all?category=GamingLaptop"
              onClick={togglenavdrawer}
              className="block text-gray-600 hover:text-blue-500"
            >
              GAMING LAPTOP
            </Link>
            <Link
              to="/collections/all?category=BusinessLaptop"
              onClick={togglenavdrawer}
              className="block text-gray-600 hover:text-blue-500"
            >
              BUSINESS LAPTOP
            </Link>
            <Link
              to="/collections/all?category=BusinessLaptop"
              onClick={togglenavdrawer}
              className="block text-gray-600 hover:text-blue-500"
            >
              MACBOOK
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
