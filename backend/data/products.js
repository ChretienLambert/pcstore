// product.js:

const products = [
  {
    name: "ASUS ROG Strix G16 Gaming Laptop",
    description:
      "16\" gaming laptop with Intel Core i9, NVIDIA RTX 4080, 32GB DDR5, 1TB NVMe SSD, RGB keyboard, and advanced cooling.",
    price: 1499994,
    discountPrice: 1379994,
    countInStock: 8,
    sku: "ASUS-ROG-G16-4080",
    category: "Laptops",
    brand: "ASUS",
    collections: "Gaming Series",
    sizes: ["Standard"],
    colors: ["Black"],
    material: "Aluminum",
    images: [
      { url: "https://images.unsplash.com/photo-1611924638863-3a4f1b0f8d1c", altText: "ASUS ROG Strix G16" }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["gaming", "laptop", "rtx4080", "asus", "high-performance"],
    dimensions: { length: 36.0, width: 25.0, height: 2.5, unit: "cm" },
    weight: { value: 2.5, unit: "kg" },
    rating: 4.8,
    numReviews: 154,
    metaTitle: "ASUS ROG Strix G16 - RTX 4080 Gaming Laptop",
    metaDescription: "Powerful 16-inch gaming laptop with Intel i9 and RTX 4080.",
    metaKeywords: "asus rog, gaming laptop, rtx4080"
  },
  {
    name: "Dell XPS 15 Creator Laptop",
    description:
      "15.6\" creator laptop with Intel Core i7, NVIDIA RTX 4060, 32GB RAM, 1TB SSD, 4K OLED display optimized for content creators.",
    price: 1319994,
    discountPrice: 1199994,
    countInStock: 12,
    sku: "DELL-XPS15-CR-4060",
    category: "Laptops",
    brand: "Dell",
    collections: "Creator Series",
    sizes: ["Standard"],
    colors: ["Silver"],
    material: "Aluminum",
    images: [
      { url: "https://images.unsplash.com/photo-1580910051072-0f3f9f0b3b6b", altText: "Dell XPS 15" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["creator", "laptop", "xps", "4k"],
    dimensions: { length: 34.0, width: 23.5, height: 1.8, unit: "cm" },
    weight: { value: 1.8, unit: "kg" },
    rating: 4.7,
    numReviews: 98,
    metaTitle: "Dell XPS 15 Creator - 4K OLED",
    metaDescription: "Dell XPS 15 with 4K OLED and RTX 4060 for creators.",
    metaKeywords: "dell xps, creator laptop, 4k oled"
  },
  {
    name: "Intel NUC 12 Mini PC",
    description:
      "Compact mini PC with Intel Core i7, 16GB RAM, 512GB NVMe SSD — ideal for home office and media center setups.",
    price: 419994,
    discountPrice: 389994,
    countInStock: 25,
    sku: "INTEL-NUC-12-I7",
    category: "Mini PC",
    brand: "Intel",
    collections: "Mini PCs",
    sizes: ["One Size"],
    colors: ["Black"],
    material: "Plastic/Aluminum",
    images: [
      { url: "https://images.unsplash.com/photo-1587202372775-3b5b5d3f4b9d", altText: "Intel NUC Mini PC" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["mini-pc", "intel", "nuc", "compact"],
    dimensions: { length: 11.0, width: 11.0, height: 5.0, unit: "cm" },
    weight: { value: 0.9, unit: "kg" },
    rating: 4.5,
    numReviews: 42,
    metaTitle: "Intel NUC 12 - Mini PC",
    metaDescription: "Small form-factor Intel NUC with Core i7 for compact setups.",
    metaKeywords: "intel nuc, mini pc"
  },
  {
    name: "Custom Gaming Desktop - RTX 4070 Ti",
    description:
      "Custom-built desktop with AMD Ryzen 7 7800X, NVIDIA RTX 4070 Ti, 32GB DDR5, 1TB NVMe + 2TB HDD, RGB case, liquid cooling.",
    price: 1139994,
    discountPrice: 1079994,
    countInStock: 5,
    sku: "CUST-GAMEDESK-4070TI",
    category: "Desktops",
    brand: "Custom Build",
    collections: "Gaming Builds",
    sizes: ["Full Tower"],
    colors: ["Black"],
    material: "Steel/Plastic",
    images: [
      { url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7", altText: "Custom Gaming Desktop" }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["desktop", "gaming", "rtx4070ti", "custom"],
    dimensions: { length: 45.0, width: 21.0, height: 45.0, unit: "cm" },
    weight: { value: 10.5, unit: "kg" },
    rating: 4.9,
    numReviews: 63,
    metaTitle: "Custom Gaming Desktop - RTX 4070 Ti",
    metaDescription: "High-performance custom desktop for gamers and streamers.",
    metaKeywords: "gaming desktop, rtx 4070 ti"
  },
  {
    name: "HP Envy All-in-One 27",
    description:
      "27\" all-in-one PC featuring Intel Core i5, 16GB RAM, 512GB SSD and UHD display — clean setup for home office.",
    price: 719994,
    discountPrice: 659994,
    countInStock: 7,
    sku: "HP-ENVY-AIO-27",
    category: "All-in-One",
    brand: "HP",
    collections: "AIO Series",
    sizes: ["One Size"],
    colors: ["Silver"],
    material: "Aluminum/Glass",
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", altText: "HP Envy All-in-One" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["all-in-one", "hp", "home-office"],
    dimensions: { length: 62.0, width: 18.0, height: 45.0, unit: "cm" },
    weight: { value: 7.2, unit: "kg" },
    rating: 4.4,
    numReviews: 37,
    metaTitle: "HP Envy All-in-One 27",
    metaDescription: "27-inch all-in-one PC with UHD display for home office.",
    metaKeywords: "hp envy, all-in-one"
  },
  {
    name: "Workstation Tower - Ryzen Threadripper",
    description:
      "Professional workstation with AMD Threadripper, 64GB ECC RAM, 4TB NVMe storage, and professional GPU for CAD and rendering.",
    price: 2999994,
    discountPrice: 2819994,
    countInStock: 2,
    sku: "WS-TR-7900X",
    category: "Workstations",
    brand: "WorkBuild",
    collections: "Workstations",
    sizes: ["Full Tower"],
    colors: ["Black"],
    material: "Steel",
    images: [
      { url: "https://images.unsplash.com/photo-1555617117-08bda36f2a8d", altText: "Workstation Tower" }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["workstation", "threadripper", "rendering"],
    dimensions: { length: 60.0, width: 25.0, height: 55.0, unit: "cm" },
    weight: { value: 18.0, unit: "kg" },
    rating: 4.9,
    numReviews: 18,
    metaTitle: "Threadripper Workstation",
    metaDescription: "High-end workstation for professionals with Threadripper CPU.",
    metaKeywords: "workstation, threadripper"
  },
  {
    name: "Lenovo Legion Slim 7 Gaming Laptop",
    description:
      "16\" thin-and-light gaming laptop with AMD Ryzen 9, NVIDIA RTX 4060, 32GB RAM, 1TB SSD and high-refresh display.",
    price: 1079994,
    discountPrice: 1019994,
    countInStock: 10,
    sku: "LEN-LEGION-SLIM7-4060",
    category: "Laptops",
    brand: "Lenovo",
    collections: "Gaming Series",
    sizes: ["Standard"],
    colors: ["Black"],
    material: "Aluminum",
    images: [
      { url: "https://images.unsplash.com/photo-1587202372775-3b5b5d3f4b9d", altText: "Lenovo Legion Slim 7" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["lenovo", "gaming", "ryzen9"],
    dimensions: { length: 35.5, width: 24.0, height: 1.9, unit: "cm" },
    weight: { value: 1.9, unit: "kg" },
    rating: 4.6,
    numReviews: 76,
    metaTitle: "Lenovo Legion Slim 7",
    metaDescription: "Slim gaming laptop with Ryzen 9 and RTX 4060.",
    metaKeywords: "lenovo legion, gaming laptop"
  },
  {
    name: "Acer Predator Helios Desktop",
    description:
      "Prebuilt gaming desktop with Intel i7, RTX 4070, 16GB DDR5, 1TB SSD — ready for gaming and VR.",
    price: 899994,
    discountPrice: 839994,
    countInStock: 6,
    sku: "ACR-PRED-HELIOS-4070",
    category: "Desktops",
    brand: "Acer",
    collections: "Gaming Series",
    sizes: ["Mid Tower"],
    colors: ["Black"],
    material: "Steel/Plastic",
    images: [
      { url: "https://images.unsplash.com/photo-1585079541039-5c6e9d5a3d2c", altText: "Acer Predator Helios Desktop" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["predator", "desktop", "rtx4070"],
    dimensions: { length: 42.0, width: 20.0, height: 44.0, unit: "cm" },
    weight: { value: 11.0, unit: "kg" },
    rating: 4.5,
    numReviews: 54,
    metaTitle: "Acer Predator Helios Desktop",
    metaDescription: "Prebuilt gaming desktop with RTX 4070.",
    metaKeywords: "acer predator, gaming desktop"
  },
  {
    name: "Apple MacBook Pro 16 M3 Max",
    description:
      "16-inch MacBook Pro with Apple M3 Max, 32GB unified memory, 1TB SSD — optimized for creative professionals.",
    price: 1979994,
    discountPrice: 1919994,
    countInStock: 4,
    sku: "APPLE-MBP16-M3",
    category: "Laptops",
    brand: "Apple",
    collections: "Pro Series",
    sizes: ["Standard"],
    colors: ["Space Gray"],
    material: "Aluminum",
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", altText: "MacBook Pro 16" }
    ],
    isFeatured: true,
    isPublished: true,
    tags: ["apple", "macbook", "m3"],
    dimensions: { length: 35.9, width: 24.7, height: 1.6, unit: "cm" },
    weight: { value: 2.1, unit: "kg" },
    rating: 4.9,
    numReviews: 210,
    metaTitle: "MacBook Pro 16 M3 Max",
    metaDescription: "Apple MacBook Pro 16-inch with M3 Max for pros.",
    metaKeywords: "macbook pro, m3 max"
  },
  {
    name: "MSI Creator P100A Desktop",
    description:
      "Compact creator desktop with Intel i9, 64GB RAM, 2TB NVMe — optimized for content creation and video editing.",
    price: 1499994,
    discountPrice: 1439994,
    countInStock: 3,
    sku: "MSI-CRP100A-I9",
    category: "Desktops",
    brand: "MSI",
    collections: "Creator Series",
    sizes: ["Small Form Factor"],
    colors: ["Black"],
    material: "Aluminum/Plastic",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", altText: "MSI Creator Desktop" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["creator", "desktop", "msi"],
    dimensions: { length: 30.0, width: 18.0, height: 42.0, unit: "cm" },
    weight: { value: 9.0, unit: "kg" },
    rating: 4.6,
    numReviews: 29,
    metaTitle: "MSI Creator P100A",
    metaDescription: "Creator desktop for editing and streaming.",
    metaKeywords: "msi creator, desktop"
  },
  {
    name: "Beelink Mini Gaming PC (Intel Arc)",
    description:
      "Mini gaming PC with Intel Core i5 and Intel Arc GPU, 16GB RAM, 512GB SSD — compact gaming and streaming solution.",
    price: 359994,
    discountPrice: 329994,
    countInStock: 18,
    sku: "BEELINK-MINIGAM-ARC",
    category: "Mini PC",
    brand: "Beelink",
    collections: "Mini PCs",
    sizes: ["One Size"],
    colors: ["Black"],
    material: "Aluminum/Plastic",
    images: [
      { url: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68", altText: "Beelink Mini Gaming PC" }
    ],
    isFeatured: false,
    isPublished: true,
    tags: ["mini-pc", "intel-arc", "beelink"],
    dimensions: { length: 12.0, width: 12.0, height: 5.0, unit: "cm" },
    weight: { value: 1.1, unit: "kg" },
    rating: 4.3,
    numReviews: 21,
    metaTitle: "Beelink Mini Gaming PC",
    metaDescription: "Compact Intel Arc mini PC for light gaming and streaming.",
    metaKeywords: "mini pc, intel arc"
  }
];

module.exports = products;
