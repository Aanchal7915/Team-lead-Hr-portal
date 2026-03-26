import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaMapMarkerAlt } from 'react-icons/fa';
import logo from "../assets/logo1.png";
import { Link } from 'react-router-dom';

export default function Footer() {
  const [showBigHeart, setShowBigHeart] = useState(false);

  // Address for Google Maps Link
  const address = "Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram, Haryana 122002";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="bg-[#433020] text-white py-12 relative shadow-lg rounded-t-3xl overflow-hidden font-sans"
    >
      {/* Fullscreen Heart Popup */}
      <AnimatePresence>
        {showBigHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 12 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6 }}
            className="fixed top-1/2 left-1/2 z-[9999] pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="text-red-500 text-[10rem] select-none">❤️</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* -- Column 1: Branding & Contact -- */}
        <div className="flex flex-col space-y-6">
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition w-fit">
            <img src={logo} alt="Avani Enterprises Logo" className="h-16 w-auto" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-wide leading-none">AVANI</span>
              <span className="text-lg font-medium tracking-wide text-[#fff5e6]">ENTERPRISES</span>
            </div>
          </Link>

          <p className="text-white/80 text-sm italic max-w-xs">
            Empowering workforce with trust & technology. Simplifying Human Resources, One Click at a Time.
          </p>

          {/* Clickable Address */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-white/90 hover:text-[#8a6144] transition group"
          >
            <FaMapMarkerAlt className="mt-1 text-[#fff5e6] group-hover:scale-110 transition shrink-0" size={18} />
            <span className="text-sm leading-relaxed max-w-[250px]">
              {address}
            </span>
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-2">
            <SocialIcon href="https://www.instagram.com/avanienterprises.branding/" icon={<FaInstagram />} />
            <SocialIcon href="https://www.facebook.com/people/Avani-Enterprises/61576229620845/?rdid=fw5wiWOMhyXHBVrN&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DKFWQiBe4%2F" icon={<FaFacebook />} />
            <SocialIcon href="https://x.com/avanienterprises" icon={<FaTwitter />} />
            <SocialIcon href="https://linkedin.com" icon={<FaLinkedin />} />
            <SocialIcon href="mailto:kp@avanienterprises.in" icon={<FaEnvelope />} />
          </div>
        </div>

        {/* -- Column 2: Key Features -- */}
        <div className="flex flex-col space-y-6 md:pl-10">
          <h1 className="text-3xl font-extrabold text-[#fff5e6] drop-shadow-sm mb-6">
            <span className="border-b-4 border-[#fff5e6] pb-1 rounded-sm">Our Ecosystem</span>
          </h1>

          <h3 className="text-xl font-bold text-[#fff5e6] relative inline-block w-fit">
            Our Solutions
            <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[#fff5e6] rounded-full"></span>
          </h3>
          <ul className="space-y-3 text-white/80">
            {[
              { name: 'HR Management', url: 'https://Hrportal.avanienterprises.in' },
              { name: 'Project & Leads', url: 'https://Projectmanagement.avanienterprises.in' },
              { name: 'Sales Edge Portal', url: 'https://crm-sales-portal.vercel.app/' },
              { name: 'Placement System', url: 'https://Projectmanagement.avanienterprises.in' },
              { name: 'Student & Agency', url: 'https://placement-management-system-six.vercel.app' },
              { name: 'E-Commerce Store', url: 'https://shoes-ecommerce-iota.vercel.app' }
            ].map((solution, idx) => (
              <li key={idx}>
                <a
                  href={solution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group hover:text-white transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fff5e6] group-hover:scale-150 transition"></span>
                  {solution.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* -- Column 3: Location Map -- */}
        <div className="flex flex-col space-y-6">
          <h3 className="text-xl font-bold text-[#fff5e6] relative inline-block w-fit">
            Visit Us
            <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[#fff5e6] rounded-full"></span>
          </h3>
          <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg border-2 border-white/10 hover:border-[#8a6144]/50 transition duration-300">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.632289656461!2d77.0516686761066!3d28.46049889176121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1839e9f2913f%3A0xa199b90c29f2c3d5!2sUnitech%20Cyber%20Park!5e0!3m2!1sen!2sin!4v1709228892834!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

      </div>

      {/* Bottom - Made with love line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mt-12 pt-8 border-t border-white/10 text-sm text-white/50"
      >
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <p>© 2025 Avani HR Portal. All rights reserved.</p>
          <span className="hidden md:block mx-2">|</span>
          <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
          <span className="hidden md:block mx-2">|</span>
          <motion.p
            onMouseEnter={() => setShowBigHeart(true)}
            onMouseLeave={() => setShowBigHeart(false)}
            whileHover={{ scale: 1.05 }}
            className="inline-block cursor-pointer flex items-center gap-1"
          >
            Made with <span className="animate-heartbeat text-red-500 text-lg">❤️</span> by <span className="text-[#fff5e6] font-semibold">Soham</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Custom styles */}
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.8s infinite ease-in-out;
        }
      `}</style>
    </motion.footer>
  );
}

// Helper Component for Social Icons
const SocialIcon = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#8a6144] hover:text-white transition-all duration-300 hover:scale-110"
  >
    {icon}
  </a>
);
