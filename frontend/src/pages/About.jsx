export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Content Section */}
        <div className="w-full bg-white p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              About Us
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Discover our story and why we're passionate about delivering the best shopping experience.
            </p>
            <div className="space-y-6 text-gray-700">
              <p>
                Welcome to our platform, where we strive to make your shopping journey seamless and enjoyable. Our mission is to provide high-quality products, exceptional customer service, and a user-friendly experience that keeps you coming back.
              </p>
              <p>
                Founded with a vision to revolutionize e-commerce, we combine cutting-edge technology with a customer-centric approach. Whether you're browsing for the latest trends or everyday essentials, we're here to cater to your needs with a diverse range of products and unbeatable value.
              </p>
              <p>
                Join our community today and experience shopping like never before. Thank you for choosing us!
              </p>
            </div>
            <div className="mt-8 text-center">
              <a
                href="/"
                className="inline-block py-3 px-6 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}