

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import logo from "../assets/logo.jpg";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', otherDepartment: '', phone: '', address: '', dob: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentTagwordIndex, setCurrentTagwordIndex] = useState(0);
  const tagwords = ['Journey', 'Career', 'Future', 'Growth'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagwordIndex((prev) => (prev + 1) % tagwords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const { requestRegistrationOtp, verifyAndRegister } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const registrationData = {
        ...formData,
        department: formData.department === 'Other' ? formData.otherDepartment : formData.department,
      };
      const data = await requestRegistrationOtp(registrationData);
      setMessage(data.message);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyAndRegister(formData.email, otp);
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fff5e6] md:bg-gradient-to-br md:from-[#fff5e6] md:via-[#f5e6d3] md:to-[#8a6144] flex justify-center items-start md:items-center p-0 md:p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-b-[2.5rem] md:rounded-3xl shadow-2xl overflow-hidden md:overflow-visible animate-fade-in-down relative">

        {/* Left Panel - Branding Content */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#8a6144] to-[#6b4d36] p-12 flex-col justify-center items-center text-white relative" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 20%, 100% 40%, 95% 60%, 100% 80%, 95% 100%, 0 100%)' }}>
          <div className="text-center z-10">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Heading with Animation */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide flex items-center justify-center gap-3 h-16">
              <span className="animate-fade-in-down text-white">HR</span>
              <span className="text-[#FFFDDD] animate-fade-in-up">PORTAL</span>
            </h1>

            {/* Tagline */}
            <p className="text-white/90 text-[11px] md:text-base mb-6 font-medium flex items-center justify-center gap-1.5">
              Start Your
              <span key={currentTagwordIndex} className="text-[#FFFDDD] inline-block animate-fade-in-up">
                {tagwords[currentTagwordIndex]}
              </span>
              With Us
            </p>

            <div className="text-white/80 text-[10px] md:text-sm mb-8 max-w-md leading-relaxed text-center space-y-4">
              <p>
                Experience a unified digital ecosystem designed to bridge the gap between management and employees. Track your daily operations and grow with us.
              </p>
              <p className="hidden md:block">
                Manage your daily tasks, track attendance, apply for leaves, and view your performance reports - all from a single dashboard designed for your growth.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3 animate-slide-in-left">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Quick & Easy Registration</span>
              </div>

              <div className="flex items-center justify-center space-x-3 animate-slide-in-left delay-100">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Secure Profile Management</span>
              </div>

              <div className="flex items-center justify-center space-x-3 animate-slide-in-left delay-200">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Track Your Career Growth</span>
              </div>
            </div>


          </div>

          {/* Background decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div
            onClick={() => navigate('/login')}
            className="w-16 h-16 bg-gradient-to-br from-[#b8866f] to-[#8a6144] rounded-full shadow-xl flex items-center justify-center border-4 border-white cursor-pointer hover:scale-110 transition-transform duration-300"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#fff5e6] to-[#f5e6d3] p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/40 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-[#8a6144]/30 shadow-lg overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide">
                {!otpSent ? 'Create Account' : 'Verify Email'}
              </h2>
              {/* Decorative Underline */}
              <div className="h-1 w-16 bg-[#8a6144] mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600">
                {!otpSent ? 'Fill in your details to get started' : 'Enter the OTP sent to your email'}
              </p>
            </div>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">{message}</p>}

            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <Input id="name" name="name" label="Full Name" value={formData.name} onChange={handleChange} required />
                <Input id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-[#8a6144] focus:border-[#8a6144]"
                  >
                    <option value="">Select Department</option>
                    <option value="Technology">Technology</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="TeamLeadIT">TeamLeadIT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formData.department === 'Other' && (
                  <Input id="otherDepartment" name="otherDepartment" label="Please specify" value={formData.otherDepartment} onChange={handleChange} required />
                )}

                <Input id="phone" name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} />
                <Input id="address" name="address" label="Address" value={formData.address} onChange={handleChange} />
                <Input id="dob" name="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} />
                <Input id="password" name="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />
                <Input id="confirmPassword" name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} required />

                <Button type="submit" variant="custom" className="w-full bg-[#8a6144] text-white hover:bg-[#6b4d36] hover:scale-[1.02] transition-transform shadow-lg" disabled={loading}>
                  {loading ? <Spinner /> : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input id="otp" name="otp" label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <Button type="submit" variant="custom" className="w-full bg-[#8a6144] text-white hover:bg-[#6b4d36] hover:scale-[1.02] transition-transform shadow-lg" disabled={loading}>
                  {loading ? <Spinner /> : 'Verify & Register'}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#8a6144] hover:underline">Login here</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
