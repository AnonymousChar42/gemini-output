import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sf-red rounded-sm transform rotate-45 flex items-center justify-center">
                 <span className="text-white font-bold transform -rotate-45 text-xs">SF</span>
            </div>
            <span className="font-tech font-bold text-xl tracking-wider text-white">
                AIRLINES
            </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
            {['Global Network', 'Fleet', 'Solutions', 'Technology', 'About Us'].map((item) => (
                <a 
                    key={item} 
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-sf-blue transition-colors text-sm font-medium tracking-wide relative group"
                >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sf-blue transition-all group-hover:w-full"></span>
                </a>
            ))}
            <button className="px-5 py-2 border border-sf-blue text-sf-blue hover:bg-sf-blue hover:text-white transition-all rounded-sm font-tech text-sm">
                TRACKING
            </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel absolute w-full border-t border-gray-800">
            <div className="flex flex-col p-4 space-y-4">
                 {['Global Network', 'Fleet', 'Solutions', 'Technology', 'About Us'].map((item) => (
                    <a 
                        key={item}
                        href="#" 
                        className="text-gray-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {item}
                    </a>
                ))}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
