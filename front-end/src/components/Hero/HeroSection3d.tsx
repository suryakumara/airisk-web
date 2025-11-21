import React from "react";
import { ClientMarquee } from "../Clients/ClientMarquee";

const ICONS = {
  // Gear/Cog for Workflow Automation
  Workflow: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      ></path>
    </svg>
  ),
  // Document for Data Extraction & Processing
  Document: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m-6-4h6m-6-4h6m-4 8h2m-2-4h2m-2-4h2m-2-4h2m-4 8v.01m0 4v.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      ></path>
    </svg>
  ),
  // Chat Bubble for Chatbot
  Chatbot: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z"
      ></path>
    </svg>
  ),
  // Rocket for Marketing Automation
  Marketing: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.5 10.5H21L11 3.5v7H3l10 7V10.5z"
      ></path>
    </svg>
  ),
  // Puzzle Piece for Integration
  Integration: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 11c0 1.657-3.582 3-8 3S4 12.657 4 11s3.582-3 8-3 8 1.343 8 3z"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 11v6m16-6v6m-7 0v-6"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 17a3 3 0 100-6 3 3 0 000 6z"
      ></path>
    </svg>
  ),
  // Phone/Message for WhatsApp Broadcast
  WhatsApp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26c.55.37 1.21.37 1.76 0L21 8m-2 10H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z"
      ></path>
    </svg>
  ),
  // Box for Inventory
  Inventory: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 7V5c0-1.1-.9-2-2-2H6a2 2 0 00-2 2v2M4 11v-4M20 11v-4M6 11H4a2 2 0 00-2 2v2m2 4v-2m14 2v-2m-10 2h6m-3-6v-2m0 4v2m-3-6h6m-3-4v-2M4 15h16a2 2 0 002-2v-2a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"
      ></path>
    </svg>
  ),
};

const serviceNodes = [
  { label: "Workflow Automation", icon: ICONS.Workflow, top: "15%", left: "10%" },
  { label: "Data Extraction", icon: ICONS.Document, top: "5%", left: "30%" },
  { label: "Chatbot & Customer Support", icon: ICONS.Chatbot, top: "15%", left: "55%" },
  { label: "Marketing Automation", icon: ICONS.Marketing, top: "35%", left: "75%" },
  { label: "Integration & API Development", icon: ICONS.Integration, top: "60%", left: "80%" },
  { label: "Document Processing", icon: ICONS.Document, top: "80%", left: "65%" },
  { label: "WhatsApp Broadcast & Workflow", icon: ICONS.WhatsApp, top: "85%", left: "40%" },
  { label: "Inventory & Stock Monitoring", icon: ICONS.Inventory, top: "50%", left: "5%" },
];

const HeroSection3d = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* --- CSS Keyframes dan Styles --- */}
      <style>
        {`
                /* Data Flow Line Shine Animation */
                @keyframes flow-animation {
                    to {
                        stroke-dashoffset: 400; 
                    }
                }

                /* Client Marquee Animation */
                @keyframes marquee-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); } /* Menggeser 50% untuk menduplikasi logo */
                }
                .client-marquee {
                    animation: marquee-scroll 40s linear infinite;
                }
                .client-marquee:hover {
                    animation-play-state: paused; /* Berhenti saat hover */
                }

                /* Jalur Dasar (Abu-abu) - Lebih tebal agar terlihat solid */
                .static-line {
                    stroke: #4b5563; /* Abu-abu netral */
                    stroke-width: 1; /* Lebih tebal */
                    opacity: 0.5;
                }

                /* Jalur Animasi (Cyan) - Lebih tipis, bergerak di atas jalur dasar */
                .animated-flow {
                    stroke: #00ffff; /* Warna cyan aktif */
                    stroke-width: 0.5; 
                    stroke-dasharray: 40 360; 
                    stroke-dashoffset: 0;
                    animation: flow-animation 10s linear infinite;
                    filter: url(#glow);
                }
                
                /* Garis bersinar ketika node di-hover */
                .line-active {
                    stroke: #00ffff; /* Warna cyan aktif */
                    filter: url(#glow);
                }

                /* Background Grid Animation (Subtle Scroll) */
                @keyframes grid-scroll {
                    from {
                        transform: 
                            rotateX(60deg) 
                            rotateZ(-45deg) 
                            translateY(200px) 
                            translateX(200px)
                            scale(3);
                    }
                    to {
                        transform: 
                            rotateX(60deg) 
                            rotateZ(-45deg) 
                            translateY(170px) 
                            translateX(170px)
                            scale(3);
                    }
                }

                /* Node Styling & 3D Hover */
                .diagram-node-wrapper {
                    position: absolute;
                    transform-style: preserve-3d;
                    cursor: pointer;
                    transition: transform 0.3s ease-out; /* Smooth transform transition for rotation */
                }
                .diagram-node {
                    padding: 0.5rem;
                    background-color: rgba(17, 24, 39, 0.9);
                    border: 1px solid rgba(55, 65, 81, 0.5);
                    border-radius: 0.5rem;
                    text-align: center;
                    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 180, 255, 0.1);
                    transition: all 0.3s ease-out;
                    z-index: 10;
                    width: 3.5rem; /* Ukuran kotak kecil untuk ikon */
                    height: 3.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #38bdf8;
                }
                
                /* Node Hover Effects: Green Glow, Lift, and Camera Focus */
                .diagram-node-wrapper:hover {
                    /* Tambahkan rotasi ringan untuk ilusi 3D fokus */
                    transform: translate(-50%, -50%) translateY(-5px) rotateX(-5deg) rotateY(5deg);
                }
                .diagram-node-wrapper:hover .diagram-node {
                    box-shadow: 0px 6px 20px rgba(0, 255, 0, 0.4), 0 0 25px rgba(0, 255, 0, 0.7);
                    border-color: rgba(0, 255, 0, 0.7);
                    color: #90ee90;
                }

                /* Efek Fokus Kamera (Pseudo-elements) */
                .diagram-node-wrapper:hover .diagram-node:before,
                .diagram-node-wrapper:hover .diagram-node:after {
                    content: '';
                    position: absolute;
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid #00ffff; 
                    z-index: 5;
                    transition: all 0.3s ease-out;
                }

                /* Top-Left Corner */
                .diagram-node-wrapper:hover .diagram-node:before {
                    top: -6px; left: -6px;
                    border-right: none;
                    border-bottom: none;
                }

                /* Bottom-Right Corner */
                .diagram-node-wrapper:hover .diagram-node:after {
                    bottom: -6px; right: -6px;
                    border-left: none;
                    border-top: none;
                }
                
                /* Specific styles for the central 'AI' node */
                .central-node {
                    width: 5rem; /* Ukuran kotak AI */
                    height: 5rem;
                    border-radius: 0.5rem; /* Menjadi kotak dengan sedikit rounded */
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 50px rgba(0, 255, 255, 0.5);
                    color: #ffffff;
                    border: 2px solid #00ffff;
                    background-color: rgba(0, 255, 255, 0.1);
                    transition: all 0.3s;
                    z-index: 20; /* Z-index tertinggi agar di atas semua garis */
                    transform-style: preserve-3d;
                    /* FIX: Menambahkan translate(-50%, -50%) agar elemen berada di tengah */
                    transform: translate(-50%, -50%) rotateX(0deg) rotateZ(0deg); 
                }
                .central-node:hover {
                    /* Hover dilakukan via JS untuk menimpa 3D transform */
                    cursor: default; /* Menghapus pointer cursor */
                }
                `}
      </style>

      {/* --- Konten Utama (di atas background) --- */}
      <div className="relative z-10 min-h-screen">
        {/* Bagian Hero dan Diagram */}
        <main className="w-full flex justify-center items-center pt-24 px-6 md:px-12">
          <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center">
            {/* Kiri: Headline Text */}
            <div className="lg:w-1/2 lg:pr-12 max-w-2xl text-center lg:text-left mb-16 lg:mb-0">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter mb-6 max-w-4xl">
                Otomatiskan Bisnis Anda dengan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  AI Mutakhir
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl lg:mx-0 mx-auto">
                Solusi end-to-end untuk efisiensi workflow, mulai dari *data extraction* hingga
                *marketing automation*.
              </p>
              <button className="px-8 py-3 bg-cyan-600 text-black font-bold rounded-xl text-lg hover:bg-cyan-700 transition duration-200">
                Jelajahi Solusi Kami
              </button>
              <div className="mt-8 text-sm text-gray-400 space-y-2">
                <p>Layanan yang difokuskan:</p>
                <ul className="flex flex-wrap gap-2 text-cyan-300">
                  {serviceNodes.map((node) => (
                    <li key={node.label} className="px-2 py-0.5 bg-gray-800 rounded-full text-xs">
                      {node.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Kanan: Diagram 3D Isometric */}
            <div className="lg:w-1/2 flex justify-center items-center">
              <div id="diagram-container" className="w-full h-[600px] max-w-lg relative">
                <div
                  id="isometric-diagram"
                  className="relative w-full h-full"
                  style={{
                    transform: "rotateX(60deg) rotateZ(-45deg) scale(0.9)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* SVG Lines (Tali Pengikat Node ke Pusat AI) - FIX: Z-index diturunkan */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ zIndex: 10 }}
                  >
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="0.15" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Jalur Dasar Statis (Background Line) */}
                    {serviceNodes.map((node, index) => (
                      <path
                        key={`base-${index}`}
                        d={`M 50 50 L ${node.left.replace("%", "")} ${node.top.replace("%", "")}`}
                        stroke="#4b5563"
                        strokeWidth="1"
                        fill="none"
                        className="static-line"
                      />
                    ))}

                    {/* Garis Animasi Flow (Foreground Line) */}
                    {serviceNodes.map((node, index) => (
                      <path
                        key={`flow-${index}`}
                        d={`M 50 50 L ${node.left.replace("%", "")} ${node.top.replace("%", "")}`}
                        stroke="#00ffff"
                        strokeWidth="0.5"
                        fill="none"
                        className="animated-flow"
                        filter="url(#glow)"
                        style={{ animationDelay: `${index * 0.5}s` }}
                      />
                    ))}
                  </svg>

                  {/* Node Sentral 'AI' (Kotak Zoomable) - Z-index 20 di CSS memastikan ini paling atas */}
                  <div
                    className="absolute top-1/2 left-1/2 w-28 h-28 flex items-center justify-center central-node"
                    onMouseEnter={(e) => {
                      // Efek zoom dan flattening 2D
                      e.currentTarget.style.transform =
                        "translate(-50%, -50%) scale(1.1) rotateX(0deg) rotateZ(0deg)";
                      e.currentTarget.style.boxShadow =
                        "0 0 40px rgba(255, 255, 0, 0.9), 0 0 70px rgba(255, 255, 0, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      // Kembali ke keadaan awal
                      e.currentTarget.style.transform =
                        "translate(-50%, -50%) scale(1) rotateX(0deg) rotateZ(0deg)";
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(0, 255, 255, 0.8), 0 0 50px rgba(0, 255, 255, 0.5)";
                    }}
                  >
                    <span className="text-5xl font-extrabold">AI</span>
                  </div>

                  {/* Node Layanan (Nodes) */}
                  {serviceNodes.map((node, index) => (
                    // Wrapper digunakan untuk menahan positioning dan 3D transform hover
                    <div
                      key={index}
                      className="diagram-node-wrapper"
                      style={{ top: node.top, left: node.left, transform: "translate(-50%, -50%)" }}
                    >
                      <div className="diagram-node relative">
                        {/* Ikon di tengah kotak */}
                        <node.icon className="w-7 h-7" />
                        {/* Label teks kecil di bawah ikon (opsional) */}
                        <span className="absolute -bottom-5 text-[10px] text-gray-400 whitespace-nowrap rotate-[45deg] origin-left">
                          {node.label.split(" ")[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <ClientMarquee />
      </div>
    </div>
  );
};

export default HeroSection3d;
