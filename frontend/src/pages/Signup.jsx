import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const res = await axios.post("/api/auth/signup", formData);
  
      if (res.data.status) {
        // Signup succeeded
        alert("Signup successful. Please log in.");
        navigate("/login");
      } else {
        // Something odd in response
        setError(res.data.msg || "Signup failed");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-[#1e1e1e] text-white border border-gray-700 rounded-md shadow-md">
      <h2 className="text-xl mb-6 text-center">Signup</h2>

      <div className="mb-4">
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange}
          className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded mt-1" required />
      </div>

      <div className="mb-4">
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange}
          className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded mt-1" required />
      </div>

      <div className="mb-4">
        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange}
          className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded mt-1" required />
      </div>

      <div className="mb-4">
        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}
          className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded mt-1">
          <option value="Member">Member</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button type="submit" className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700">Signup</button>
    </form>
  );
};

export default SignupForm;
