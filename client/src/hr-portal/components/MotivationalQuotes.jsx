

// import React, { useEffect, useState, useRef } from "react";
// import gsap from "gsap";

// const quotes = [
//   "Believe you can and you're halfway there.",
//   "Push yourself, because no one else is going to do it for you.",
//   "Every day is a second chance.",
//   "Success doesn’t just find you. You have to go out and get it.",
//   "Dream it. Wish it. Do it.",
//   "Stay positive, work hard, make it happen.",
//   "Don't watch the clock; do what it does. Keep going.",
//   "Great things never come from comfort zones.",
//   "The harder you work for something, the greater you’ll feel when you achieve it.",
//   "Sometimes we’re tested not to show our weaknesses, but to discover our strengths."
// ];

// const fonts = [
//   "'Pacifico', cursive",
//   "'Playfair Display', serif",
//   "'Lobster', cursive",
//   "'Shadows Into Light', cursive",
//   "'Great Vibes', cursive",
//   "'Satisfy', cursive",
//   "'Dancing Script', cursive",
//   "'Abril Fatface', cursive",
//   "'Caveat', cursive",
//   "'Amatic SC', cursive"
// ];

// const gradients = [
//   "linear-gradient(to right, #ff512f, #dd2476)",
//   "linear-gradient(to right, #00c6ff, #0072ff)",
//   "linear-gradient(to right, #f7971e, #ffd200)",
//   "linear-gradient(to right, #56ab2f, #a8e063)",
//   "linear-gradient(to right, #ee9ca7, #ffdde1)",
//   "linear-gradient(to right, #2193b0, #6dd5ed)",
//   "linear-gradient(to right, #ff6a00, #ee0979)",
//   "linear-gradient(to right, #ffecd2, #fcb69f)",
//   "linear-gradient(to right, #4ca1af, #c4e0e5)",
//   "linear-gradient(to right, #8e2de2, #4a00e0)"
// ];

// const MotivationalQuotes = () => {
//   const [index, setIndex] = useState(0);
//   const [wordIndex, setWordIndex] = useState(0);
//   const quoteRef = useRef();

//   const currentQuote = quotes[index];
//   const words = currentQuote.split(" ");
//   const font = fonts[index % fonts.length];
//   const gradient = gradients[index % gradients.length];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (wordIndex < words.length) {
//         setWordIndex((prev) => prev + 1);
//       } else {
//         setTimeout(() => {
//           setIndex((prev) => (prev + 1) % quotes.length);
//           setWordIndex(0);
//         }, 2000);
//       }
//     }, 250);
//     return () => clearInterval(interval);
//   }, [wordIndex, index]);

//   useEffect(() => {
//     gsap.fromTo(
//       quoteRef.current,
//       { scale: 0.9, opacity: 0.6 },
//       {
//         scale: 1,
//         opacity: 1,
//         duration: 0.8,
//         ease: "power2.out"
//       }
//     );
//   }, [index]);

//   const quoteStyle = {
//     fontFamily: font,
//     fontSize: "2.5rem",
//     fontWeight: "bold",
//     backgroundImage: gradient,
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     textAlign: "center",
//     lineHeight: 1.3,
//     cursor: "pointer",
//     transition: "transform 0.4s ease-in-out",
//     userSelect: "none"
//   };

//   return (
//     <div
//       className="w-full h-full flex items-center justify-center p-6"
//       style={{ backgroundColor: "transparent" }}
//     >
//       <div
//         ref={quoteRef}
//         className={`max-w-4xl px-6 py-4 text-center ${index % 3 === 0 ? "animate-pulse" : ""}`}
//         style={quoteStyle}
//         onMouseEnter={(e) => {
//           gsap.to(e.currentTarget, { scale: 1.6, duration: 0.3, zIndex: 10 });
//         }}
//         onMouseLeave={(e) => {
//           gsap.to(e.currentTarget, { scale: 1, duration: 0.3, zIndex: 1 });
//         }}
//       >
//         {words.slice(0, wordIndex).join(" ")}
//       </div>
//     </div>
//   );
// };

// // export default MotivationalQuotes;
// import React, { useEffect, useState, useRef } from "react";
// import gsap from "gsap";

// const quotes = [
//   "Believe you can and you're halfway there.",
//   "Push yourself, because no one else is going to do it for you.",
//   "Every day is a second chance.",
//   "Success doesn’t just find you. You have to go out and get it.",
//   "Dream it. Wish it. Do it.",
//   "Stay positive, work hard, make it happen.",
//   "Don't watch the clock; do what it does. Keep going.",
//   "Great things never come from comfort zones.",
//   "The harder you work for something, the greater you’ll feel when you achieve it.",
//   "Sometimes we’re tested not to show our weaknesses, but to discover our strengths."
// ];

// const fonts = [
//   "'Pacifico', cursive",
//   "'Playfair Display', serif",
//   "'Lobster', cursive",
//   "'Shadows Into Light', cursive",
//   "'Great Vibes', cursive",
//   "'Satisfy', cursive",
//   "'Dancing Script', cursive",
//   "'Abril Fatface', cursive",
//   "'Caveat', cursive",
//   "'Amatic SC', cursive"
// ];

// const gradients = [
//   "linear-gradient(to right, #ff512f, #dd2476)",
//   "linear-gradient(to right, #00c6ff, #0072ff)",
//   "linear-gradient(to right, #f7971e, #ffd200)",
//   "linear-gradient(to right, #56ab2f, #a8e063)",
//   "linear-gradient(to right, #ee9ca7, #ffdde1)",
//   "linear-gradient(to right, #2193b0, #6dd5ed)",
//   "linear-gradient(to right, #ff6a00, #ee0979)",
//   "linear-gradient(to right, #ffecd2, #fcb69f)",
//   "linear-gradient(to right, #4ca1af, #c4e0e5)",
//   "linear-gradient(to right, #8e2de2, #4a00e0)"
// ];

// const MotivationalQuotes = () => {
//   const [index, setIndex] = useState(0);
//   const [wordIndex, setWordIndex] = useState(0);
//   const [showCursor, setShowCursor] = useState(true);
//   const quoteRef = useRef();

//   const currentQuote = quotes[index];
//   const words = currentQuote.split(" ");
//   const font = fonts[index % fonts.length];
//   const gradient = gradients[index % gradients.length];

//   useEffect(() => {
//     const cursorBlink = setInterval(() => {
//       setShowCursor((prev) => !prev);
//     }, 500);
//     return () => clearInterval(cursorBlink);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (wordIndex < words.length) {
//         setWordIndex((prev) => prev + 1);
//       } else {
//         setTimeout(() => {
//           setIndex((prev) => (prev + 1) % quotes.length);
//           setWordIndex(0);
//         }, 2000);
//       }
//     }, 250);
//     return () => clearInterval(interval);
//   }, [wordIndex, index]);

//   useEffect(() => {
//     gsap.fromTo(
//       quoteRef.current,
//       { scale: 0.9, opacity: 0.6 },
//       {
//         scale: 1,
//         opacity: 1,
//         duration: 0.8,
//         ease: "power2.out"
//       }
//     );
//   }, [index]);

//   const quoteStyle = {
//     fontFamily: font,
//     fontSize: "2.5rem",
//     fontWeight: "bold",
//     backgroundImage: gradient,
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     textAlign: "center",
//     lineHeight: 1.3,
//     cursor: "pointer",
//     transition: "transform 0.4s ease-in-out",
//     userSelect: "none"
//   };

//   return (
//     <div
//       className="w-full h-full flex items-center justify-center p-6"
//       style={{ backgroundColor: "transparent" }}
//     >
//       <div
//         ref={quoteRef}
//         className={`max-w-4xl px-6 py-4 text-center ${index % 3 === 0 ? "animate-pulse" : ""}`}
//         style={quoteStyle}
//         onMouseEnter={(e) => {
//           gsap.to(e.currentTarget, { scale: 1.7, duration: 0.3, zIndex: 10 });
//         }}
//         onMouseLeave={(e) => {
//           gsap.to(e.currentTarget, { scale: 1, duration: 0.3, zIndex: 1 });
//         }}
//       >
//         {words.slice(0, wordIndex).join(" ")}
//         {showCursor && <span style={{ color: "#ccc", fontWeight: "bold" }}>|</span>}
//       </div>
//     </div>
//   );
// };

// export default MotivationalQuotes;

// import React, { useEffect, useState, useRef } from "react";
// import gsap from "gsap";

// const quotes = [
//   "Believe you can and you're halfway there!!",
//   "Push yourself, because no one else is going to do it for you.",
//   "Every day is a second chance!!",
//   "Success doesn’t just find you. You have to go out and get it.",
//   "Dream it. Wish it. Do it!!",
//   "Stay positive, work hard, make it happen.",
//   "Don't watch the clock; do what it does. Keep going!!",
//   "Great things never come from comfort zones.",
//   "The harder you work for something, the greater you’ll feel when you achieve it!!",
//   "Sometimes we’re tested not to show our weaknesses, but to discover our strengths."
// ];

// const fonts = [
//   "'Pacifico', cursive",
//   "'Playfair Display', serif",
//   "'Lobster', cursive",
//   "'Shadows Into Light', cursive",
//   "'Great Vibes', cursive",
//   "'Satisfy', cursive",
//   "'Dancing Script', cursive",
//   "'Abril Fatface', cursive",
//   "'Caveat', cursive",
//   "'Amatic SC', cursive"
// ];

// const gradients = [
//   "linear-gradient(to right, #ff512f, #dd2476)",
//   "linear-gradient(to right, #00c6ff, #0072ff)",
//   "linear-gradient(to right, #f7971e, #ffd200)",
//   "linear-gradient(to right, #56ab2f, #a8e063)",
//   "linear-gradient(to right, #ee9ca7, #ffdde1)",
//   "linear-gradient(to right, #2193b0, #6dd5ed)",
//   "linear-gradient(to right, #ff6a00, #ee0979)",
//   "linear-gradient(to right, #ffecd2, #fcb69f)",
//   "linear-gradient(to right, #4ca1af, #c4e0e5)",
//   "linear-gradient(to right, #8e2de2, #4a00e0)"
// ];

// const MotivationalQuotes = () => {
//   const [index, setIndex] = useState(0);
//   const [wordIndex, setWordIndex] = useState(0);
//   const [showCursor, setShowCursor] = useState(true);
//   const quoteRef = useRef();

//   const currentQuote = quotes[index];
//   const words = currentQuote.split(" ");
//   const font = fonts[index % fonts.length];
//   const gradient = gradients[index % gradients.length];
//   const isHeartbeat = index % 4 === 0;

//   useEffect(() => {
//     const cursorBlink = setInterval(() => {
//       setShowCursor((prev) => !prev);
//     }, 500);
//     return () => clearInterval(cursorBlink);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (wordIndex < words.length) {
//         setWordIndex((prev) => prev + 1);
//       } else {
//         setTimeout(() => {
//           setIndex((prev) => (prev + 1) % quotes.length);
//           setWordIndex(0);
//         }, 2000);
//       }
//     }, 250);
//     return () => clearInterval(interval);
//   }, [wordIndex, index]);

//   useEffect(() => {
//     gsap.fromTo(
//       quoteRef.current,
//       { scale: 0.9, opacity: 0.6 },
//       {
//         scale: 1,
//         opacity: 1,
//         duration: 0.8,
//         ease: "power2.out"
//       }
//     );
//   }, [index]);

//   const quoteStyle = {
//     fontFamily: font,
//     fontSize: "2.5rem",
//     fontWeight: "bold",
//     backgroundImage: gradient,
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     textAlign: "center",
//     lineHeight: 1.3,
//     cursor: "pointer",
//     transition: "transform 0.4s ease-in-out",
//     userSelect: "none"
//   };

//   return (
//     <div
//       className="w-full h-full flex items-center justify-center p-6"
//       style={{ backgroundColor: "transparent" }}
//     >
//       <div
//         ref={quoteRef}
//         className={`max-w-4xl px-6 py-4 text-center ${isHeartbeat ? "animate-pulse" : ""}`}
//         style={quoteStyle}
//         onMouseEnter={(e) => {
//           gsap.to(e.currentTarget, { scale: 1.7, duration: 0.3, zIndex: 10 });
//         }}
//         onMouseLeave={(e) => {
//           gsap.to(e.currentTarget, { scale: 1, duration: 0.3, zIndex: 1 });
//         }}
//       >
//         {words.slice(0, wordIndex).join(" ")}<span className="text-gray-400 font-extrabold">{showCursor ? " |" : ""}</span>
//       </div>
//     </div>
//   );
// };

// export default MotivationalQuotes;

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

const quotes = [
  "Believe you can and you're halfway there!!",
  "Push yourself, because no one else is going to do it for you.",
  "Every day is a second chance!!",
  "Success doesn’t just find you. You have to go out and get it.",
  "Dream it. Wish it. Do it!!",
  "Stay positive, work hard, make it happen.",
  "Don't watch the clock; do what it does. Keep going!!",
  "Great things never come from comfort zones.",
  "The harder you work for something, the greater you’ll feel when you achieve it!!",
  "Sometimes we’re tested not to show our weaknesses, but to discover our strengths."
];

const fonts = [
  "'Pacifico', cursive",
  "'Playfair Display', serif",
  "'Lobster', cursive",
  "'Shadows Into Light', cursive",
  "'Great Vibes', cursive",
  "'Satisfy', cursive",
  "'Dancing Script', cursive",
  "'Abril Fatface', cursive",
  "'Caveat', cursive",
  "'Amatic SC', cursive"
];

const gradients = [
  "linear-gradient(to right, #ff512f, #dd2476)",
  "linear-gradient(to right, #00c6ff, #0072ff)",
  "linear-gradient(to right, #f7971e, #ffd200)",
  "linear-gradient(to right, #56ab2f, #a8e063)",
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #2193b0, #6dd5ed)",
  "linear-gradient(to right, #ff6a00, #ee0979)",
  "linear-gradient(to right, #ffecd2, #fcb69f)",
  "linear-gradient(to right, #4ca1af, #c4e0e5)",
  "linear-gradient(to right, #8e2de2, #4a00e0)"
];

const MotivationalQuotes = () => {
  const [index, setIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const quoteRef = useRef();
  const effectRef = useRef();

  const currentQuote = quotes[index];
  const words = currentQuote.split(" ");
  const font = fonts[index % fonts.length];
  const gradient = gradients[index % gradients.length];
  const isHeartbeat = index % 4 === 0;
  const randomEffect = index % 3 === 0 ? "❤️" : index % 5 === 0 ? "!!" : "";

  // Blink cursor animation
  useEffect(() => {
    const cursorBlink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorBlink);
  }, []);

  // Word-by-word typing
  useEffect(() => {
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setWordIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % quotes.length);
          setWordIndex(0);
        }, 2000);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [wordIndex, index]);

  // Scale quote on new appearance
  useEffect(() => {
    gsap.fromTo(
      quoteRef.current,
      { scale: 0.9, opacity: 0.6 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }
    );
  }, [index]);

  // Animate heart or !! bounce
  useEffect(() => {
    if (randomEffect && effectRef.current) {
      gsap.fromTo(
        effectRef.current,
        { y: -8, opacity: 0.7, scale: 1 },
        {
          y: 8,
          opacity: 1,
          scale: 1.3,
          repeat: -1,
          yoyo: true,
          duration: 0.5,
          ease: "power1.inOut"
        }
      );
    }
  }, [randomEffect]);

  const quoteStyle = {
    fontFamily: font,
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
    fontWeight: "bold",
    backgroundImage: gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    lineHeight: 1.4,
    cursor: "pointer",
    transition: "transform 0.4s ease-in-out",
    userSelect: "none",
    position: "relative"
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center p-6"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        ref={quoteRef}
        className={`max-w-5xl px-6 py-4 text-center ${isHeartbeat ? "animate-pulse" : ""}`}
        style={quoteStyle}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, { scale: 1.7, duration: 0.3, zIndex: 10 });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, { scale: 1, duration: 0.3, zIndex: 1 });
        }}
      >
        {words.slice(0, wordIndex).join(" ")}
        <span className="text-gray-400 font-extrabold">{showCursor ? " |" : ""}</span>
        {randomEffect && (
          <span
            key={index}
            ref={effectRef}
            style={{
              display: "inline-block",
              marginLeft: "10px",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#ff3366",
              textShadow: "0 0 8px #ff99aa",
              cursor: "pointer"
            }}
          >
            {randomEffect}
          </span>
        )}
      </div>
    </div>
  );
};

export default MotivationalQuotes;
