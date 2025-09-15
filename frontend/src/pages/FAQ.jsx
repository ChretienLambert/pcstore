import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const faqs = [
    {
      question: "Shipping",
      answer: "We ship across Cameroon. Delivery times and rates depend on your location.",
    },
    {
      question: "Returns",
      answer: "Contact us within 7 days for returns/exchanges (subject to terms).",
    },
    {
      question: "Payments",
      answer: "We currently support cash on delivery and card payments (card via partner gateway).",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border-b border-gray-200"
              initial={false}
              animate={{ backgroundColor: activeIndex === index ? "#f3f4f6" : "#ffffff" }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="w-full flex justify-between items-center py-4 text-left"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                {activeIndex === index ? (
                  <FiChevronUp className="h-6 w-6 text-blue-600" />
                ) : (
                  <FiChevronDown className="h-6 w-6 text-gray-500" />
                )}
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 pb-4">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQ;

