import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "",
    color: "",
    size: [],
    brand: [],
    dimension: [],
    minPrice: 0,
    maxPrice: 10000000,
  });

  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const categories = ["Laptop", "Gaming Laptop"];
  const colors = ["Red", "Blue", "Black", "Green", "Yellow"];
  const sizes = ["13-inch", "15-inch", "17-inch"];
  const brands = ["HP", "ASUS", "DELL", "MACBOOK", "ACER"];
  const dimensions = ["Compact", "Standard", "Large"];

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === "checkbox") {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value;
      console.log(newFilters);
    }

    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
        params.append(key, newFilters[key].join(","));
      } else if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString}`);
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    setFilters({
      category: params.category || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: Number(params.minPrice) || 0,
      maxPrice: Number(params.maxPrice) || 10000000,
    });
    setPriceRange([
      Number(params.minPrice) || 0,
      Number(params.maxPrice) || 10000000,
    ]);
  }, [searchParams]);

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

      {/*Dimension Filter*/}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">
          Dimension
        </label>
        {dimensions.map((dimension) => (
          <div key={dimension} className="flex items-center mb-1">
            <input
              type="radio"
              name="dimension"
              value={dimension}
              checked={filters.dimension === dimension}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{dimension}</span>
          </div>
        ))}
      </div>
      {/*Color Filter*/}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              name="color"
              onClick={() => setFilters({ ...filters, color })}
              className={`w-8 h-8 rounded-full border cursor-pointer transition hover:scale-105 
          ${
            filters.color === color ? "ring-2 ring-blue-500" : "border-gray-300"
          }`}
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
              checked={filters.size.includes(size)}
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
              checked={filters.brand.includes(brand)}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{brand}</span>
          </div>
        ))}
      </div>
      {/*Price range*/}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">
          Price Range
        </label>
        <input
          type="range"
          name="priceRange"
          min={0}
          max={1000000}
          onChange={handleFilterChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursoer-pointer"
        />
        <div className="flex justify-between text-gray-600 mt-2">
          <span>0 FCFA</span>
          <span>{priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
