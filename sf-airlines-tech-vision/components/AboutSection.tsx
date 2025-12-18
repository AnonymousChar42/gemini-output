import React from 'react';
import { motion } from 'framer-motion';
import { STATS } from '../constants';

const AboutSection: React.FC = () => {
  return (
    <section id="about-us" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sf-dark to-slate-900 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-sf-blue/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-sf-orange/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="flex items-center space-x-2 mb-4">
                    <div className="h-0.5 w-10 bg-sf-orange"></div>
                    <span className="text-sf-orange font-tech text-sm tracking-widest uppercase">Intelligent Logistics</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-tech leading-tight">
                    Connecting the World <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sf-blue to-white">
                        At The Speed of Light
                    </span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    SF Airlines operates China's largest all-cargo aircraft fleet. We leverage cutting-edge aviation technology, AI-driven route optimization, and a massive global network to deliver your promises.
                </p>
                <button className="group relative px-6 py-3 bg-white text-sf-dark font-bold font-tech hover:bg-sf-silver transition-colors overflow-hidden">
                    <span className="relative z-10">EXPLORE FLEET</span>
                    <div className="absolute inset-0 h-full w-full bg-sf-blue/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {STATS.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-6 rounded-sm border-l-2 border-transparent hover:border-sf-blue transition-all group hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon className="w-8 h-8 text-sf-blue group-hover:text-sf-orange transition-colors" />
                            <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:animate-pulse group-hover:bg-sf-orange"></div>
                        </div>
                        <div className="text-3xl font-bold font-tech mb-1 text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400 uppercase tracking-wide">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
