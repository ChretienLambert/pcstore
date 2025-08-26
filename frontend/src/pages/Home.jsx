import Hero_temp from "../components/Layout/Hero_temp";
import PCCollection from "../components/Products/PCCollection";
import NewArrivals from "../components/Products/NewArrivals"
import ProductDetails from "../components/Products/ProductDetails";
import FeaturedHomePc from "../components/Products/FeaturedHomePc";

const Home = () => {
  return (
    <div>
      <Hero_temp />
      <PCCollection />
      <NewArrivals />
      <FeaturedHomePc />
      <ProductDetails />
    </div>
  )
}

export default Home
