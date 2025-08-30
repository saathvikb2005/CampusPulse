import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    regNo: "",
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label htmlFor="regNo">Registration No.</label>
        <input
          type="text"
          id="regNo"
          name="regNo"
          placeholder="Enter registration number"
          value={formData.regNo}
          onChange={handleChange}
          required
        />

        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="regEmail">Email</label>
        <input
          type="email"
          id="regEmail"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="regPassword">Password</label>
        <input
          type="password"
          id="regPassword"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="super-admin">Super Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
