import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Hero_temp from "../components/Layout/Hero_temp";
import ProductGrid from "../components/Products/ProductGrid";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((s) => s.products);

  useEffect(() => {
    // load featured / all products for homepage
    dispatch(fetchProductsByFilters({}));
  }, [dispatch]);

  return (
    <div>
      <Hero_temp />
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <p className="text-sm text-gray-500">Curated picks for you</p>
        </div>

        <div className="bg-transparent">
          {loading && <p>Loading products...</p>}
          {error && <p className="text-red-600">Error loading products</p>}
          {!loading && !error && (
            <ProductGrid products={products.slice(0, 12)} gridCols={4} />
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">New Arrivals</h3>
          <ProductGrid products={products.slice(12, 24)} gridCols={4} />
        </div>
      </section>
    </div>
  );
};

export default Home;
