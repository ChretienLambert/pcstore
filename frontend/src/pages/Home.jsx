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
    dispatch(fetchProductsByFilters({}));
  }, [dispatch]);

  return (
    <>
      {/* HERO full screen */}
      <Hero_temp />

      {/* Rest of page content */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100">
        <section className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Main CTA card */}
            <div className="md:col-span-3 bg-white rounded-3xl shadow-lg p-10 border border-gray-100 transition-transform transform hover:-translate-y-1 hover:shadow-xl duration-300">
              <h2 className="text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
                Welcome to{" "}
                <span className="text-indigo-600 drop-shadow-sm">PCSTORE</span>
              </h2>

              <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-2xl">
                Whether you want a{" "}
                <span className="font-medium text-gray-800">
                  ready-made PC
                </span>{" "}
                or prefer to{" "}
                <span className="font-medium text-gray-800">
                  build your own
                </span>
                , we’ve got you covered with the best tech at unbeatable prices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => navigate("/build")}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Build Your Own PC
                </button>

                <Link
                  to="/collections/all"
                  className="flex-1 border border-gray-300 text-indigo-600 py-4 text-center rounded-xl bg-white hover:bg-gray-50 font-semibold shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                >
                  Shop Pre-Built PCs & Parts
                </Link>
              </div>

              {/* Featured Products */}
              <div className="mt-14">
                <h3 className="text-3xl font-bold mb-6 text-gray-900">
                  Featured Products
                </h3>
                {loading && (
                  <p className="text-gray-500 animate-pulse">
                    Loading products...
                  </p>
                )}
                {error && <p className="text-red-600">Error loading products</p>}
                {!loading && !error && (
                  // Featured: only laptops (category / collections / tags heuristics)
                  <ProductGrid
                    products={products
                      .filter((p) => {
                        const cat = String(p?.category || "").toLowerCase();
                        const coll = String(p?.collections || p?.collection || "").toLowerCase();
                        const tags = (p?.tags || []).join(" ").toLowerCase();
                        return cat.includes("laptop") || coll.includes("laptop") || tags.includes("laptop");
                      })
                      .slice(0, 8)}
                    gridCols={4}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
