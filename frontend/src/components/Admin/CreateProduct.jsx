import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createProduct } from "../../redux/slices/adminProductSlice";

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.adminProducts);

  const [productData, setProductData] = useState({
    name: "New Product",
    description: "Describe your product",
    price: 0,
    countInStock: 0,
    sku: `SKU-${Date.now()}`,
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    images: [],
    discountPrice: 0,
    isActive: true
  });

  const [uploading, setUploading] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProductData((prevData) => ({
        ...prevData,
        images: [...(prevData.images || []), { url: data.imageUrl, altText: "" }],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      setCreateError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProductData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    
    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...productData,
        price: Number(productData.price),
        countInStock: Number(productData.countInStock),
        discountPrice: Number(productData.discountPrice || 0),
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],
      };

      const result = await dispatch(createProduct(processedData)).unwrap();
      
      if (result && result._id) {
        navigate(`/admin/products/${result._id}/edit`);
      } else {
        setCreateError("Product creation failed. No product ID returned.");
      }
    } catch (err) {
      console.error("Create error:", err);
      setCreateError(err.message || "Failed to create product");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
      <h2 className="text-3xl font-bold mb-6">Create New Product</h2>
      
      {createError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {createError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Price (FCFA)</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Discount Price */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Discount Price (FCFA)</label>
          <input
            type="number"
            name="discountPrice"
            value={productData.discountPrice}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            min="0"
            step="0.01"
          />
        </div>

        {/* Count in stock */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Count In Stock</label>
          <input
            type="number"
            name="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
            min="0"
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={productData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Brand */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Brand</label>
          <input
            type="text"
            name="brand"
            value={productData.brand}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Sizes (comma-separated)
          </label>
          <input
            type="text"
            value={(productData.sizes || []).join(", ")}
            onChange={(e) =>
              setProductData({
                ...productData,
                sizes: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="S, M, L, XL"
          />
        </div>

        {/* Colors */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Colors (comma-separated)
          </label>
          <input
            type="text"
            value={(productData.colors || []).join(", ")}
            onChange={(e) =>
              setProductData({
                ...productData,
                colors: e.target.value
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Black, White, Red"
          />
        </div>

        {/* Collections */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Collections</label>
          <input
            type="text"
            name="collections"
            value={productData.collections}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Material */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Material</label>
          <input
            type="text"
            name="material"
            value={productData.material}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Image upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Upload Image</label>
          <input 
            type="file" 
            onChange={handleImageUpload} 
            className="mb-2"
            accept="image/*"
          />
          {uploading && <p className="text-blue-600">Uploading Image...</p>}
          <div className="flex gap-4 mt-4 flex-wrap">
            {(productData.images || []).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={image.altText || "Product Image"}
                  className="w-20 h-20 object-cover rounded-md shadow-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-700 px-6 py-2 rounded text-white font-semibold transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="bg-gray-500 hover:bg-gray-700 px-6 py-2 rounded text-white font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;