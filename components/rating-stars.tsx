"use client";

import { useState } from "react";

interface RatingStarsProps {
  maxRating?: number;
  color?: string;
  size?: number;
  className?: string;
  message?: string[];
  defaultRating?: number;
  rating?: number;
  onSetRating?: (rating: number) => void;
}

interface StarProps {
  onRate: () => void;
  full: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onArrowLeft: () => void;
  onArrowRight: () => void;
  color: string;
  size: number;
  index: number;
  currentRating: number;
  maxRating: number;
  hitSize: number;
  isFirst: boolean;
}

export default function RatingStars({
  maxRating = 5,
  color = "#f59e0b",
  size = 20,
  className = "",
  message = [],
  defaultRating = 0,
  rating: controlledRating,
  onSetRating,
}: RatingStarsProps) {
  const [uncontrolledRating, setUncontrolledRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);
  const ratingValue = controlledRating ?? uncontrolledRating;
  const selectedStars = Math.min(maxRating, Math.max(0, Math.round(ratingValue)));
  const activeStars = tempRating || selectedStars;
  const displayColor =
    activeStars <= 2 ? "#ef4444" : activeStars <= 3 ? "#f59e0b" : "#22c55e";
  const iconSize = Math.max(size + 6, 26);
  const hitSize = Math.max(iconSize + 18, 48);

  function handleRating(nextRating: number): void {
    if (controlledRating === undefined) {
      setUncontrolledRating(nextRating);
    }
    onSetRating?.(nextRating);
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        role="radiogroup"
        aria-label="Rate this movie"
        className="flex w-full items-center justify-between overflow-hidden rounded-xl border border-border/80 bg-background/85"
        style={activeStars > 0 ? { borderColor: `${displayColor}88` } : undefined}
      >
        {Array.from({ length: maxRating }, (_, index) => (
          <Star
            key={index}
            full={activeStars >= index + 1}
            onRate={() => handleRating(index + 1)}
            onArrowLeft={() =>
              handleRating(Math.max(1, (activeStars || 1) - 1))
            }
            onArrowRight={() =>
              handleRating(Math.min(maxRating, (activeStars || 0) + 1))
            }
            onHoverIn={() => setTempRating(index + 1)}
            onHoverOut={() => setTempRating(0)}
            color={activeStars > 0 ? displayColor : color}
            size={iconSize}
            index={index + 1}
            currentRating={activeStars}
            maxRating={maxRating}
            hitSize={hitSize}
            isFirst={index === 0}
          />
        ))}
      </div>
      <p
        className={`min-h-5 text-sm font-semibold leading-none ${
          activeStars > 0 ? "" : "invisible"
        }`}
        style={{ color: displayColor }}
      >
        {activeStars > 0
          ? message.length === maxRating
            ? `${message[Math.max(0, activeStars - 1)]} (${activeStars}/${maxRating})`
            : `${activeStars}/${maxRating}`
          : "placeholder"}
      </p>
    </div>
  );
}

function Star({
  onRate,
  full,
  onHoverIn,
  onHoverOut,
  onArrowLeft,
  onArrowRight,
  color,
  size,
  index,
  currentRating,
  maxRating,
  hitSize,
  isFirst,
}: StarProps) {
  const isActive = currentRating >= index;
  const activeStyles = isActive
    ? {
        borderColor: color,
        backgroundColor: `${color}22`,
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={onRate}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onFocus={onHoverIn}
      onBlur={onHoverOut}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onArrowLeft();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onArrowRight();
        }
      }}
      role="radio"
      aria-checked={currentRating === index}
      className={`inline-flex cursor-pointer items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 ${
        isFirst ? "" : "border-l border-l-border/80"
      } ${
        isActive
          ? "shadow-sm"
          : "bg-transparent hover:bg-secondary/45"
      }`}
      style={{
        width: hitSize,
        height: hitSize,
        minWidth: hitSize,
        flex: 1,
        ...activeStyles,
      }}
      aria-label={`Rate ${index} out of ${maxRating}`}
      aria-pressed={currentRating === index}
    >
      {full ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={color}
          stroke={color}
          width={size}
          height={size}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          width={size}
          height={size}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </button>
  );
}
