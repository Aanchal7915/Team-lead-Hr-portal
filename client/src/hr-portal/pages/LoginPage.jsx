

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import logo from "../assets/logo.jpg";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTagwordIndex, setCurrentTagwordIndex] = useState(0);
  const tagwords = ['Teams', 'People', 'Workforce', 'Talent'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagwordIndex((prev) => (prev + 1) % tagwords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const deviceInfo = role === 'employee' ? navigator.userAgent : undefined;
      await login(email, password, role, deviceInfo);
      navigate(role === 'hr' ? '/hr/dashboard' : '/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-fit md:min-h-screen bg-[#fff5e6] md:bg-gradient-to-br md:from-[#fff5e6] md:via-[#f5e6d3] md:to-[#8a6144] flex justify-center items-start md:items-center p-0 md:p-4 pb-0 md:pb-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-b-[2rem] md:rounded-3xl shadow-2xl overflow-hidden md:overflow-visible animate-fade-in-down relative">

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
              Strengthening
              <span key={currentTagwordIndex} className="text-[#FFFDDD] inline-block animate-fade-in-up">
                {tagwords[currentTagwordIndex]}
              </span>
              for Success
            </p>

            <p className="text-white/80 text-[10px] md:text-sm mb-8 max-w-md leading-relaxed">
              Empowering your workforce with a seamless, precise, and premium human resource experience. Manage attendance, leaves, and performance efficiently.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3 animate-slide-in-left">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Employee Management</span>
              </div>

              <div className="flex items-center justify-center space-x-3 animate-slide-in-left delay-100">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Attendance Tracking</span>
              </div>

              <div className="flex items-center justify-center space-x-3 animate-slide-in-left delay-200">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-medium">Performance Analytics</span>
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
            onClick={() => navigate('/register')}
            className="w-16 h-16 bg-gradient-to-br from-[#b8866f] to-[#8a6144] rounded-full shadow-xl flex items-center justify-center border-4 border-white cursor-pointer hover:scale-110 transition-transform duration-300"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#fff5e6] to-[#f5e6d3] p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/40 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-[#8a6144]/30 shadow-lg overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide">Welcome Back!</h2>
              {/* Decorative Underline */}
              <div className="h-1 w-16 bg-[#8a6144] mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600">Sign in to continue</p>
            </div>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}

            <div className="mb-5 flex justify-center border border-gray-300 rounded-md p-1 bg-white">
              {['employee', 'hr'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`w-1/2 py-2 transition duration-300 rounded-md text-sm font-medium ${role === r ? 'bg-[#8a6144] text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {r === 'employee' ? 'Employee' : 'HR Admin'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-[#8a6144] hover:underline transition">Forgot password?</Link>
              </div>
              <Button type="submit" variant="custom" className="w-full bg-[#8a6144] text-white hover:bg-[#6b4d36] hover:scale-[1.02] transition-transform shadow-lg" disabled={loading}>
                {loading ? <Spinner /> : 'Login'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4 md:mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#8a6144] hover:underline">Register here</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
