import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  fetchSingleProduct,
  updateProduct,
} from "../../redux/slices/productsSlice";

const EditProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedProduct, loading, error } = useSelector(
    (state) => state.products
  );

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    images: [],
  });

  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      // Check if this is a new product (ID might not exist in backend yet)
      if (id.startsWith('TMP-') || id.includes('new')) {
        setIsNewProduct(true);
        // Set default values for new product
        setProductData({
          name: "New Product",
          description: "Describe your product",
          price: 0,
          countInStock: 0,
          sku: `TMP-${Date.now()}`,
          category: "Uncategorized",
          brand: "",
          sizes: ["Standard"],
          colors: ["Black"],
          collections: "General",
          material: "",
          images: [],
        });
      } else {
        setIsNewProduct(false);
        dispatch(fetchSingleProduct(id));
      }
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct && !isNewProduct) {
      setProductData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || 0,
        countInStock: selectedProduct.countInStock || 0,
        sku: selectedProduct.sku || "",
        category: selectedProduct.category || "",
        brand: selectedProduct.brand || "",
        sizes: selectedProduct.sizes || [],
        colors: selectedProduct.colors || [],
        collections: selectedProduct.collections || "",
        material: selectedProduct.material || "",
        images: selectedProduct.images || [],
      });
    }
  }, [selectedProduct, isNewProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
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
      setUpdateError("Image upload failed");
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
    setUpdateError("");
    
    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...productData,
        price: Number(productData.price),
        countInStock: Number(productData.countInStock),
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],
      };

      const result = await dispatch(updateProduct({ id, productData: processedData })).unwrap();
      
      if (result) {
        navigate("/admin/products");
      } else {
        setUpdateError("Update failed. Please try again.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError(err.message || "Failed to update product");
    }
  };

  if (loading && !isNewProduct) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-red-600 p-6">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
      <h2 className="text-3xl font-bold mb-6">
        {isNewProduct ? "Create New Product" : "Edit Product"}
      </h2>
      
      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {updateError}
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
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex gap-2 items-center mb-4">
            <button
              type="button"
              onClick={triggerImagePicker}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload Image
            </button>
            <span className="text-sm text-gray-500">Use the button to select an image file</span>
          </div>
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
            {loading ? "Saving..." : isNewProduct ? "Create Product" : "Update Product"}
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

export default EditProductPage;