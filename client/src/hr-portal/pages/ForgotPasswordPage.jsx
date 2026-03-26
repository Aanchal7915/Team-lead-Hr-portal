import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import useAuth from '../hooks/useAuth.jsx';
import Spinner from '../components/Spinner.jsx';
import logo from "../assets/logo.jpg";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentTagwordIndex, setCurrentTagwordIndex] = useState(0);
    const tagwords = ['Recovery', 'Access', 'Restoration', 'Solution'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTagwordIndex((prev) => (prev + 1) % tagwords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();


    // Step 1: Request the OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
        setLoading(false);
    };

    // Step 2: Submit OTP and new password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await resetPassword(email, otp, password);
            setMessage(data.message + " You can now log in with your new password.");
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        }
        setLoading(false);
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
                        {/* Heading with Animation */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide flex items-center justify-center gap-3 h-16">
                            <span className="animate-fade-in-down text-white">HR</span>
                            <span className="text-[#FFFDDD] animate-fade-in-up">PORTAL</span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-white/90 text-[11px] md:text-base mb-6 font-medium flex items-center justify-center gap-1.5">
                            Secure Account
                            <span key={currentTagwordIndex} className="text-[#FFFDDD] inline-block animate-fade-in-up">
                                {tagwords[currentTagwordIndex]}
                            </span>
                        </p>

                        {/* Description */}
                        <p className="text-white/80 text-[10px] md:text-sm mb-8 max-w-md leading-relaxed">
                            Forgot your password? No worries. Request a secure OTP to reset your password and quickly regain access to your HR dashboard.
                        </p>

                        {/* Feature Highlights */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-center space-x-3 animate-slide-in-left">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-white/90 text-sm font-medium">Verified Security</span>
                            </div>

                            <div className="flex items-center justify-center space-x-3 animate-slide-in-left delay-100">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-white/90 text-sm font-medium">Instant Access</span>
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
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide">Reset Password</h2>
                            {/* Decorative Underline */}
                            <div className="h-1 w-16 bg-[#8a6144] mx-auto rounded-full mb-4"></div>
                            <p className="text-gray-600">Enter your details to reset your password</p>
                        </div>

                        {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">{message}</p>}
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}

                        {!otpSent ? (
                            // --- View 1: Email Form ---
                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <p className="text-center text-sm text-gray-600 mb-4">Enter your email to receive a password reset OTP.</p>
                                <Input id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <Button type="submit" variant="custom" className="w-full bg-[#8a6144] text-white hover:bg-[#6b4d36] hover:scale-[1.02] transition-transform shadow-lg" disabled={loading}>
                                    {loading ? <Spinner /> : 'Send OTP'}
                                </Button>
                            </form>
                        ) : (
                            // --- View 2: OTP and New Password Form ---
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <Input id="otp" label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                <Input id="password" label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <Button type="submit" variant="custom" className="w-full bg-[#8a6144] text-white hover:bg-[#6b4d36] hover:scale-[1.02] transition-transform shadow-lg" disabled={loading}>
                                    {loading ? <Spinner /> : 'Reset Password'}
                                </Button>
                            </form>
                        )}

                        <div className="mt-4 md:mt-6 text-center">
                            <Link to="/login" className="text-sm font-medium text-[#8a6144] hover:underline">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ForgotPasswordPage;
