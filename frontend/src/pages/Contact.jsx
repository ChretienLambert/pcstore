import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiMessageSquare, FiSend } from "react-icons/fi";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ ok: false, msg: "Please complete all fields" });
      return;
    }
    setStatus({ ok: true, msg: "Thanks — we received your message. We'll be in touch." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Get in Touch</h1>
        <p className="text-gray-600 mb-6">Have questions? Drop us a message, and we'll respond promptly!</p>

        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${
              status.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {status.ok ? (
              <FiMessageSquare className="h-5 w-5" />
            ) : (
              <FiMessageSquare className="h-5 w-5" />
            )}
            {status.msg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-gray-400 h-5 w-5" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400 h-5 w-5" />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              type="email"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <FiMessageSquare className="absolute top-3 left-3 text-gray-400 h-5 w-5" />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={5}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiSend className="h-5 w-5" />
              Send Message
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;