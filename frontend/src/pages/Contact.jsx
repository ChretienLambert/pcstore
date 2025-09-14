import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // For now we only validate and show success — wire backend endpoint if available
    if (!form.name || !form.email || !form.message) {
      setStatus({ ok: false, msg: "Please complete all fields" });
      return;
    }
    setStatus({ ok: true, msg: "Thanks — we received your message. We'll be in touch." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded card">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-4">Questions? Send us a message and we'll reply as soon as possible.</p>

      {status && (
        <div className={`mb-4 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="input w-full" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Your email" className="input w-full" />
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" rows={6} className="input w-full" />
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Send Message</button>
        </div>
      </form>
    </div>
  );
};

export default Contact;