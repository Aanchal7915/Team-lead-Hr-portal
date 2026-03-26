// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, LabelList
} from 'recharts';
import logo from '../assets/logo.jpg';

const HomePage = () => {
  const { user } = useAuth();
  const [isGraphVisible, setIsGraphVisible] = React.useState(false);


  const attendanceData = [
    { name: 'Mon', value: 82 },
    { name: 'Tue', value: 94 },
    { name: 'Wed', value: 88 },
    { name: 'Thu', value: 96 },
    { name: 'Fri', value: 91 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 89 },
  ];

  const recordStats = [
    { name: 'Attendance', value: 95, color: '#a855f7' }, // Purple
    { name: 'Leaves', value: 88, color: '#10b981' },    // Emerald
    { name: 'Accuracy', value: 92, color: '#f43f5e' },  // Rose
    { name: 'Retention', value: 85, color: '#f59e0b' }, // Amber
    { name: 'Success', value: 78, color: '#00a8e1' },   // Blue
    { name: 'Docs', value: 100, color: '#433020' },     // Brown
  ];

  const workFlowData = [
    { name: 'Tech Team', value: 450 },
    { name: 'Sales Ops', value: 300 },
    { name: 'Operations', value: 250 },
  ];

  const COLORS = ['#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

  // Button style matching the Navbar Login/Register buttons
  const buttonStyle = `inline-block px-8 py-3 text-base rounded-full transition-all duration-300 font-bold border-2 border-[#b8866f] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 bg-[#8a6144] text-white hover:bg-[#6b4d36] dark:bg-[#7a553a] dark:text-white dark:border-gray-600 dark:hover:bg-[#6b4d36]`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center items-center py-12 md:py-20 px-4 transition-colors duration-300 overflow-x-hidden">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto space-y-6"
      >
        <img src={logo} alt="Avani Enterprises Logo" className="h-24 w-auto mx-auto rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300" />
        <span className="inline-block py-1 px-3 rounded-full bg-[#8a6144]/10 text-[#8a6144] dark:text-[#d4a081] text-sm font-bold tracking-wider mb-4 border border-[#8a6144]/20">
          NEXT-GEN HR MANAGEMENT
        </span>
        <h1 className="text-3xl md:text-7xl font-extrabold text-[#433020] dark:text-gray-100 tracking-tight leading-tight drop-shadow-lg">
          <div className="mb-4">
            {"Welcome to ".split("").map((char, index) => (
              <motion.span
                key={`w-${index}`}
                initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.03,
                  ease: [0.2, 0.65, 0.3, 0.9]
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          <div className="relative inline-block">
            {"AVANI ENTERPRISES".split("").map((char, index) => (
              <motion.span
                key={`a-${index}`}
                initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 1,
                  delay: 0.5 + index * 0.04,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className={`inline-block ${index < 5 ? 'text-[#8a6144]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#8a6144] to-[#433020] dark:from-[#d4a081] dark:to-white'}`}
                style={{
                  textShadow: index < 5 ? "0 0 20px rgba(138, 97, 68, 0.2)" : "none"
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            {/* Subtle Glint Effect Overlay */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2,
                delay: 2,
                repeat: Infinity,
                repeatDelay: 4
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />
          </div>
        </h1>
        <p className="text-lg md:text-xl text-[#6b4d36] dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
          Empowering your workforce with a seamless, precise, and premium human resource experience. Manage attendance, leaves, and performance efficiently.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {user ? (
            <Link to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} className={buttonStyle}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonStyle}>
                Login
              </Link>
              <Link to="/register" className={buttonStyle}>
                Register
              </Link>
            </>
          )}
        </div>
      </motion.div>


      {/* Interactive Graph Section: How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onViewportEnter={() => setIsGraphVisible(true)}
        transition={{ duration: 0.8 }}
        className="mt-16 md:mt-24 w-full max-w-6xl px-4"
      >
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[#8a6144] dark:text-[#d4a081] font-bold tracking-widest text-sm uppercase">Visualization</span>
          <h2 className="text-2xl md:text-5xl font-extrabold text-[#433020] dark:text-gray-100 mt-2">How We Track & Manage</h2>
          <p className="mt-4 text-[#6b3d36] dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Our portal uses advanced data analytics to provide a transparent and real-time view of your workforce ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Attendance Tracking Graph */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
            className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-4 md:p-8 rounded-[2.5rem] border border-white/50 dark:border-gray-700 shadow-xl transition-colors duration-300"
          >
            <h3 className="text-xl font-bold text-[#433020] mb-1">
              Attendance Trends
            </h3>
            <p className="text-xs text-[#6b4d36] mb-6">Real-time monitoring of daily check-ins and punctuality metrics across all departments.</p>
            <div className="h-[200px] w-full">
              {isGraphVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Rate']}
                      contentStyle={{ backgroundColor: '#4c1d95', border: 'none', borderRadius: '10px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVal)"
                      fill="url(#colorVal)"
                      animationDuration={2000}
                    >
                      <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fill: '#a855f7', fontWeight: 'bold' }} offset={10} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="mt-4 text-sm text-[#6b4d36] italic">"Capturing 100% accurate geo-tagged presence data weekly."</p>
          </motion.div>

          {/* Record Distribution Graph */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
            className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-4 md:p-8 rounded-[2.5rem] border border-white/50 dark:border-gray-700 shadow-xl transition-colors duration-300"
          >
            <h3 className="text-xl font-bold text-[#433020] mb-1">
              Employee Records %
            </h3>
            <p className="text-xs text-[#6b4d36] mb-6">Real-time percentage breakdown of HR compliance and workforce performance metrics.</p>
            <div className="h-[200px] w-full">
              {isGraphVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recordStats} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Value']}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1d3557', border: 'none', borderRadius: '10px', color: '#fff' }}
                      itemStyle={{ color: '#fbbf24' }} // Bright Yellow
                    />
                    <Bar
                      dataKey="value"
                      barSize={20}
                      barSize={20}
                      animationDuration={2000}
                      animationBegin={500}
                    >
                      {recordStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{ filter: 'drop-shadow(4px 4px 4px rgba(0,0,0,0.2))' }}
                        />
                      ))}
                      <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fill: '#433020', fontWeight: 'bold' }} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1 mt-4">
              {recordStats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  <span className="text-[8px] mt-1 font-bold text-[#433020]">{stat.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Workflow Status Graph */}
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
            className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-4 md:p-8 rounded-[2.5rem] border border-white/50 dark:border-gray-700 shadow-xl transition-colors duration-300"
          >
            <h3 className="text-xl font-bold text-[#433020] mb-1">
              Team Performance
            </h3>
            <p className="text-xs text-[#6b4d36] mb-6">Easily monitor and track work records, efficiency, and progress across different departmental teams in real-time.</p>
            <div className="h-[200px] w-full">
              {isGraphVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value) => [`${Math.round((value / 1000) * 100)}%`, 'Effort Share']}
                      contentStyle={{ backgroundColor: '#fbbf24', border: 'none', borderRadius: '10px', color: '#fff' }}
                      itemStyle={{ color: '#1d3557' }} // Bright Yellow
                    />
                    <Pie
                      data={workFlowData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value }) => `${Math.round((value / 1000) * 100)}%`}
                      animationDuration={2000}
                      animationBegin={1000}
                    >
                      {workFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="mt-4 text-sm text-center text-[#6b4d36]">
              <span className="font-bold text-[#a855f7]">Multi-Team</span> synchronized tracking
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Choose Us Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 md:mt-24 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[#8a6144] dark:text-[#d4a081] font-bold tracking-widest text-sm uppercase">Why Avani HR?</span>
          <h2 className="text-2xl md:text-5xl font-extrabold text-[#433020] dark:text-gray-100 mt-2">Redefining Workforce Management</h2>
          <p className="mt-4 text-[#6b3d36] dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            In today's fast-paced corporate world, manual HR processes are obsolete. We bring a unified digital ecosystem that bridges the gap between management and employees.
          </p>
        </div>

        <div className="relative py-10 md:py-16 overflow-hidden">
          {/* Background Decorative Blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#8a6144]/10 to-transparent rounded-full blur-[100px] -z-10"></div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            {/* Left Items */}
            <div className="w-full lg:w-1/4 space-y-6 md:space-y-12 order-2 lg:order-1 flex flex-col items-center lg:items-end">
              <DiagramLabel
                side="left"
                title="Geo-Fenced Attendance"
                desc="Secure location-based check-ins & validation"
                color="#a855f7"
              />
              <DiagramLabel
                side="left"
                title="Instant Leave Portal"
                desc="Seamless application & tracking workflow"
                color="#10b981"
              />
              <DiagramLabel
                side="left"
                title="Document Validation"
                desc="Encrypted storage for employee records"
                color="#f59e0b"
              />
              <DiagramLabel
                side="left"
                title="Activity Monitoring"
                desc="Real-time tracking of daily operations"
                color="#f43f5e"
              />
            </div>

            {/* Central Circular Diagram (The "Wow" Swirl) */}
            <div className="relative w-[260px] h-[260px] md:w-[500px] md:h-[500px] flex items-center justify-center order-1 lg:order-2 self-center">
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                {/* Spiral Segments - Infographic Style */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((degree, i) => (
                  <motion.div
                    key={i}
                    style={{
                      transform: `rotate(${degree}deg)`,
                      transformOrigin: '50% 50%'
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* The "Swirl" Tail - Enhanced Density */}
                    <div
                      className="absolute w-[100px] md:w-[200px] h-[35px] md:h-[80px] rounded-full translate-x-[60px] md:translate-x-[110px] opacity-10 blur-xl"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    ></div>
                    <div
                      className="absolute w-[90px] md:w-[180px] h-[25px] md:h-[60px] rounded-full translate-x-[70px] md:translate-x-[130px] opacity-25"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                        borderRadius: degree % 90 === 0 ? '100% 0 0 100%' : '100%'
                      }}
                    ></div>
                    {/* The Node Circle with Glow */}
                    <div
                      className="absolute w-8 h-8 md:w-16 md:h-16 rounded-full border-4 border-white bg-white shadow-2xl flex items-center justify-center translate-x-[125px] md:translate-x-[220px] z-20"
                      style={{ boxShadow: `0 10px 30px -5px ${COLORS[i % COLORS.length]}88` }}
                    >
                      <div
                        className="w-2.5 h-2.5 md:w-5 md:h-5 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Center Infographic Core */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="absolute w-[130px] h-[130px] md:w-[220px] md:h-[220px] bg-white rounded-full shadow-2xl flex items-center justify-center p-3 md:p-6 text-center z-30 border-8 border-[#fdf6ec]"
              >
                <div className="space-y-2">
                  <div className="h-1 w-8 bg-[#8a6144] mx-auto rounded-full opacity-30 mb-2"></div>
                  <h3 className="text-xs md:text-sm font-black text-[#433020] leading-tight uppercase tracking-widest">
                    Integrated <br /><span className="text-[#8a6144]">Workforce</span><br />Management
                  </h3>
                  <div className="h-1 w-8 bg-[#8a6144] mx-auto rounded-full opacity-30 mt-2"></div>
                </div>
              </motion.div>
            </div>

            {/* Right Items */}
            <div className="w-full lg:w-1/4 space-y-6 md:space-y-12 order-3 flex flex-col items-center lg:items-start">
              <DiagramLabel
                side="right"
                title="Smart Analytics"
                desc="Deep insights into workforce efficiency"
                color="#00a8e1"
              />
              <DiagramLabel
                side="right"
                title="Performance Rankings"
                desc="Gamified leaderboard & peer stats"
                color="#ec4899"
              />
              <DiagramLabel
                side="right"
                title="Automated Approvals"
                desc="Fast-track administrative processing"
                color="#8b5cf6"
              />
              <DiagramLabel
                side="right"
                title="Recognition Tracking"
                desc="Automated achievement scoring system"
                color="#4ade80"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl relative overflow-hidden border border-white/50 dark:border-gray-700"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-3xl font-bold text-black dark:text-gray-100 mb-6 relative z-10 flex flex-wrap justify-center gap-x-2">
          {"Ready to Upgrade Your Workplace?".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h2>
        <p className="text-black/80 dark:text-gray-300 mb-8 max-w-xl mx-auto relative z-10">Join Avani Enterprises and experience the future of HR management today.</p>
        <div className="relative z-10">
          {!user && (
            <Link to="/register" className="inline-block px-8 py-3 bg-[#433020] text-[#fff5e6] font-bold rounded-full shadow-lg hover:bg-black hover:scale-105 transition-all">
              Get Started Now
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};



const DiagramLabel = ({ side, title, desc, color }) => (
  <motion.div
    initial={{ x: side === 'left' ? -20 : 20, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05 }}
    className={`relative group flex items-center justify-center lg:${side === 'left' ? 'justify-end' : 'justify-start'} w-full text-center lg:${side === 'left' ? 'text-right' : 'text-left'}`}
  >
    <div className={`flex items-center w-full max-w-[260px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl border border-white/50 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:bg-white`}>
      {/* Side Marker Bar - Color coded like the image */}
      {side === 'right' && (
        <div className="w-1.5 self-stretch" style={{ backgroundColor: color }}></div>
      )}

      <div className="p-3 md:p-4 flex-1">
        <h4 className="text-xs md:text-sm font-bold text-[#433020] dark:text-gray-100 mb-0.5 leading-snug">{title}</h4>
        <p className="text-[9px] md:text-[10px] text-[#8a6144] dark:text-gray-400 font-medium uppercase tracking-tight">{desc}</p>
      </div>

      {side === 'left' && (
        <div className="w-1.5 self-stretch" style={{ backgroundColor: color }}></div>
      )}
    </div>

    {/* Connection Link */}
    <div className={`hidden lg:block w-8 md:w-16 h-[2px] opacity-20`}
      style={{ backgroundColor: color }}>
    </div>
  </motion.div>
);

export default HomePage;
