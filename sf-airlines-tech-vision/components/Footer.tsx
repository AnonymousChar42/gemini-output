import React from 'react';

const Footer = () => (
    <footer className="bg-black py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} SF Airlines. All Rights Reserved. 
                <span className="mx-2">|</span> 
                Privacy Policy 
                <span className="mx-2">|</span> 
                Terms of Service
            </p>
            <div className="mt-4 flex justify-center space-x-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-sf-red"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-sf-dark border border-white"></div>
            </div>
        </div>
    </footer>
)

export default Footer;
