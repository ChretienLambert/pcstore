import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Hero_temp from "../components/Layout/Hero_temp";
import ProductGrid from "../components/Products/ProductGrid";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector(
    (s) => s.products || { products: [], loading: false, error: null }
  );

  useEffect(() => {
    // load featured / all products for homepage
    dispatch(fetchProductsByFilters({}));
  }, [dispatch]);

  return (
    <div>
      <Hero_temp />

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="md:col-span-3 bg-white card p-6 rounded shadow">
            <h2 className="text-3xl font-extrabold mb-3 text-indigo-700">
              Welcome to PCSTORE
            </h2>
            <p className="text-gray-600 mb-6">
              Need a ready PC or want to build one? Start by choosing below.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/build")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg shadow"
              >
                Create your own PC
              </button>

              <Link
                to="/collections/all"
                className="flex-1 border border-indigo-100 text-indigo-700 py-4 text-center rounded-lg bg-indigo-50 hover:bg-indigo-100 font-medium"
              >
                Buy a pre-built PC or parts
              </Link>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Featured Products
              </h3>
              {loading && <p>Loading products...</p>}
              {error && <p className="text-red-600">Error loading products</p>}
              {!loading && !error && (
                <ProductGrid products={products.slice(0, 8)} gridCols={4} />
              )}
            </div>
          </div>

          {/* aside removed to focus on Build CTA & Featured products */}
        </div>
      </section>
    </div>
  );
};

export default Home;
