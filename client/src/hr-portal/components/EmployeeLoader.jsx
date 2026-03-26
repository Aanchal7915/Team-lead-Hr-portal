import React, { useState, useEffect } from "react";

const EmployeeLoader = ({ name, action }) => {
  const [quote, setQuote] = useState("");
  const [index, setIndex] = useState(0);

  const funnyQuotes = [
    `✨ Wait "${name}", the system is aligning the stars just for you ✨`,
    `☕ Hold tight "${name}", our coffee-powered servers are waking up...`,
    `📜 Almost there "${name}", your attendance is being etched in history!`,
    `🐹 Patience "${name}", the office hamsters are running faster...`,
    `🏅 One sec "${name}", polishing your attendance badge...`,
    `🛰️ Relax "${name}", satellites are locking onto your vibe...`,
    `🧙 Don't move "${name}", a wizard is logging your entry...`,
    `🔮 Loading magic for you "${name}", please stand by...`,
    `🏆 Hang on "${name}", saving your spot in the hall of legends...`,
    `🚀 Wait "${name}", the system is double-checking your awesomeness!`,
    `🌈 "${name}", good vibes are charging up your dashboard...`,
    `🔥 "${name}", we're firing up the engines for your success...`,
    `💎 "${name}", polishing your diamond-studded record...`,
    `🎶 Hold on "${name}", background music is tuning just for you...`,
    `🌍 "${name}", connecting you with the universe's attendance grid...`,
    `⚡ "${name}", sparking up today's energy for your log...`,
    `🎉 Almost there "${name}", confetti is being prepared...`,
    `🦸‍♂️ "${name}", your superhero attendance cape is loading...`,
    `📡 "${name}", syncing with cosmic wifi...`,
    `💡 "${name}", bright ideas are being logged with your check-in...`,
  ];

  useEffect(() => {
    setQuote(funnyQuotes[0]);
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % funnyQuotes.length;
        setQuote(funnyQuotes[next]);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [name]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      {/* Card */}
      <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-10 shadow-2xl w-[90%] sm:w-[460px] text-center border border-[#8a6144]/10 overflow-hidden">

        {/* Soft beige animated glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff5e6] via-[#f5dfc8] to-[#fff5e6] opacity-80 animate-bgPulse" />

        {/* Spinner — brand ring */}
        <div className="relative flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-[#8a6144]/20 border-t-[#8a6144] animate-spinSlow" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            {action === "checkin" ? "✅" : "🌙"}
          </span>
        </div>

        {/* Progress bar — brand brown */}
        <div className="relative h-1.5 w-3/4 mx-auto bg-[#8a6144]/10 rounded-full overflow-hidden mb-6">
          <div className="absolute top-0 left-0 h-full bg-[#8a6144] animate-progressBar rounded-full" />
        </div>

        {/* Title */}
        <div className="text-2xl sm:text-3xl font-extrabold text-[#433020] tracking-wide drop-shadow-sm fadeIn">
          {action === "checkin" ? "Checking In..." : "Checking Out..."}
        </div>

        {/* Quote */}
        {quote && (
          <div className="mt-4 text-sm sm:text-base font-semibold italic text-[#8a6144] fadeIn quoteText leading-relaxed px-2">
            {quote}
          </div>
        )}

        {/* Avani Enterprises branding */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
          <div className="h-px w-8 bg-[#8a6144]" />
          <span className="text-[10px] font-black text-[#8a6144] uppercase tracking-widest">Avani Enterprises</span>
          <div className="h-px w-8 bg-[#8a6144]" />
        </div>
      </div>

      <style>{`
        .fadeIn {
          animation: fadeIn 0.8s ease-in-out;
        }
        .quoteText {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spinSlow {
          animation: spinSlow 1.4s linear infinite;
        }
        @keyframes bgPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-bgPulse {
          animation: bgPulse 4s ease-in-out infinite;
        }
        @keyframes progressBar {
          0% { left: -50%; width: 50%; }
          50% { left: 25%; width: 60%; }
          100% { left: 100%; width: 50%; }
        }
        .animate-progressBar {
          position: absolute;
          animation: progressBar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EmployeeLoader;
