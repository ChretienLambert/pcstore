import Hero_temp from "../components/Layout/Hero_temp";
import PCCollection from "../components/Products/PCCollection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import FeaturedHomePc from "../components/Products/FeaturedHomePc";
import ProductGrid from "../components/Products/ProductGrid"
import {useDispatch,useSelector} from "react-redux"
import { useEffect, useState } from "react";
import axios from "axios"
import {fetchProductsByFilters} from "../redux/slices/productsSlice"

 
const Home = () => {
  const dispatch=useDispatch()
  const {products,loading,error}=useSelector((state)=>state.products)
  const [bestSellerProduct,setBestSellerProduct]=useState(null)

  useEffect(()=>{
    dispatch(fetchProductsByFilters({
      category:"sh",
      limit:8
    }))
    //Fetch best seller
  const fetchBestSeller=async()=>{
  try{
    const response =await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
    )
    setBestSellerProduct(response.data)
  } catch(error){
    console.error(error)
  }
}
  fetchBestSeller()
  },[dispatch])

  return (
    <div>
      <Hero_temp />
      <PCCollection />
      <NewArrivals />
      <p className="text-center font-bold text-black text-2xl">BEST SELLER</p>
      {bestSellerProduct ? (
        <ProductDetails productId={bestSellerProduct._id}/>
      ):(
        <p className="text-center">Loading the best seller product ...</p>
      )}
      <ProductGrid products={products} loading={loading} error={error}/>
      <FeaturedHomePc />
      <ProductDetails />
    </div>
  );
};

export default Home;
