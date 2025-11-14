export type PrizeCard = {
  id: string;
  image: string;
  promo: string;
  alt: string;
};

export const PRIZE_CARDS: PrizeCard[] = [
  {
    id: "P1",
    image: "/prize/scratch-card-after-effets-10-off.png",
    promo: "10% off bookings",
    alt: "10% off bookings",
  },
  {
    id: "P2",
    image: "/prize/scratch-card-after-effets-free-uplights.png",
    promo: "Free Uplights",
    alt: "Free Uplights",
  },
  {
    id: "P3",
    image: "/prize/scratch-card-after-effets-holy-cannoli.png",
    promo: "Holy Cannoli",
    alt: "Holy Cannoli",
  },
  {
    id: "P4",
    image: "/prize/scratch-card-after-effets-hot-cocoa-cart.png",
    promo: "Hot Cocoa Cart",
    alt: "Hot Cocoa Cart",
  },
];

export const STORAGE_PRIZE_ID_KEY = "48wall_scratch_prize_id";
export const STORAGE_SCRATCH_DONE_KEY = "48wall_scratch_done";
