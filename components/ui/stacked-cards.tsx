"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface StackedCardItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StackedCardsProps {
  cards: StackedCardItem[];
  cardSpacing?: number;
}

/**
 * A fanned deck of cards on larger screens: idle they sit in a loose overlapping stack,
 * hover/tap spreads the others aside and expands the selected one to reveal its description.
 * Below `sm` the absolute-positioned fan has no room to breathe (fixed card widths plus offsets
 * would push titles past the viewport edge), so mobile gets a plain static row instead —
 * same tap-to-expand behavior, just laid out in normal flow with no overlap.
 */
export function StackedCards({ cards, cardSpacing = 150 }: StackedCardsProps) {
  const [active, setActive] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isDesktop) {
    return <StaticStack cards={cards} active={active} onToggle={setActive} />;
  }

  return <FannedStack cards={cards} cardSpacing={cardSpacing} active={active} onToggle={setActive} containerRef={ref} />;
}

interface StackVariantProps {
  cards: StackedCardItem[];
  active: number | null;
  onToggle: (index: number | ((current: number | null) => number | null)) => void;
}

function StaticStack({ cards, active, onToggle }: StackVariantProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card, index) => {
        const isCurrent = active === index;
        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onToggle((current) => (current === index ? null : index))}
            className="flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              {card.icon}
            </span>
            <h3 className="text-xs font-semibold leading-tight">{card.title}</h3>
            <AnimatePresence mode="popLayout">
              {isCurrent && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] leading-snug text-muted-foreground"
                >
                  {card.description}
                </motion.p>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

function FannedStack({
  cards,
  cardSpacing,
  active,
  onToggle,
  containerRef,
}: StackVariantProps & { cardSpacing: number; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const middle = (cards.length - 1) / 2;
  const isAnyActive = active !== null;

  return (
    <div className="relative flex h-[320px] w-full items-center justify-center">
      <div
        ref={containerRef}
        onClick={() => onToggle(() => null)}
        className="relative mx-auto flex h-full w-full max-w-2xl items-center justify-center [--height:210px] [--width:175px]"
      >
        {cards.map((card, index) => {
          const offsetX = (index - middle) * cardSpacing;
          const isCurrent = active === index;

          return (
            <motion.button
              key={card.title}
              type="button"
              initial={{ scale: 0 }}
              animate={{
                x: isCurrent ? 0 : isAnyActive ? offsetX * 0.35 : offsetX,
                y: isCurrent ? -12 : 0,
                scale: isCurrent ? 1.1 : isAnyActive ? 0.85 : 1,
                zIndex: isCurrent ? 50 : cards.length - Math.abs(index - middle),
              }}
              whileHover={{ scale: isCurrent ? 1.1 : isAnyActive ? 0.85 : 1.04 }}
              transition={{ type: "spring", visualDuration: 0.5, bounce: 0.25 }}
              onClick={(event) => {
                event.stopPropagation();
                onToggle((current) => (current === index ? null : index));
              }}
              style={{
                width: "var(--width)",
                height: "var(--height)",
                marginLeft: "calc(var(--width) / -2)",
                marginTop: "calc(var(--height) / -2)",
              }}
              className="absolute top-1/2 left-1/2 flex cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                {card.icon}
              </span>
              <div>
                <h3 className="text-base font-semibold">{card.title}</h3>
                <AnimatePresence mode="popLayout">
                  {isCurrent && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-1.5 text-sm text-muted-foreground"
                    >
                      {card.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
