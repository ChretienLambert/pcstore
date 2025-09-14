import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const MAX_PRICE = 10000000;

  const [filters, setFilters] = useState({
    category: "",
    color: "",
    size: [],
    brand: [],
    minPrice: 0,
    maxPrice: MAX_PRICE,
  });

  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);

  // Available filter options (added missing "All-in-One")
  const categories = ["Laptops", "Mini PC", "Desktops", "All-in-One", "Workstations"];
  const colors = ["Black", "Silver", "Space Gray"];
  const sizes = ["Standard", "One Size", "Full Tower", "Mid Tower", "Small Form Factor"];
  const brands = [
    "HP", "ASUS", "Dell", "Apple", "Acer", "Lenovo",
    "MSI", "Beelink", "Custom Build", "WorkBuild", "Intel"
  ];

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === "checkbox") {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = (newFilters[name] || []).filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value;
    }

    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, val]) => {
      // do not remap local 'category' to 'collections' here.
      // keep category => category, collections should be a separate filter if needed.
      const outKey = key;

      if (Array.isArray(val)) {
        if (val.length) params.set(outKey, val.join(","));
      } else if (typeof val === "number") {
        params.set(outKey, String(val));
      } else if (val) {
        params.set(outKey, String(val));
      }
    });

    setSearchParams(params);
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    const minP = Number(params.minPrice) || 0;
    const maxP = Number(params.maxPrice) || MAX_PRICE;

    // prefer params.category but accept legacy params.collections if present
    setFilters({
      category: params.category || params.collections || params.collection || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: minP,
      maxPrice: maxP,
    });

    setPriceRange([minP, maxP]);
  }, [searchParams]);

  // --- Price slider handlers ---
  const handleRangeChange = (e) => {
    const maxVal = Number(e.target.value);
    setPriceRange([0, maxVal]);
    setFilters((prev) => ({ ...prev, maxPrice: maxVal }));
  };

  const commitPriceChange = () => {
    const newFilters = { ...filters, minPrice: priceRange[0], maxPrice: priceRange[1] };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  return (
    <div className="p-4 bg-blue-100">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1">
            <input
              type="radio"
              name="category"
              value={category}
              checked={filters.category === category}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{category}</span>
          </div>
        ))}
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              name="color"
              onClick={() => {
                const newFilters = { ...filters, color: filters.color === color ? "" : color };
                setFilters(newFilters);
                updateURLParams(newFilters);
              }}
              className={`w-8 h-8 rounded-full border cursor-pointer transition hover:scale-105 
                ${filters.color === color ? "ring-2 ring-blue-500" : "border-gray-300"}`}
              style={{ backgroundColor: color.toLowerCase() }}
            />
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Size</label>
        {sizes.map((size) => (
          <div key={size} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="size"
              value={size}
              checked={(filters.size || []).includes(size)}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{size}</span>
          </div>
        ))}
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Brand</label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="brand"
              value={brand}
              checked={(filters.brand || []).includes(brand)}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{brand}</span>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          value={priceRange[1]}
          onChange={handleRangeChange}
          onMouseUp={commitPriceChange}
          onTouchEnd={commitPriceChange}
          onKeyUp={commitPriceChange}
          onBlur={commitPriceChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-gray-600 mt-2">
          <span>0 FCFA</span>
          <span>{priceRange[1].toLocaleString()} FCFA</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
