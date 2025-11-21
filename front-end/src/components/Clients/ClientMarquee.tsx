import React from "react";

const ICONS = {
  LogoA: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props} className="font-bold text-2xl text-cyan-400">
      POOL SHOP SJT
    </span>
  ),
  LogoB: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props} className="font-extrabold text-2xl text-yellow-500">
      Warmadewa University
    </span>
  ),
  LogoC: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props} className="font-semibold text-2xl text-pink-500">
      AIRISK AI
    </span>
  ),
  LogoD: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props} className="font-bold text-2xl text-green-400">
      FinAI
    </span>
  ),
  LogoE: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props} className="font-extrabold text-2xl text-blue-400">
      GlobalOps
    </span>
  ),
};

const clientLogos = [
  { name: "OpenAI", logo: ICONS.LogoB },
  { name: "SparkAI", logo: ICONS.LogoC },
  { name: "X-AI", logo: ICONS.LogoA },
  { name: "Character.ai", logo: ICONS.LogoE },
  { name: "Deepmind", logo: ICONS.LogoD },
  { name: "Anthropic", logo: ICONS.LogoA },
  { name: "Mistral", logo: ICONS.LogoC },
];

export const ClientMarquee = () => {
  // Duplikasi logo untuk efek scroll tanpa batas
  const logos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <div className="relative w-full overflow-hidden py-12 bg-gray-900/50 mt-16 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-20 pointer-events-none" />

      <div className="client-marquee w-max flex z-10">
        {logos.map((client, index) => (
          <div
            key={index}
            className="min-w-[12rem] md:min-w-[15rem] h-16 flex items-center justify-center border-x border-gray-700/50 bg-gray-900/30 px-6 mx-0.5 transition duration-500 hover:bg-gray-800/80"
          >
            <client.logo />
          </div>
        ))}
      </div>
    </div>
  );
};
