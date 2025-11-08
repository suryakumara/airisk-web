import React from "react";
import Header from "./components/Header/Header";
import HeroSection from "./components/Hero/HeroSection";
import ProblemSection from "./components/ProblemSection/ProblemSection";
import "./styles/global.css";
import "./styles/cursor.css";
import "./App.css";

// Register ScrollToPlugin with GSAP
// gsap.registerPlugin(ScrollToPlugin);

const App: React.FC = () => {
  // Main app component

  return (
    <div className="bg-black">
      <Header />
      <main className="bg-black min-h-screen">
        <HeroSection />
        <ProblemSection />
        <section className="py-20 text-center container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6">
            What will you <span className="text-purple-400">build?</span>
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            The possibilities are endless. Here are a few ideas.
          </p>
        </section>
      </main>
    </div>
  );
};

export default App;
