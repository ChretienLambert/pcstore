import React from "react";

const FAQ = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white card">
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>
      <div className="space-y-4 text-gray-700">
        <div>
          <h3 className="font-semibold">Shipping</h3>
          <p>We ship across Cameroon. Delivery times and rates depend on your location.</p>
        </div>
        <div>
          <h3 className="font-semibold">Returns</h3>
          <p>Contact us within 7 days for returns/exchanges (subject to terms).</p>
        </div>
        <div>
          <h3 className="font-semibold">Payments</h3>
          <p>We currently support cash on delivery and card payments (card via partner gateway).</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;