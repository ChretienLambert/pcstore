import React, { useEffect, useState } from "react";
import { HiOutlineCreditCard, HiArrowPathRoundedSquare, HiShoppingBag } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchSimilarProducts, fetchSingleProduct } from "../../redux/slices/productsSlice";
import { useParams } from "react-router-dom";
import { addToCart } from "../../redux/slices/cartSlice";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const normalizeId = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe === "string") return maybe;
  return maybe._id || maybe.id || maybe.productId || null;
};

const normalizeImage = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image.startsWith("http") ? image : `${BACKEND}${image}`;
  const url =
    image.url ||
    image.path ||
    image.secure_url ||
    image.publicUrl ||
    image.filename ||
    image.src ||
    "";
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND}${url}`;
};

const ProductDetails = ({ productId: propProductId }) => {
  const { id: routeId } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error } = useSelector((state) => state.products || {});
  const { user, guestId } = useSelector((state) => state.auth || {});
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const productFetchId = normalizeId(propProductId || routeId);

  useEffect(() => {
    if (!productFetchId) return;
    dispatch(fetchSingleProduct(productFetchId));
    dispatch(fetchSimilarProducts(productFetchId));
  }, [dispatch, productFetchId]);

  useEffect(() => {
    const imgs = Array.isArray(selectedProduct?.images) ? selectedProduct.images : selectedProduct?.images ? [selectedProduct.images] : [];
    if (imgs.length > 0) {
      const first = normalizeImage(imgs[0]);
      setMainImage((prev) => prev || first);
    } else {
      setMainImage("");
    }
  }, [selectedProduct]);

  const handleQuantityChange = (action) => {
    if (action === "plus") setQuantity((q) => q + 1);
    if (action === "minus" && quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = () => {
    if ((selectedProduct?.sizes && !selectedSize) || (selectedProduct?.colors && !selectedColor)) {
      toast.error("Please select a size and color before adding to cart", { duration: 1500 });
      return;
    }
    setIsButtonDisabled(true);
    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => toast.success("Product added to cart", { duration: 1200 }))
      .catch(() => toast.error("Failed to add to cart"))
      .finally(() => setIsButtonDisabled(false));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {String(error)}</p>;
  if (!selectedProduct) return <p>Product not found</p>;

  const imgs = Array.isArray(selectedProduct.images) ? selectedProduct.images : selectedProduct.images ? [selectedProduct.images] : [];

  return (
    <section>
      <div className="p-6">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
          <div className="flex flex-col md:flex-row">
            <div className="hidden md:flex flex-col space-y-4 mr-6">
              {imgs.map((image, index) => {
                const src = normalizeImage(image);
                return (
                  <img
                    key={index}
                    src={src}
                    alt={image?.altText || image?.alt || selectedProduct.name}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === src ? "border-black" : "border-gray-300"}`}
                    onClick={() => setMainImage(src)}
                  />
                );
              })}
            </div>

            <div className="md:w-1/2">
              <div className="mb-4">
                <img
                  src={mainImage || normalizeImage(imgs[0])}
                  alt="Main Product"
                  className="w-full h-[480px] object-cover object-center rounded-lg"
                  style={{ maxHeight: 560 }}
                />
              </div>
            </div>

            <div className="md:w-1/2 md:ml-10">
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">{selectedProduct?.name}</h1>

              <p className="text-lg text-gray-600 mb-1 line-through">
                {selectedProduct?.originalPrice ?? selectedProduct?.discountPrice ?? ""}
              </p>
              <p className="text-xl text-gray-500 mb-2">{selectedProduct?.price ?? ""} FCFA</p>
              <p className="text-gray-600 mb-4">{selectedProduct?.description ?? ""}</p>

              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {(selectedProduct?.colors || []).map((color) => (
                    <button
                      key={String(color)}
                      className={`w-8 h-8 rounded-full border cursor-pointer ${selectedColor === color ? "border-4 border-black" : "border-gray-300"}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: String(color).toLowerCase(), filter: "brightness(0.5)" }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {(selectedProduct?.sizes || []).map((size) => (
                    <button
                      key={String(size)}
                      className={`px-4 py-2 rounded border cursor-pointer ${selectedSize === size ? "border-4 border-black" : "border-gray-300"}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">Quantity:</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button className="px-2 py-1 bg-gray-200 rounded text-lg cursor-pointer" onClick={() => handleQuantityChange("minus")}>-</button>
                  <span className="text-lg">{quantity}</span>
                  <button className="px-2 py-1 bg-gray-200 rounded text-lg cursor-pointer" onClick={() => handleQuantityChange("plus")}>+</button>
                </div>
              </div>

              <button disabled={isButtonDisabled} onClick={handleAddToCart} className={`bg-[#5C5CFF] text-white py-2 px-6 rounded w-full mb-4 cursor-pointer ${isButtonDisabled ? "cursor-not-allowed" : "hover:bg-blue-300"}`}>
                {isButtonDisabled ? "Adding..." : "ADD TO CART"}
              </button>

              <div className="mt-10 text-gray-700">
                <h3 className="text-xl font-bold mb-4">Characteristics</h3>
                <table className="w-full text-left text-sm text-gray-600">
                  <tbody>
                    <tr>
                      <td className="py-1">Brand</td>
                      <td className="py-1">{selectedProduct?.brand ?? ""}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Material</td>
                      <td className="py-1">{selectedProduct?.material ?? ""}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Collection</td>
                      <td className="py-1">{selectedProduct?.collections ?? selectedProduct?.collection ?? ""}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Category</td>
                      <td className="py-1">{selectedProduct?.category ?? ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <HiShoppingBag className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">FREE SHIPPING</h4>
          <p className="text-gray-600 text-sm tracking-tighter">Free shipping across Douala</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <HiArrowPathRoundedSquare className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">30 DAYS RETURN</h4>
          <p className="text-gray-600 text-sm tracking-tighter">Money back guaranteed</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full mb-4">
            <HiOutlineCreditCard className="text-xl" />
          </div>
          <h4 className="tracking-tighter mb-2">SECURE CHECKOUT</h4>
          <p className="text-gray-600 text-sm tracking-tighter">100% secured checkout process</p>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;