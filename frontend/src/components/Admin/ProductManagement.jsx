import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { DeleteProduct, fetchAdminProducts, createProduct } from "../../redux/slices/adminProductSlice";

const ProductManagement = () => {
  const dispatch=useDispatch()
  const navigate = useNavigate();
  const {products,loading,error}=useSelector(
    (state)=>state.adminProducts
  )

  useEffect(()=>{
    dispatch(fetchAdminProducts())
  },[dispatch])



  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the Product?")) {
      dispatch(DeleteProduct(id))
    }
  };

  const handleCreate = async () => {
    // minimal default product — will be validated on backend
    const defaultProduct = {
      name: "New Product",
      description: "Describe your product",
      price: 0,
      discountPrice: 0,
      countInStock: 0,
      sku: `TMP-${Date.now()}`,
      category: "Uncategorized",
      sizes: ["Standard"],
      colors: ["Black"],
      collections: "General",
      images: [
        { url: `${import.meta.env.VITE_BACKEND_URL}/style.css`, altText: "placeholder" },
      ],
    };
    try {
      const action = await dispatch(createProduct(defaultProduct)).unwrap();
      const newId = action._id || action.id;
      if (newId) {
        navigate(`/admin/products/${newId}/edit`);
      } else {
        // reload list on failure to get id
        dispatch(fetchAdminProducts());
      }
    } catch (err) {
      console.error("Create product failed:", err);
      dispatch(fetchAdminProducts());
    }
  };

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Create Product
          </button>
          <Link to="/admin/products" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Refresh
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg ">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="p-4">{product.price} FCFA</td>
                  <td className="p-4">{product.sku}</td>
                  <td className="p-4">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 "
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 hover:bg-red-700 px-2 py-1 rounded mr-2 cursor-pointer text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No Products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
