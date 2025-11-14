import React from "react";
import Navbar from "./components/Navbar";
import ScratchCard from "./components/ScratchCard";
import HolidayHeader from "./components/HolidayHeader";

const App: React.FC = () => {
  return (
    <>
      <Navbar />

      {/* Section below navbar */}
      <div className="relative mt-[87px] min-h-[calc(100vh-87px)] overflow-hidden text-neutral-900">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/background.png"
            alt="Holiday background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Main content */}
        <main className="relative flex items-center justify-center px-4 py-6">
          <section className="w-full text-center">
            <HolidayHeader />
            <ScratchCard />

            {/* Small line under the card */}
            <p className="mt-4 text-sm sm:text-base text-whitesmoke/80">
              Prize is valid from January 2026 through March 2026.
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default App;
