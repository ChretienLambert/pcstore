import cheappc2 from "../../assets/cheappc2.jpg"
const FeaturedHomePc = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 items-center overflow-hidden">
          
          {/* Left side - Text */}
          <div className="p-8">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Reliable & Affordable
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Affordable PCs for your everyday work
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover high-quality, budget-friendly used computers designed 
              to keep you productive. Perfect for work, study, and home use — 
              all at unbeatable prices.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
              Shop PCs Now
            </button>
          </div>
          

        {/* Right side - Image */}
        <div className="flex justify-center">
          <img 
            src={cheappc2}
            alt="Affordable used PCs for work" 
            className="w-full h-full object-cover "
          />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedHomePc
