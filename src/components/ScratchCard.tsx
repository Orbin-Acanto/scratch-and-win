import React, { useEffect, useRef, useState } from "react";
import {
  PRIZE_CARDS,
  STORAGE_PRIZE_ID_KEY,
  STORAGE_SCRATCH_DONE_KEY,
  type PrizeCard,
} from "../data/prizeCards";
import { triggerHolidayConfetti } from "../utils/confetti";

const SCRATCH_RADIUS = 24;
const COMPLETE_THRESHOLD = 0.55;
const GOLD_COVER_SRC = "/prize/scratch-card-after-effets-label-gold.png";

const ENABLE_PERSISTENCE = true;

type ContactInfo = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

const ScratchCard: React.FC = () => {
  const [card, setCard] = useState<PrizeCard | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [cardLoaded, setCardLoaded] = useState(false);
  const [contact, setContact] = useState<ContactInfo>({
    email: null,
    firstName: null,
    lastName: null,
  });

  const [showTerms, setShowTerms] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email");
    const firstName = params.get("first_name");
    const lastName = params.get("last_name");

    setContact({ email, firstName, lastName });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!ENABLE_PERSISTENCE) {
      const random =
        PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
      setCard(random);
      setIsScratched(false);
      return;
    }

    const storedId = window.localStorage.getItem(STORAGE_PRIZE_ID_KEY);
    if (storedId) {
      const found = PRIZE_CARDS.find((p) => p.id === storedId);
      if (found) {
        setCard(found);
      } else {
        const random =
          PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
        setCard(random);
        window.localStorage.setItem(STORAGE_PRIZE_ID_KEY, random.id);
      }
    } else {
      const random =
        PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
      setCard(random);
      window.localStorage.setItem(STORAGE_PRIZE_ID_KEY, random.id);
    }

    const done =
      window.localStorage.getItem(STORAGE_SCRATCH_DONE_KEY) === "true";
    setIsScratched(done);
  }, []);

  useEffect(() => {
    if (isScratched || !cardLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const img = new Image();
      img.src = GOLD_COVER_SRC;
      img.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        ctxRef.current = ctx;
      };
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [isScratched, cardLoaded]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    const dpr = window.devicePixelRatio || 1;
    const radius = SCRATCH_RADIUS * dpr;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const sendRedemption = (promo?: string) => {
    if (!promo) return;

    const payload = {
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      promo,
    };

    fetch(
      "https://orbin23.app.n8n.cloud/webhook-test/04c337fd-96b7-48c8-ae7d-75fe7e2e4513",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).catch((err) => {
      console.error("Failed to send promo redemption", err);
    });
  };

  const maybeCheckCompletion = (force = false) => {
    const now = performance.now();
    if (!force && now - lastCheckRef.current < 300) return;
    lastCheckRef.current = now;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let transparentCount = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }

    const ratio = transparentCount / total;

    if (ratio > COMPLETE_THRESHOLD) {
      setIsScratched(true);

      if (ENABLE_PERSISTENCE && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_SCRATCH_DONE_KEY, "true");
      }

      // send email + promo to backend
      sendRedemption(card?.promo);

      triggerHolidayConfetti();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isScratched) return;
    e.preventDefault();
    isDrawingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
    maybeCheckCompletion();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isScratched) return;
    e.preventDefault();
    scratchAt(e.clientX, e.clientY);
    maybeCheckCompletion();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    maybeCheckCompletion(true);
  };

  const showCanvas = !isScratched;

  return (
    <>
      <div className="relative z-20 animate-fade-in-up flex justify-center px-4">
        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
          {card && (
            <img
              src={card.image}
              alt={card.alt}
              className="w-full h-auto block"
              onLoad={() => setCardLoaded(true)}
            />
          )}

          <div
            className="absolute"
            style={{
              left: "50%",
              top: "68%",
              transform: "translate(-50%, -50%)",
              width: "45%",
              height: "32%",
              cursor: showCanvas
                ? 'url("/coin.png") 16 16, pointer'
                : "default",
            }}
          >
            {showCanvas && (
              <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none rounded-md"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShowTerms(true)}
          className="text-[11px] sm:text-xs text-whitesmoke/80 underline underline-offset-2 hover:text-whitesmoke transition-colors"
        >
          Terms &amp; Conditions apply
        </button>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-fade-in">
          <div className="relative w-full max-w-md  bg-white shadow-2xl p-7 border border-neutral-200/40 animate-scale-in">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="absolute right-4 top-4 p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
              aria-label="Close terms and conditions"
            >
              ✕
            </button>

            <h2 className="text-center text-lg font-semibold tracking-wide text-neutral-800 mb-1">
              Promotion Terms & Conditions
            </h2>

            <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-primary" />

            <div className="space-y-3 text-[13px] text-neutral-700 leading-relaxed text-left">
              <p>
                Offer is valid for new qualified event bookings only and cannot
                be applied to existing contracts.
              </p>

              <p>
                One scratch-card reward per email address and per event. This
                offer is non-transferable and has no cash value.
              </p>

              <p>
                Prize must be redeemed at the time of contract signing and is
                subject to date, vendor, and venue availability.
              </p>

              <p>
                Promotion cannot be combined with other discounts or offers
                unless explicitly permitted in writing.
              </p>

              <p>
                Reward is valid only for events booked within the promotional
                period and must match the name on the scratch card.
              </p>

              <p>
                The venue reserves the right to modify, cancel, or withdraw this
                promotion at any time without prior notice.
              </p>

              <p>
                By participating, you consent to being contacted regarding your
                event inquiry and booking confirmation.
              </p>
            </div>

            {/* Footer */}
            <p className="mt-5 text-[11px] text-neutral-500 text-center">
              By scratching and redeeming this reward, you agree to these terms.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ScratchCard;
