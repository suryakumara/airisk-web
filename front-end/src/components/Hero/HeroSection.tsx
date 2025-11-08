import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Globe from "../Globe/Globe";

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const btn1Ref = useRef<HTMLAnchorElement>(null!);
  const btn2Ref = useRef<HTMLAnchorElement>(null!);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out" }
      );
    }
    if (h1Ref.current) {
      gsap.fromTo(
        h1Ref.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
      );
    }
    if (pRef.current) {
      gsap.fromTo(
        pRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.7, ease: "power3.out" }
      );
    }
    if (btn1Ref.current && btn2Ref.current) {
      gsap.fromTo(
        [btn1Ref.current, btn2Ref.current],
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, delay: 1.1, stagger: 0.15, ease: "back.out(1.7)" }
      );
    }
    // Animate AI Business neon glow loop
    const aiBusiness = document.getElementById("ai-business");
    if (aiBusiness) {
      gsap.to(aiBusiness, {
        textShadow: "0 0 24px #39ff14, 0 0 48px #39ff14",
        boxShadow: "0 0 32px #39ff14",
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  }, []);

  // Cozy interactive hover for buttons
  const handleBtnHover = (ref: React.RefObject<HTMLAnchorElement>, hover: boolean) => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: hover ? 1.08 : 1,
        boxShadow: hover ? "0 4px 24px 0 rgba(0,0,0,0.18), 0 0 0 4px #aeefff44" : "none",
        backgroundColor: hover ? "#e0f7fa" : "#fff",
        color: hover ? "#00796b" : "#000",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center text-center text-white overflow-hidden"
    >
      <div className="absolute inset-0">
        <Globe />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 pointer-events-none"></div>
      </div>
      <div className="relative z-20 p-6 mt-[55vh] max-w-[90%] w-full">
        <h1
          ref={h1Ref}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
          style={{ textShadow: "0 0 20px rgba(0,0,0,0.7)" }}
        >
          Accelerate Your{" "}
          <span
            id="ai-business"
            style={{
              color: "#39ff14",
              textShadow: "0 0 8px #39ff14, 0 0 24px #39ff14",
              fontWeight: 900,
              padding: "0 0.1em",
              borderRadius: "0.2em",
              background: "rgba(57,255,20,0.08)",
            }}
          >
            AI
          </span>
          Business
        </h1>
        <p ref={pRef} className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
          Empower your company with advanced AI solutions for real-time data, video, and audio
          experiences. Unlock new opportunities, drive innovation, and scale with confidence using
          our open-source technology.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            ref={btn1Ref}
            href="#"
            className="bg-white text-black font-bold py-3 px-6 rounded-lg transition-transform"
            onMouseEnter={() => handleBtnHover(btn1Ref, true)}
            onMouseLeave={() => handleBtnHover(btn1Ref, false)}
          >
            Start building
          </a>
          <a
            ref={btn2Ref}
            href="#"
            className="bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-lg transition-transform"
            onMouseEnter={() => handleBtnHover(btn2Ref, true)}
            onMouseLeave={() => handleBtnHover(btn2Ref, false)}
          >
            Talk to us
          </a>
        </div>
      </div>
      <div className="absolute bottom-6 z-10 w-full">
        <p className="text-sm text-gray-400">POWERING REAL-TIME FOR</p>
        <div className="flex justify-center items-center gap-8 mt-4 filter grayscale opacity-60 hover:opacity-80 transition-opacity">
          <span className="font-bold text-lg">LOGO 1</span>
          <span className="font-bold text-lg">LOGO 2</span>
          <span className="font-bold text-lg">LOGO 3</span>
          <span className="font-bold text-lg">LOGO 4</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
