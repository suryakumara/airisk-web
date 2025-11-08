import React, { useRef } from "react";
import { FaBrain, FaChartLine, FaShieldAlt, FaRocket } from "react-icons/fa";
import CNNVisualization from "../CNNVisualization/CNNVisualization";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FaBrain className="text-3xl text-blue-400" />,
    title: "Deep Learning Integration",
    description:
      "Advanced CNN architecture for real-time visual processing and pattern recognition.",
  },
  {
    icon: <FaChartLine className="text-3xl text-green-400" />,
    title: "Performance Optimization",
    description: "High-throughput processing with optimized neural network layers.",
  },
  {
    icon: <FaShieldAlt className="text-3xl text-purple-400" />,
    title: "Robust Architecture",
    description: "Enterprise-grade reliability with built-in error handling and recovery.",
  },
  {
    icon: <FaRocket className="text-3xl text-pink-400" />,
    title: "Scalable Solution",
    description: "Easily scale from prototype to production with our flexible infrastructure.",
  },
];

const ProblemSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="py-24 px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* CNN Visualization */}
          <div className="relative h-[600px] bg-black/20 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <CNNVisualization />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">Advanced CNN Architecture</h2>
              <p className="text-xl text-gray-300">
                Our cutting-edge Convolutional Neural Network delivers state-of-the-art performance
                for complex visual processing tasks.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">{feature.icon}</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
