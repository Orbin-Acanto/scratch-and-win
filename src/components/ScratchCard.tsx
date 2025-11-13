import React from "react";
import { triggerHolidayConfetti } from "../utils/confetti";

const ScratchCard: React.FC = () => {
  const handleScratchComplete = () => {
    triggerHolidayConfetti();
  };
  return (
    <div className="relative z-20 animate-fade-in-up flex justify-center">
      <img
        src="/48-wall-scratch-card.png"
        alt="Holiday scratch card placeholder"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl object-contain"
        onClick={handleScratchComplete}
      />
    </div>
  );
};

export default ScratchCard;
