import React from "react";

const Navbar: React.FC = () => {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-800/20 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-[88px] items-center justify-center">
            <a href="https://www.48wallnyc.com/" className="flex items-center">
              <img
                src="/logo/48-wall-logo.svg"
                alt="48 Wall Street"
                className="h-16 w-auto"
              />
            </a>
          </div>
        </div>
      </nav>

      <div className="bg-primary fixed top-[88px] right-0 left-0 z-10 h-0.5"></div>
    </>
  );
};

export default Navbar;
