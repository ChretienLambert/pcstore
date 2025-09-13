import { Link } from "react-router-dom";
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";
import { FiPhoneCall } from "react-icons/fi";
import { useState } from "react";
import axios from "axios";
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return setStatus({ ok: false, msg: "Email required" });
    try {
      const res = await axios.post(`${BACKEND}/api/subscribe`, { email });
      setStatus({ ok: true, msg: res.data.message || "Subscribed" });
      setEmail("");
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.message || err.message });
    }
  };
  return (
    <footer className="border-t py-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6">
        {/* Newsletter */}
        <div className="md:text-center">
          <h3 className="text-lg text-black mb-4">Newsletter</h3>
          <p className="text-gray-500 mb-4">
            Subscribe and be the first to hear about new products
          </p>
          <p className="font-medium text-sm text-gray-600 mb-2">Sign up</p>

          <form onSubmit={handleSubscribe} className="flex md:justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your e-mail"
              className="p-3 w-full md:w-64 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
            <button
              type="submit"
              className="bg-[#5C5CFF] text-white rounded-r-md hover:bg-blue-500 text-sm transition-all py-3 px-6"
            >
              Subscribe
            </button>
          </form>
          {status && (
            <p className={`mt-2 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
              {status.msg}
            </p>
          )}
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg text-black mb-4">Shop</h3>
          <ul className="space-y-2 text-gray-500">
            <li>
              <Link to="#" className="hover:text-blue-500 transition-colors">
                PC
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition-colors">
                MACBOOK
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-lg text-black mb-4">Support</h3>
          <ul className="space-y-2 text-gray-500">
            <li>
              <Link to="#" className="hover:text-blue-500 transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition-colors">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-lg text-black mb-4">Follow Us</h3>
          <div className="flex items-center space-x-5 mb-4">
            <a href="#" className="hover:text-blue-500">
              <TbBrandMeta className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-pink-500">
              <IoLogoInstagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-black">
              <RiTwitterXLine className="h-5 w-5" />
            </a>
          </div>
          <p className="text-black">Call Us</p>
          <p>
            <FiPhoneCall className="inline-block mr-2" />
            691299594
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="container mx-auto mt-12 px-6 border-t border-gray-200 pt-6">
        <p className="text-gray-500 text-sm tracking-tighter text-center">
          © IT & DIGITAL MINDS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
