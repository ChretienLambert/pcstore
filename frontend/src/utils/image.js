export const normalizeImage = (img) => {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
  if (!img) return "/placeholder.png";
  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    return `${BACKEND}${img.startsWith("/") ? "" : "/"}${img}`;
  }
  const url = img.url || img.path || img.src || "";
  return url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : "/placeholder.png";
};