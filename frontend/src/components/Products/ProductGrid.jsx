import { Link } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

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
  return url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : "";
};

const ProductGrid = ({ products = [], loading, error }) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {String(error)}</p>;

  const toProductPath = (productOrId) => {
    if (!productOrId) return "/product";
    if (typeof productOrId === "string") return `/product/${productOrId}`;
    const id = productOrId._id || productOrId.id || productOrId.productId;
    return id ? `/product/${id}` : "/product";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product, index) => {
        const key = product?._id || product?.id || index;
        const firstImage = Array.isArray(product?.images) ? product.images[0] : product?.images;
        const src = normalizeImage(firstImage);
        const alt = (firstImage && (firstImage.altText || firstImage.alt || firstImage.name)) || product?.name || "Product";
        // product data uses `collections` (plural) — show it if present, fallback to `collection`
        const collectionLabel = product?.collections || product?.collection || "";
        return (
          <Link key={key} to={toProductPath(product)} className="block">
            <div className="bg-white p-4 rounded-lg h-full flex flex-col">
              <div className="w-full h-56 mb-4 bg-gray-100 flex items-center justify-center overflow-hidden">
                {src ? (
                  <img src={src} alt={alt} className="w-full h-full object-cover object-center" style={{ aspectRatio: "4/3" }} />
                ) : (
                  <div className="text-sm text-gray-400">No image</div>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="text-sm mb-2">{product?.name}</h3>
                <p className="text-gray-500 font-medium text-sm tracking-tighter">{product?.price ?? ""}</p>
                <p className="text-xs text-gray-400 mt-1">{collectionLabel || product?.category || ""}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
