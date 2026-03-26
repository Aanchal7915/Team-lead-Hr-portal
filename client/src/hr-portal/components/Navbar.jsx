
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import api from '../api/api.js';
import logo from "../assets/logo.jpg";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [hasUnread, setHasUnread] = useState(false);
    const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    // Helper class for mobile links to match desktop style
    const mobileNavLinkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${isActive ? 'bg-[#8a6144] text-white' : isScrolled ? 'text-[#8a6144] hover:bg-[#8a6144] hover:text-white' : 'text-white hover:bg-white/10'}`;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchNavData = async () => {
            setProfile(null);
            setHasUnread(false);
            setPendingLeavesCount(0);
            if (user && user.role === 'employee') {
                try {
                    const [profileRes, announcementsRes] = await Promise.all([
                        api.get('/employee/profile'),
                        api.get('/employee/announcements'),
                    ]);
                    setProfile(profileRes.data);
                    setHasUnread(announcementsRes.data.some((ann) => !ann.isRead));
                } catch (error) {
                    console.error("Navbar could not fetch data");
                }
            } else if (user && user.role === 'hr') {
                try {
                    const { data } = await api.get('/hr/leaves/pending');
                    setPendingLeavesCount(data.length);
                } catch (error) {
                    console.error("Navbar could not fetch HR data");
                }
            }
        };
        fetchNavData();
    }, [user, location.pathname]);

    const navLinkClass = ({ isActive }) =>
        `px-1.5 lg:px-2 xl:px-4 py-2 text-[10px] lg:text-xs xl:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-300 ${isActive ? 'font-extrabold underline underline-offset-4' : 'font-medium'} ${isScrolled ? 'text-[#8a6144] hover:text-[#6b4d36]' : 'text-white hover:text-[#b8866f]'}`;

    const handleLinkClick = () => setMobileMenuOpen(false);

    const buttonStyle = `px-2 lg:px-4 xl:px-6 py-2 text-[10px] lg:text-xs xl:text-sm rounded-full transition-all duration-300 font-bold border-2 border-[#b8866f] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${isScrolled ? 'bg-[#8a6144] text-white hover:bg-[#6b4d36]' : 'bg-[#fff5e6] text-black hover:bg-[#fff9f0]'
        }`;

    return (
        <nav className={`shadow-md fixed top-0 left-0 w-full z-50 font-sans animate-fade-in-down transition-colors duration-300 ${isScrolled ? 'bg-[#fff5e6]' : 'bg-[#433020]'
            }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 lg:gap-3 transition flex-shrink-0">
                        <img src={logo} alt="Avani Enterprises Logo" className="h-10 md:h-12 w-auto rounded-lg" />
                        <div className="flex flex-row items-center gap-1.5 md:gap-2 leading-none whitespace-nowrap">
                            <span className={`text-sm md:text-lg xl:text-xl font-black tracking-tight xl:tracking-[0.1em] uppercase transition-colors duration-300 ${isScrolled ? 'text-[#8a6144]' : 'text-white'}`}>AVANI</span>
                            <span className={`text-sm md:text-lg xl:text-xl font-black tracking-tight xl:tracking-[0.1em] uppercase transition-colors duration-300 ${isScrolled ? 'text-[#8a6144]' : 'text-[#fff5e6]'}`}>ENTERPRISES</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className={`hidden ${user?.role === 'hr' ? '' : 'md:flex'} space-x-1 lg:space-x-2 xl:space-x-3 items-center ml-2 lg:ml-4 xl:ml-8 overflow-x-auto no-scrollbar scroll-smooth`}>
                        {user ? (
                            <>
                                {user.role === 'hr' && (
                                    <>
                                        <NavLink to="/hr/dashboard" className={navLinkClass}>Dashboard</NavLink>
                                        <NavLink to="/hr/approve-leave" className={navLinkClass}>
                                            <span className="relative">
                                                <span className="hidden xl:inline">Approve Leave</span>
                                                <span className="xl:hidden">Leaves</span>
                                                {pendingLeavesCount > 0 && (
                                                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                                                )}
                                            </span>
                                        </NavLink>
                                        <NavLink to="/hr/analytics" className={navLinkClass}>Analytics</NavLink>
                                        <NavLink to="/hr/rankings" className={navLinkClass}>Rankings</NavLink>
                                        <NavLink to="/hr/manage-employees" className={navLinkClass}>
                                            <span className="hidden xl:inline">Manage Emp.</span>
                                            <span className="xl:hidden">Employees</span>
                                        </NavLink>
                                        <NavLink to="/hr/salary-calculator" className={navLinkClass}>
                                            <span className="hidden xl:inline">Salary Calculator</span>
                                            <span className="xl:hidden">Salary</span>
                                        </NavLink>
                                        <NavLink to="/hr/eod-reports" className={navLinkClass}>
                                            <span className="hidden xl:inline">EOD Reports</span>
                                            <span className="xl:hidden">EOD</span>
                                        </NavLink>
                                        <NavLink to="/hr/announcements" className={navLinkClass}>Announcements</NavLink>
                                        <NavLink to="/hr/penalties" className={navLinkClass}>
                                            <span className="hidden xl:inline">Mobile Logins</span>
                                            <span className="xl:hidden">Mobile</span>
                                        </NavLink>
                                        <NavLink to="/hr/salary-slips" className={navLinkClass}>
                                            <span className="hidden xl:inline">Salary Slips</span>
                                            <span className="xl:hidden">Slips</span>
                                        </NavLink>
                                    </>
                                )}

                                {user.role === 'employee' && (
                                    <>
                                        <NavLink to="/employee/dashboard" className={navLinkClass}>Dashboard</NavLink>
                                        <NavLink to="/employee/rankings" className={navLinkClass}>Rankings</NavLink>
                                        <NavLink to="/employee/apply-leave" className={navLinkClass}>Apply for Leave</NavLink>
                                        <NavLink to="/employee/announcements" className={navLinkClass}>
                                            <span className="relative">
                                                Announcements
                                                {hasUnread && (
                                                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                                                )}
                                            </span>
                                        </NavLink>
                                        <NavLink to="/employee/salary-slips" className={navLinkClass}>
                                            <span className="hidden xl:inline">Salary Slips</span>
                                            <span className="xl:hidden">Slips</span>
                                        </NavLink>
                                    </>
                                )}

                                <button onClick={logout} className={`${buttonStyle} flex-shrink-0`}>
                                    Logout
                                </button>

                                {user.role === 'employee' && (
                                    <Link to="/employee/profile">
                                        <img src={profile?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Profile" className="w-10 h-10 rounded-full object-cover ml-4 border-2 border-[#b8866f] hover:scale-105 transition" />
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={buttonStyle}>Login</NavLink>
                                <NavLink to="/register" className={buttonStyle}>Register</NavLink>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className={`flex items-center ${user?.role === 'hr' ? '' : 'md:hidden'}`}>
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 focus:outline-none transition-colors duration-300 ${isScrolled ? 'text-[#8a6144]' : 'text-[#fff5e6]'}`}>
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={`bg-white shadow-md transition-all duration-300 ${user?.role === 'hr' ? '' : 'md:hidden'}`}>
                    <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isScrolled ? 'bg-[#fff5e6]' : 'bg-[#433020]'}`}>
                        {user ? (
                            <>
                                {user.role === 'hr' && (
                                    <>
                                        <NavLink to="/hr/dashboard" onClick={handleLinkClick} className={mobileNavLinkClass}>Dashboard</NavLink>
                                        <NavLink to="/hr/approve-leave" onClick={handleLinkClick} className={mobileNavLinkClass}>
                                            Approve Leave {pendingLeavesCount > 0 && <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">{pendingLeavesCount}</span>}
                                        </NavLink>
                                        <NavLink to="/hr/analytics" onClick={handleLinkClick} className={mobileNavLinkClass}>Analytics</NavLink>
                                        <NavLink to="/hr/rankings" onClick={handleLinkClick} className={mobileNavLinkClass}>Rankings</NavLink>
                                        <NavLink to="/hr/manage-employees" onClick={handleLinkClick} className={mobileNavLinkClass}>Manage Emp.</NavLink>
                                        <NavLink to="/hr/salary-calculator" onClick={handleLinkClick} className={mobileNavLinkClass}>Salary Calculator</NavLink>
                                        <NavLink to="/hr/eod-reports" onClick={handleLinkClick} className={mobileNavLinkClass}>EOD Reports</NavLink>
                                        <NavLink to="/hr/announcements" onClick={handleLinkClick} className={mobileNavLinkClass}>Announcements</NavLink>
                                        <NavLink to="/hr/penalties" onClick={handleLinkClick} className={mobileNavLinkClass}>Mobile Logins</NavLink>
                                        <NavLink to="/hr/salary-slips" onClick={handleLinkClick} className={mobileNavLinkClass}>Salary Slips</NavLink>
                                    </>
                                )}
                                {user.role === 'employee' && (
                                    <>
                                        <NavLink to="/employee/dashboard" onClick={handleLinkClick} className={mobileNavLinkClass}>Dashboard</NavLink>
                                        <NavLink to="/employee/rankings" onClick={handleLinkClick} className={mobileNavLinkClass}>Rankings</NavLink>
                                        <NavLink to="/employee/apply-leave" onClick={handleLinkClick} className={mobileNavLinkClass}>Apply for Leave</NavLink>
                                        <NavLink to="/employee/announcements" onClick={handleLinkClick} className={mobileNavLinkClass}>
                                            Announcements {hasUnread && <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">New</span>}
                                        </NavLink>
                                        <NavLink to="/employee/salary-slips" onClick={handleLinkClick} className={mobileNavLinkClass}>Salary Slips</NavLink>
                                        <NavLink to="/employee/profile" onClick={handleLinkClick} className={mobileNavLinkClass}>Profile</NavLink>
                                    </>
                                )}
                                <div className="pt-4 pb-3 border-t border-gray-700">
                                    <div className="flex items-center px-5 mb-3">
                                        <div className="flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full object-cover border-2 border-[#b8866f]" src={profile?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <div className={`text-base font-medium leading-none ${isScrolled ? 'text-[#433020]' : 'text-white'}`}>{user.name}</div>
                                            <div className={`text-sm font-medium leading-none mt-1 ${isScrolled ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => { logout(); handleLinkClick(); }} className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${isScrolled ? 'text-[#8a6144] hover:bg-[#8a6144] hover:text-white' : 'text-white hover:bg-white/10'}`}>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" onClick={handleLinkClick} className={mobileNavLinkClass}>Login</NavLink>
                                <NavLink to="/register" onClick={handleLinkClick} className={mobileNavLinkClass}>Register</NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
