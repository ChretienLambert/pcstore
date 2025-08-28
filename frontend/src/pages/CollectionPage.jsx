import {  useEffect, useRef } from "react"
import { useState } from "react"
import Dellimage from "../assets/5.jpg"
import Asusimage from "../assets/7.jpg"
import Hpimage from "../assets/8.jpg"
import Macbookimage from "../assets/6.jpg"
import {FaFilter} from "react-icons/fa"
import FilterSidebar from "../components/Products/FilterSidebar"
import SortOptions from "../components/Products/SortOptions"
import ProductGrid from "../components/Products/ProductGrid"

const CollectionPage = () => {
    const sidebarRef=useRef(null)
    const [isSidebarOpen, setIsSidebarOpen]= useState(false)
    const [products, setProducts] = useState([])
    const toggleSidebar=()=>{
        setIsSidebarOpen(!isSidebarOpen)
    }
    const handleClickOutside=(e)=>{
        if(isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)){
            setIsSidebarOpen(false)
        }
    }
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return()=>{
        document.removeEventListener("mousedown", handleClickOutside)}},[])


    useEffect(()=>{
        setTimeout(()=>{
            const fetchedProducts = [
                {id:1, name:"DELL", price:"500000 FCFA", images:[Dellimage]},
                {id:2, name:"ASUS", price:"800000 FCFA", images:[Asusimage]},
                {id:3, name:"HP", price:"600000 FCFA", images:[Hpimage]},
                {id:4, name:"MacBook Air", price:"300000 FCFA", images:[Macbookimage]}
            ]
            setProducts(fetchedProducts)
    },1000)
},[])
    
  return (
    <div className="flex flex-col lg:flex-row">
        {/*Sidebar for filters*/}
        <button onClick={toggleSidebar} className="lg:hidden border p-2 flex justify-center items-center">
        <FaFilter className="mr-2"/>Filters</button>
    

    {/*Sidebar content*/}
    <div ref={sidebarRef} className={`${isSidebarOpen ? "translate-x-0":"-translate-x-full"} fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}>
    <FilterSidebar />
    </div>
    <div className="flex-grow p-4">
        <h2 className="text-2xl uppercase mb-4">All Collection</h2>
        <SortOptions />
        <ProductGrid products={products} />
    </div>
    </div>    
    
    
  )
}

export default CollectionPage
