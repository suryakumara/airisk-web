import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/global.css";
import Header from "./components/Header/Header";
import HeroSection3d from "./components/Hero/HeroSection3d";
import ProblemSection from "./components/ProblemSection/ProblemSection";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

const LandingPage: React.FC = () => (
  <div className="bg-black">
    <Header />
    <main className="bg-black min-h-screen">
      <HeroSection3d />
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

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
