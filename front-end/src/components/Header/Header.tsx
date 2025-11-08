import React from "react";

const Header: React.FC = () => (
  <header className="fixed top-0 left-0 right-0 z-50 text-white">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="text-xl font-bold tracking-wider">[LOGO]</div>
      <nav className="hidden md:flex space-x-6 items-center text-sm font-medium text-gray-300">
        <a href="#problem-section" className="hover:text-white transition-colors">
          Pain Points
        </a>
        <a href="#solution-section" className="hover:text-white transition-colors">
          Solution / How It Works
        </a>
        <a href="#features-section" className="hover:text-white transition-colors">
          Key Features
        </a>
        <a href="#benefits-section" className="hover:text-white transition-colors">
          Benefits
        </a>
        <a href="#case-studies-section" className="hover:text-white transition-colors">
          Case Studies
        </a>
        <a href="#pricing-section" className="hover:text-white transition-colors">
          Pricing Plans
        </a>
      </nav>
      <div className="flex items-center space-x-4">
        <a
          href="#"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Sign In
        </a>
        <a
          href="#"
          className="bg-white text-black text-sm font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Start for free
        </a>
      </div>
    </div>
  </header>
);

export default Header;
