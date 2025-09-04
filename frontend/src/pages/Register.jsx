import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import register from "../assets/register.jpg"
import { registerUser } from "../redux/slices/authSlice";
import {useDispatch} from "react-redux"

export default function Register() {
  const [name, setName]=useState("")  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch=useDispatch()
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("User Registered: ", {name,email,password})
    dispatch(registerUser({name,email,password}))

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }



   
    alert("Registration successful! Please login.");
    
  };

  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#5C5CFF] text-white px-8">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Create your account</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                type="name"
                className="w-full px-4 py-2 rounded-lg text-black bg-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg text-black bg-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg text-black bg-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg text-black bg-white border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-blue-300 hover:underline">
                  Login
                </Link>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2   bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
            >
              Register
            </button>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:block w-1/2">
        <img
          src={register}
          alt="Register Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
