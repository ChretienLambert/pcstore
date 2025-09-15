// backend/data/products.js
// PC parts dataset + added laptops, mini PCs, all-in-one, workstations and desktops
// Prices in XAF (Cameroon context)

const products = [
  {
    name: "Intel Pentium G6400 (LGA1200) - CPU",
    description: "Intel Pentium G6400 — budget CPU for entry desktops.",
    price: 26000,
    discountPrice: 25000,
    countInStock: 30,
    sku: "PART-CPU-INTEL-G6400",
    category: "PC Parts",
    brand: "Intel",
    images: [
      {
        url: "https://www.intel.com/content/dam/www/public/us/en/images/product/processor/core/pentium-g6400-angled.png",
        altText: "Intel Pentium G6400"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "CPU",
    tags: ["cpu", "intel", "budget"]
  },
  {
    name: "AMD Athlon 3000G - APU CPU",
    description: "AMD Athlon 3000G — includes Vega graphics for no-GPU builds.",
    price: 22000,
    discountPrice: 21000,
    countInStock: 26,
    sku: "PART-CPU-AMD-3000G",
    category: "PC Parts",
    brand: "AMD",
    images: [
      {
        url: "https://www.amd.com/system/files/2021-10/amd-athlon-3000g-product-photo.png",
        altText: "AMD Athlon 3000G"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "CPU",
    tags: ["cpu", "amd", "apu"]
  },
  {
    name: "ASRock A320M - Motherboard (AM4)",
    description: "Micro-ATX AM4 board suitable for budget Ryzen builds.",
    price: 18000,
    discountPrice: 17500,
    countInStock: 28,
    sku: "PART-MBO-ASROCK-A320M",
    category: "PC Parts",
    brand: "ASRock",
    images: [
      {
        url: "https://www.asrock.com/images/product/mb/A320M%20HD%20R4.0/1.png",
        altText: "ASRock A320M"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Motherboard",
    tags: ["motherboard", "asrock", "am4"]
  },
  {
    name: "Gigabyte A520M - Motherboard (AM4)",
    description: "Micro-ATX Gigabyte A520M for modern budget Ryzen CPUs.",
    price: 24000,
    discountPrice: 23000,
    countInStock: 20,
    sku: "PART-MBO-GIGABYTE-A520M",
    category: "PC Parts",
    brand: "Gigabyte",
    images: [
      {
        url: "https://static.gigabyte.com/StaticFile/Image/Global/6e5a9af2d11a1c88c8f0b0a8a0b9732d/Product/2900.png",
        altText: "Gigabyte A520M"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Motherboard",
    tags: ["motherboard", "gigabyte", "am4"]
  },
  {
    name: "8GB DDR4 2666MHz - Desktop RAM (Kingston)",
    description: "8GB DDR4 single DIMM — budget memory for desktop builds.",
    price: 12500,
    discountPrice: 12000,
    countInStock: 90,
    sku: "PART-RAM-8GB-2666",
    category: "PC Parts",
    brand: "Kingston",
    images: [
      {
        url: "https://www.kingston.com/datasheets/visuals/kingston-dimms.png",
        altText: "8GB DDR4 RAM Kingston"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "RAM",
    tags: ["ram", "kingston", "8gb"]
  },
  {
    name: "16GB DDR4 3200MHz - Desktop RAM (Corsair)",
    description: "16GB DDR4 kit — better multitasking for budget workstations.",
    price: 22000,
    discountPrice: 21500,
    countInStock: 50,
    sku: "PART-RAM-16GB-3200",
    category: "PC Parts",
    brand: "Corsair",
    images: [
      {
        url: "https://www.corsair.com/medias/sys_master/images/images/h39/h0d/8897262062366/Corsair-Vengeance-RGB-Pro-Product-Shot-1.png",
        altText: "Corsair 16GB DDR4"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "RAM",
    tags: ["ram", "corsair", "16gb"]
  },
  {
    name: "GTX 1650 4GB - GPU (used/refurb option)",
    description: "Affordable GTX 1650 — decent 1080p performance for budget gamers (used/refurbished market).",
    price: 95000,
    discountPrice: 92000,
    countInStock: 8,
    sku: "PART-GPU-GTX1650",
    category: "PC Parts",
    brand: "NVIDIA",
    images: [
      {
        url: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/gtx-1650/gtx-1650-gallery-1.png",
        altText: "GTX 1650"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "GPU",
    tags: ["gpu", "nvidia", "gtx1650"]
  },
  {
    name: "GTX 1050 Ti 4GB - GPU (budget used option)",
    description: "Older GTX 1050 Ti — entry-level 1080p when available used.",
    price: 55000,
    discountPrice: 53000,
    countInStock: 5,
    sku: "PART-GPU-GTX1050TI",
    category: "PC Parts",
    brand: "NVIDIA",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Geforce_GTX_1050_Ti.PNG/640px-Geforce_GTX_1050_Ti.PNG",
        altText: "GTX 1050 Ti"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "GPU",
    tags: ["gpu", "nvidia", "gtx1050ti"]
  },
  {
    name: "240GB NVMe SSD - M.2",
    description: "240GB NVMe SSD — fast OS drive for budget desktops and laptops.",
    price: 14500,
    discountPrice: 14000,
    countInStock: 80,
    sku: "PART-SSD-NVME-240",
    category: "PC Parts",
    brand: "Western Digital",
    images: [
      {
        url: "https://www.westerndigital.com/content/dam/store/en-us/product/na/ssd/wd-black-sn750/gallery/wd-black-sn750-1.png",
        altText: "240GB NVMe SSD"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Storage",
    tags: ["ssd", "nvme", "storage"]
  },
  {
    name: "128GB SATA SSD - 2.5\"",
    description: "128GB SATA SSD — useful upgrade for older laptops.",
    price: 8200,
    discountPrice: 8000,
    countInStock: 120,
    sku: "PART-SSD-SATA-128",
    category: "PC Parts",
    brand: "KingSpec",
    images: [
      {
        url: "https://kingspec.com.cn/images/product/128gb-sata.png",
        altText: "128GB SATA SSD"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Storage",
    tags: ["ssd", "storage", "sata"]
  },
  {
    name: "Generic 450W PSU - ATX",
    description: "Budget 450W power supply for mainstream builds.",
    price: 9200,
    discountPrice: 9000,
    countInStock: 70,
    sku: "PART-PSU-450W-GEN",
    category: "PC Parts",
    brand: "Generic",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/PC_PSU.JPG/640px-PC_PSU.JPG",
        altText: "450W PSU"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "PSU",
    tags: ["psu", "power", "450w"]
  },
  {
    name: "Corsair CV450 450W - PSU",
    description: "Corsair CV450 450W — reliable entry PSU from a recognized brand.",
    price: 16000,
    discountPrice: 15500,
    countInStock: 40,
    sku: "PART-PSU-CV450",
    category: "PC Parts",
    brand: "Corsair",
    images: [
      {
        url: "https://www.corsair.com/medias/sys_master/images/images/h7e/h2b/8910815793086/CV450.png",
        altText: "Corsair CV450"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "PSU",
    tags: ["psu", "corsair"]
  },
  {
    name: "Budget Micro-ATX Case - Chassis",
    description: "Small micro-ATX case with front USB ports and basic airflow.",
    price: 7200,
    discountPrice: 7000,
    countInStock: 60,
    sku: "PART-CASE-MATX-BUDGET",
    category: "PC Parts",
    brand: "Generic",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/PC_Case.jpg/640px-PC_Case.jpg",
        altText: "Micro-ATX Case"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Case",
    tags: ["case", "chassis"]
  },
  {
    name: "Mid Tower Case with PSU Shroud",
    description: "Mid tower case for better cooling and cable management.",
    price: 15000,
    discountPrice: 14500,
    countInStock: 35,
    sku: "PART-CASE-MID-001",
    category: "PC Parts",
    brand: "CoolerMaster-like",
    images: [
      {
        url: "https://www.coolermaster.com/media/catalog/product/cache/1/image/1200x750/0dc2d03fe217f8c83829496872af24a0/c/m/cm_690_iii.jpg",
        altText: "Mid Tower Case"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Case",
    tags: ["case", "mid-tower"]
  },
  {
    name: "Tower Air CPU Cooler (Budget)",
    description: "Tower air cooler for better CPU temperatures than stock coolers.",
    price: 6000,
    discountPrice: 5800,
    countInStock: 55,
    sku: "PART-CL-CPU-TOWER-001",
    category: "PC Parts",
    brand: "Generic",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/CPU_cooler_with_fan.jpg/640px-CPU_cooler_with_fan.jpg",
        altText: "Tower Air Cooler"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Cooler",
    tags: ["cooler", "air"]
  },
  {
    name: "All-in-One Liquid 120mm - AIO Cooler",
    description: "120mm AIO liquid cooler for small builds needing better thermal headroom.",
    price: 12000,
    discountPrice: 11500,
    countInStock: 18,
    sku: "PART-CL-AIO-120",
    category: "PC Parts",
    brand: "Deepcool",
    images: [
      {
        url: "https://www.deepcool.com/global/img/products/cooling/aio/120mm/aio120.png",
        altText: "AIO 120mm"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Cooler",
    tags: ["cooler", "aio", "120mm"]
  },
  {
    name: "Mechanical Keyboard TKL - Budget",
    description: "Tenkeyless mechanical keyboard for compact setups.",
    price: 9200,
    discountPrice: 9000,
    countInStock: 42,
    sku: "PART-KBD-TKL-001",
    category: "Accessories",
    brand: "Redragon",
    images: [
      {
        url: "https://www.redragonzone.com/media/catalog/product/cache/9/image/9df78eab33525d08d6e5fb8d27136e95/r/e/redragon-k552-kumara.jpg",
        altText: "Redragon TKL Keyboard"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Accessories",
    tags: ["keyboard", "tkl"]
  },
  {
    name: "Optical Wired Mouse - Entry",
    description: "Simple wired optical mouse, durable and affordable.",
    price: 2600,
    discountPrice: 2500,
    countInStock: 160,
    sku: "PART-MOUSE-OPT-001",
    category: "Accessories",
    brand: "Generic",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Computer_mouse.jpg/640px-Computer_mouse.jpg",
        altText: "Wired Mouse"
      }
    ],
    isPublished: true,
    isPart: true,
    partType: "Accessories",
    tags: ["mouse", "optical"]
  },
  {
    name: "HP 250 G8 - Entry Business Laptop",
    description: "HP 250 G8 — reliable entry business laptop. Good for office, browsing and video calls.",
    price: 140000,
    discountPrice: 135000,
    countInStock: 10,
    sku: "LAP-HP-250G8-001",
    category: "Laptops",
    brand: "HP",
    images: [
      { url: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c06641261.png", altText: "HP 250 G8" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["hp", "laptop", "business"]
  },
  {
    name: "Dell Inspiron 15 3520 - Everyday Laptop",
    description: "Dell Inspiron 15 — everyday performance for students and families.",
    price: 155000,
    discountPrice: 149000,
    countInStock: 8,
    sku: "LAP-DELL-3520-001",
    category: "Laptops",
    brand: "Dell",
    images: [
      { url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/inspiron-notebooks/15-3520/media-gallery/notebook-inspiron-15-3520-black-gallery-4.psd?fmt=png-alpha&hei=402&wid=684", altText: "Dell Inspiron 15" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["dell", "laptop", "student"]
  },
  {
    name: "Lenovo IdeaPad 3 15 - Budget Multitasker",
    description: "Lenovo IdeaPad 3 — solid, budget 15\" laptop for multi-tasking and schoolwork.",
    price: 130000,
    discountPrice: 125000,
    countInStock: 12,
    sku: "LAP-LEN-IDEAPAD3-001",
    category: "Laptops",
    brand: "Lenovo",
    images: [
      { url: "https://www.lenovo.com/medias/lenovo-laptop-ideapad-3-15-subseries-hero.png", altText: "Lenovo IdeaPad 3" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["lenovo", "laptop", "budget"]
  },
  {
    name: "Acer Aspire 3 15 - Value Laptop",
    description: "Acer Aspire 3 — affordable 15\" laptop for basic use and office apps.",
    price: 120000,
    discountPrice: 115000,
    countInStock: 15,
    sku: "LAP-ACER-ASP3-001",
    category: "Laptops",
    brand: "Acer",
    images: [
      { url: "https://static.acer.com/up/Resource/Acer/Laptops/Aspire/Images/202102/acer-aspire-3-15-hero.png", altText: "Acer Aspire 3" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["acer", "laptop", "value"]
  },
  {
    name: "Refurbished Dell Latitude E7470 - Office Refurb",
    description: "Refurbished Dell Latitude — tested and warranty-backed refurbished laptops for offices and cafés.",
    price: 95000,
    discountPrice: 90000,
    countInStock: 6,
    sku: "LAP-DELL-LAT-REF-001",
    category: "Laptops",
    brand: "Dell",
    images: [
      { url: "https://images-na.ssl-images-amazon.com/images/I/61X6J%2B2%2B9uL._AC_SL1500_.jpg", altText: "Dell Latitude Refurb" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["dell", "refurbished", "budget"]
  },
  {
    name: "MiniPC - Intel NUC-style (Pentium Build)",
    description: "Compact mini PC with Pentium-class CPU, 8GB RAM and 240GB NVMe — ideal for small desks and kiosks.",
    price: 115000,
    discountPrice: 110000,
    countInStock: 9,
    sku: "MINI-NUC-PENT-001",
    category: "Mini PCs",
    brand: "TinyTech",
    images: [
      { url: "https://images.pexels.com/photos/5077046/pexels-photo-5077046.jpeg", altText: "Mini PC NUC style" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["mini-pc", "nuc", "compact"],
    components: [
      { slot: "CPU", name: "Intel Pentium-class", price: 26000 },
      { slot: "RAM", name: "8GB DDR4", price: 12500 },
      { slot: "Storage", name: "240GB NVMe", price: 14500 }
    ]
  },
  {
    name: "Mini PC - Ryzen 3 Compact",
    description: "Compact Ryzen 3 mini PC with 8GB RAM and 240GB SSD — small form factor for office use.",
    price: 135000,
    discountPrice: 128000,
    countInStock: 7,
    sku: "MINI-RYZEN3-001",
    category: "Mini PCs",
    brand: "MiniBuild",
    images: [
      { url: "https://images.pexels.com/photos/5082570/pexels-photo-5082570.jpeg", altText: "Mini PC Ryzen" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["mini-pc", "ryzen", "compact"],
    components: [
      { slot: "CPU", name: "AMD Ryzen 3 class", price: 30000 },
      { slot: "RAM", name: "8GB DDR4", price: 12500 },
      { slot: "Storage", name: "240GB NVMe", price: 14500 }
    ]
  },
  {
    name: "Lenovo All-in-One V50 - 22\" AIO",
    description: "Lenovo V50 AIO — integrated 22\" screen, good for reception desks and classrooms.",
    price: 190000,
    discountPrice: 185000,
    countInStock: 5,
    sku: "AIO-LEN-V50-22",
    category: "All-in-One",
    brand: "Lenovo",
    images: [
      { url: "https://www.lenovo.com/medias/lenovo-aio-v50-22-img.png", altText: "Lenovo V50 AIO 22" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["aio", "lenovo", "office"],
    components: [
      { slot: "CPU", name: "Intel Core i3 class", price: 70000 },
      { slot: "RAM", name: "8GB", price: 12500 },
      { slot: "Storage", name: "256GB SSD", price: 18000 }
    ]
  },
  {
    name: "HomeOffice Desktop - Ryzen 3 / 8GB / 240GB",
    description: "Budget desktop prebuilt for home and small business use — easy to service locally.",
    price: 150000,
    discountPrice: 145000,
    countInStock: 12,
    sku: "DESK-HOME-R3-001",
    category: "Desktops",
    brand: "HomeBuild",
    images: [
      { url: "https://images.pexels.com/photos/5077047/pexels-photo-5077047.jpeg", altText: "HomeOffice Desktop" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["desktop", "home", "office"],
    components: [
      { slot: "CPU", name: "AMD Ryzen 3-class", price: 30000 },
      { slot: "RAM", name: "8GB DDR4", price: 12500 },
      { slot: "Storage", name: "240GB NVMe", price: 14500 },
      { slot: "Case", name: "Budget Mid Tower", price: 7000 },
      { slot: "PSU", name: "Generic 450W", price: 9200 }
    ]
  },
  {
    name: "GameLite Desktop - GTX1650 Prebuilt",
    description: "Entry gaming desktop with GTX 1650, 8GB RAM and 240GB NVMe — balanced for affordable 1080p gaming.",
    price: 285000,
    discountPrice: 275000,
    countInStock: 4,
    sku: "DESK-GAME-GTX1650-001",
    category: "Desktops",
    brand: "GameLite",
    images: [
      { url: "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg", altText: "Entry Gaming Desktop" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["desktop", "gaming"],
    components: [
      { slot: "CPU", name: "Intel Pentium / Ryzen 3 class", price: 26000 },
      { slot: "GPU", name: "GTX 1650 4GB", price: 95000 },
      { slot: "RAM", name: "8GB DDR4", price: 12500 },
      { slot: "Storage", name: "240GB NVMe", price: 14500 },
      { slot: "PSU", name: "Corsair CV450", price: 16000 }
    ]
  },
  {
    name: "Workstation Lite - Small Business Workstation",
    description: "Workstation Lite — quad-core CPU, 16GB RAM, 500GB SSD for light content creation and CAD tasks.",
    price: 300000,
    discountPrice: 290000,
    countInStock: 3,
    sku: "WORK-WKS-LITE-001",
    category: "Workstations",
    brand: "ProLite",
    images: [
      { url: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg", altText: "Workstation Lite" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["workstation", "pro", "content"],
    components: [
      { slot: "CPU", name: "Intel Core i5-equivalent", price: 110000 },
      { slot: "RAM", name: "16GB DDR4", price: 40000 },
      { slot: "Storage", name: "500GB SSD", price: 26000 },
      { slot: "GPU", name: "Optional GTX1650", price: 95000 }
    ]
  },
  {
    name: "Refurb Station - Small Workstation (Refurbished)",
    description: "Refurbished workstation units — tested and suitable for office and light editing workloads.",
    price: 175000,
    discountPrice: 170000,
    countInStock: 5,
    sku: "WORK-REFURB-001",
    category: "Workstations",
    brand: "RefurbCo",
    images: [
      { url: "https://images.pexels.com/photos/1591064/pexels-photo-1591064.jpeg", altText: "Refurbished Workstation" }
    ],
    isPublished: true,
    isPart: false,
    tags: ["workstation", "refurbished"],
    components: [
      { slot: "CPU", name: "Intel Core i3/i5 (refurb)", price: 70000 },
      { slot: "RAM", name: "8-16GB refurbished", price: 18000 },
      { slot: "Storage", name: "240-500GB SSD (refurb)", price: 12000 }
    ]
  },
  {
    name: "Apple MacBook Pro 16-inch M3 Max",
    brand: "Apple",
    category: "Laptops",
    price: 2800000,
    countInStock: 8,
    sku: "MBP16-M3MAX",
    sizes: ["16-inch"],
    colors: ["Space Gray"],
    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp16-spacegray",
        altText: "MacBook Pro 16 M3 Max",
      },
    ],
    description: "Apple M3 Max, 32GB RAM, 1TB SSD, Liquid Retina XDR display.",
  },
  {
    name: "Razer Blade 18 (2024)",
    brand: "Razer",
    category: "Laptops",
    price: 2500000,
    countInStock: 5,
    sku: "RAZER-BLADE18",
    sizes: ["18-inch"],
    colors: ["Black"],
    images: [
      {
        url: "https://assets.razerzone.com/razer-blade-18.jpg",
        altText: "Razer Blade 18 Gaming Laptop",
      },
    ],
    description: "Intel i9-13980HX, RTX 4090, 32GB DDR5 RAM, 2TB SSD, 18-inch QHD+.",
  },
  {
    name: "Alienware x16 R2",
    brand: "Dell",
    category: "Laptops",
    price: 2200000,
    countInStock: 7,
    sku: "ALIENWARE-X16",
    sizes: ["16-inch"],
    colors: ["Silver"],
    images: [
      {
        url: "https://i.dell.com/sites/csimages/Merchandizing_Imagery/all/x16-2024.jpg",
        altText: "Alienware x16 Gaming Laptop",
      },
    ],
    description: "Intel i9-13900H, RTX 4080, 32GB DDR5, 1TB SSD.",
  },
  {
    name: "HP Pavilion 15",
    brand: "HP",
    category: "Laptops",
    price: 350000,
    countInStock: 12,
    sku: "HP-PAV15",
    sizes: ["15-inch"],
    colors: ["Silver"],
    images: [
      {
        url: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c06545452.png",
        altText: "HP Pavilion 15",
      },
    ],
    description: "AMD Ryzen 5, 8GB RAM, 512GB SSD, Windows 11.",
  },
  {
    name: "Beelink SER5 Pro",
    brand: "Beelink",
    category: "Mini PC",
    price: 420000,
    countInStock: 15,
    sku: "BEELINK-SER5",
    sizes: ["Small Form Factor"],
    colors: ["Black"],
    images: [
      {
        url: "https://beelink.com/productimg/ser5pro.jpg",
        altText: "Beelink SER5 Pro Mini PC",
      },
    ],
    description: "AMD Ryzen 7 5800H, 16GB RAM, 512GB NVMe SSD.",
  },
  {
    name: "Custom Build Workstation - Ryzen 9",
    brand: "Custom Build",
    category: "Workstations",
    price: 1600000,
    countInStock: 3,
    sku: "CUSTOM-R9WS",
    sizes: ["Full Tower"],
    colors: ["Black"],
    images: [
      {
        url: "https://nzxt.com/workstation.jpg",
        altText: "Custom Ryzen 9 Workstation",
      },
    ],
    components: [
      { slot: "CPU", name: "AMD Ryzen 9 7950X", price: 600000 },
      { slot: "GPU", name: "NVIDIA RTX 4080", price: 900000 },
      { slot: "RAM", name: "32GB DDR5 6000MHz", price: 200000 },
      { slot: "Storage", name: "2TB NVMe Gen4 SSD", price: 250000 },
    ],
    description: "High performance workstation for rendering and AI workloads.",
  },
  {
    name: "Corsair Vengeance DDR5 32GB (2x16GB)",
    brand: "Corsair",
    category: "Parts",
    isPart: true,
    partType: "RAM",
    price: 120000,
    countInStock: 40,
    sku: "CORSAIR-DDR5-32GB",
    images: [
      {
        url: "https://www.corsair.com/vengeance-ddr5.png",
        altText: "Corsair Vengeance DDR5 RAM",
      },
    ],
    description: "High-performance DDR5 RAM for gaming and content creation.",
  },
  {
    name: "NVIDIA GeForce RTX 4070 Ti SUPER",
    brand: "NVIDIA",
    category: "Parts",
    isPart: true,
    partType: "GPU",
    price: 700000,
    countInStock: 10,
    sku: "NVIDIA-4070TiS",
    images: [
      {
        url: "https://www.nvidia.com/4070ti.png",
        altText: "NVIDIA RTX 4070 Ti SUPER",
      },
    ],
    description: "Next-gen GPU for 1440p and 4K gaming.",
  },
  {
    name: "Samsung 980 PRO 1TB NVMe SSD",
    brand: "Samsung",
    category: "Parts",
    isPart: true,
    partType: "Storage",
    price: 95000,
    countInStock: 25,
    sku: "SAMSUNG-980PRO",
    images: [
      {
        url: "https://images.samsung.com/is/image/samsung/980pro-1tb",
        altText: "Samsung 980 Pro 1TB",
      },
    ],
    description: "High-speed PCIe 4.0 SSD with up to 7,000 MB/s read speeds.",
  },
  {
    name: "Office Mini PC - Intel i3",
    category: "Mini-PC",
    price: 90000,
    currency: "XAF",
    description: "Compact mini desktop ideal for browsing, office apps and light multitasking.",
    image: "/images/products/mini-i3.jpg",
    stock: 12,
    sku: "MINI-I3-001",
    specs: "CPU: Intel i3, RAM: 8GB, Storage: 256GB SSD, GPU: Integrated"
  },
  {
    name: "Budget Laptop - Ryzen 3",
    category: "Laptop",
    price: 95000,
    currency: "XAF",
    description: "Affordable laptop for students and basic office work.",
    image: "/images/products/laptop-ryzen3.jpg",
    stock: 18,
    sku: "LAP-R3-001",
    specs: "CPU: Ryzen 3, RAM: 8GB, Storage: 512GB SSD, Screen: 15.6\""
  },
  {
    name: "Home Desktop - Intel i5",
    category: "Desktop",
    price: 120000,
    currency: "XAF",
    description: "Reliable home desktop with balanced performance for everyday use.",
    image: "/images/products/desktop-i5.jpg",
    stock: 10,
    sku: "DESK-I5-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 512GB SSD, GPU: Integrated"
  },
  {
    name: "Office Tower - Intel i5, 16GB",
    category: "Office",
    price: 140000,
    currency: "XAF",
    description: "Office-ready desktop pre-configured for productivity and multi-tab workflows.",
    image: "/images/products/office-i5-16.jpg",
    stock: 8,
    sku: "OFF-I5-16-001",
    specs: "CPU: Intel i5, RAM: 16GB, Storage: 512GB SSD"
  },
  {
    name: "Gaming Entry - Ryzen 5, GTX 1650",
    category: "Gaming",
    price: 160000,
    currency: "XAF",
    description: "Entry-level gaming desktop capable of 1080p gaming on medium settings.",
    image: "/images/products/gaming-r5-1650.jpg",
    stock: 6,
    sku: "GAM-R5-1650-001",
    specs: "CPU: Ryzen 5, RAM: 16GB, Storage: 512GB SSD, GPU: GTX 1650"
  },
  {
    name: "Slim Laptop - Intel i5, 8GB",
    category: "Laptop",
    price: 155000,
    currency: "XAF",
    description: "Thin and light laptop for professionals on the move.",
    image: "/images/products/slim-i5.jpg",
    stock: 9,
    sku: "SLIM-I5-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 256GB SSD, Screen: 14\""
  },
  {
    name: "Creator Desktop - Ryzen 7, 16GB",
    category: "Workstation",
    price: 195000,
    currency: "XAF",
    description: "Good balance for content creation and photo/video editing on a budget.",
    image: "/images/products/creator-r7.jpg",
    stock: 4,
    sku: "CRT-R7-016-001",
    specs: "CPU: Ryzen 7, RAM: 16GB, Storage: 1TB SSD"
  },
  {
    name: "Gaming Mid - Ryzen 7, RTX 3060",
    category: "Gaming",
    price: 260000,
    currency: "XAF",
    description: "Solid 1080p/1440p gaming build with RTX 3060 for modern titles.",
    image: "/images/products/gaming-r7-3060.jpg",
    stock: 3,
    sku: "GAM-R7-3060-001",
    specs: "CPU: Ryzen 7, RAM: 16GB, Storage: 1TB SSD, GPU: RTX 3060"
  },
  {
    name: "All-in-One - Intel i5, 8GB",
    category: "All-in-One",
    price: 175000,
    currency: "XAF",
    description: "Space-saving all-in-one desktop for reception and office front-desk setups.",
    image: "/images/products/aii-i5.jpg",
    stock: 5,
    sku: "AIO-I5-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 512GB SSD, Screen: 23.8\""
  },
  {
    name: "Work Laptop - Ryzen 5, 16GB",
    category: "Laptop",
    price: 170000,
    currency: "XAF",
    description: "Business laptop with more memory and storage for multitasking.",
    image: "/images/products/work-r5-16.jpg",
    stock: 7,
    sku: "WKP-R5-16-001",
    specs: "CPU: Ryzen 5, RAM: 16GB, Storage: 512GB SSD"
  },
  {
    name: "Performance Desktop - Intel i7, 16GB",
    category: "Desktop",
    price: 220000,
    currency: "XAF",
    description: "High performance desktop for demanding applications and multitasking.",
    image: "/images/products/desktop-i7.jpg",
    stock: 4,
    sku: "DESK-I7-001",
    specs: "CPU: Intel i7, RAM: 16GB, Storage: 1TB SSD"
  },
  {
    name: "Compact Gaming - Ryzen 5, GTX 1660 Super",
    category: "Gaming",
    price: 180000,
    currency: "XAF",
    description: "Compact mid-range gaming PC offering good value for gamers.",
    image: "/images/products/compact-gamer.jpg",
    stock: 5,
    sku: "CGM-R5-1660-001",
    specs: "CPU: Ryzen 5, RAM: 16GB, Storage: 512GB SSD, GPU: GTX 1660 Super"
  },
  {
    name: "Student Laptop - Celeron, 4GB",
    category: "Laptop",
    price: 90000,
    currency: "XAF",
    description: "Very affordable laptop for basic study tasks and web browsing.",
    image: "/images/products/student-celeron.jpg",
    stock: 20,
    sku: "STD-CEL-004-001",
    specs: "CPU: Celeron, RAM: 4GB, Storage: 128GB eMMC, Screen: 14\""
  },
  {
    name: "Enterprise Desktop - Intel Xeon, 32GB",
    category: "Workstation",
    price: 300000,
    currency: "XAF",
    description: "High-end workstation for engineering and heavy compute workloads.",
    image: "/images/products/xeon-32gb.jpg",
    stock: 2,
    sku: "WKS-XEON-32-001",
    specs: "CPU: Intel Xeon, RAM: 32GB, Storage: 2TB SSD"
  },
  {
    name: "Home Theater PC - Ryzen 3, Small Form",
    category: "Mini-PC",
    price: 100000,
    currency: "XAF",
    description: "Small form-factor HTPC for media playback and streaming.",
    image: "/images/products/htpc-r3.jpg",
    stock: 7,
    sku: "HTPC-R3-001",
    specs: "CPU: Ryzen 3, RAM: 8GB, Storage: 512GB SSD, HDMI out"
  },
  {
    name: "Refurbished Desktop - Intel i5",
    category: "Desktop",
    price: 110000,
    currency: "XAF",
    description: "Refurbished but tested desktop suitable for budget buyers.",
    image: "/images/products/refurb-i5.jpg",
    stock: 11,
    sku: "REF-I5-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 256GB SSD"
  },
  {
    name: "Graphic Design Workstation - Ryzen 9, 32GB",
    category: "Workstation",
    price: 285000,
    currency: "XAF",
    description: "Powerful machine for designers and photo/video professionals.",
    image: "/images/products/graphic-r9.jpg",
    stock: 2,
    sku: "GDW-R9-32-001",
    specs: "CPU: Ryzen 9, RAM: 32GB, Storage: 1TB SSD, GPU: RTX 3060"
  },
  {
    name: "Small Office Pack - Dual Monitor Desktop",
    category: "Office",
    price: 130000,
    currency: "XAF",
    description: "Desktop bundle prepared for small office setups with dual monitors.",
    image: "/images/products/office-dual.jpg",
    stock: 6,
    sku: "OFF-DUAL-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 512GB SSD, Includes 2x 22\" monitors"
  },
  {
    name: "Portable Workstation - RTX 3060 Laptop",
    category: "Laptop",
    price: 290000,
    currency: "XAF",
    description: "Portable laptop for on-the-go creative work with dedicated GPU.",
    image: "/images/products/pro-3060.jpg",
    stock: 3,
    sku: "PRO-3060-001",
    specs: "CPU: Intel i7, RAM: 16GB, Storage: 1TB SSD, GPU: RTX 3060"
  },
  {
    name: "Entry All-Rounder Desktop - Ryzen 5, 8GB",
    category: "Desktop",
    price: 125000,
    currency: "XAF",
    description: "Good all-round desktop for families and light gaming.",
    image: "/images/products/allround-r5.jpg",
    stock: 9,
    sku: "AR-R5-001",
    specs: "CPU: Ryzen 5, RAM: 8GB, Storage: 512GB SSD"
  },
  {
    name: "Budget Gaming Laptop - GTX 1650",
    category: "Laptop",
    price: 190000,
    currency: "XAF",
    description: "Affordable gaming laptop for casual gamers in Cameroon.",
    image: "/images/products/gaming-lap-1650.jpg",
    stock: 4,
    sku: "GLAP-1650-001",
    specs: "CPU: Intel i5, RAM: 8GB, Storage: 512GB SSD, GPU: GTX 1650"
  },
  {
    name: "Reliable Office Desktop - Ryzen 3, 8GB",
    category: "Office",
    price: 95000,
    currency: "XAF",
    description: "Simple desktop for clerical tasks and internet kiosks.",
    image: "/images/products/office-r3.jpg",
    stock: 14,
    sku: "OFF-R3-001",
    specs: "CPU: Ryzen 3, RAM: 8GB, Storage: 256GB SSD"
  }
];

module.exports = products;
