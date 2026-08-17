import {
  forwardRef,
  useId,
  useState,
  useEffect,
  type CSSProperties,
} from "react";
import "./liquid-button.css";

/* ------------------------------------------------------------------
   LiquidButton — "liquid glass": an SVG feTurbulence/feDisplacementMap
   filter applied to the button backdrop via backdrop-filter url(#…),
   layered over a glass bevel (light/dark shadow stacks).
   Zero-dependency port of the shadcn/ui liquid-glass-button.
   ---------------------------------------------------------------- */

type LiquidVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type LiquidSize = "default" | "sm" | "lg" | "xl" | "xxl" | "icon";

const LIQUID_VARIANT: Record<LiquidVariant, string> = {
  default: "lb-v-default",
  destructive: "lb-v-destructive",
  outline: "lb-v-outline",
  secondary: "lb-v-secondary",
  ghost: "lb-v-ghost",
  link: "lb-v-link",
};

const LIQUID_SIZE: Record<LiquidSize, string> = {
  default: "lb-s-default",
  sm: "lb-s-sm",
  lg: "lb-s-lg",
  xl: "lb-s-xl",
  xxl: "lb-s-xxl",
  icon: "lb-s-icon",
};

type LiquidButtonProps = React.ComponentProps<"button"> & {
  variant?: LiquidVariant;
  size?: LiquidSize;
  href?: string;
};

function GlassFilter({ id }: { id: string }) {
  return (
    <svg className="lb-glass-svg" aria-hidden="true">
      <defs>
        <filter
          id={id}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ variant = "default", size = "xxl", href, className = "", children, ...rest }, ref) => {
    const id = `lbg-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const cls = `lb-glass ${LIQUID_VARIANT[variant]} ${LIQUID_SIZE[size]} ${className}`.trim();
    const layerStyle = {
      backdropFilter: `url("#${id}")`,
      WebkitBackdropFilter: `url("#${id}")`,
    } as CSSProperties;
    const inner = (
      <>
        <div className="lb-glass-layer" style={layerStyle} />
        <div className="lb-glass-bevel" />
        <span className="lb-glass-content">{children}</span>
        <GlassFilter id={id} />
      </>
    );
    if (href) {
      const { type: _t, disabled: _d, ...anchorRest } = rest;
      return (
        <a
          href={href}
          className={cls}
          {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      );
    }
    return (
      <button ref={ref} type="button" className={cls} {...rest}>
        {inner}
      </button>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

/* ------------------------------------------------------------------
   MetalButton — chunky gradient "metal" CTA with press/hover physics.
   ---------------------------------------------------------------- */

type MetalVariant = "default" | "primary" | "success" | "error" | "gold" | "bronze";

const METAL_VARIANT: Record<MetalVariant, string> = {
  default: "lb-mv-default",
  primary: "lb-mv-primary",
  success: "lb-mv-success",
  error: "lb-mv-error",
  gold: "lb-mv-gold",
  bronze: "lb-mv-bronze",
};

interface MetalButtonProps extends React.ComponentProps<"button"> {
  variant?: MetalVariant;
  href?: string;
}

const ShineEffect = ({ isPressed }: { isPressed: boolean }) => (
  <div
    className={`lb-m-shine${isPressed ? " is-pressed" : ""}`}
    aria-hidden="true"
  >
    <div className="lb-m-shine-bar" />
  </div>
);

export const MetalButton = forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ children, className = "", variant = "default", href, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    const transition = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";
    const origin = { transformOrigin: "center center" } as const;
    const outerStyle: CSSProperties = {
      transition,
      ...origin,
      transform: isPressed ? "translateY(2.5px) scale(0.99)" : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(0, 0, 0, 0.15)"
        : isHovered && !isTouchDevice
          ? "0 4px 12px rgba(0, 0, 0, 0.12)"
          : "0 3px 8px rgba(0, 0, 0, 0.08)",
    };
    const innerStyle: CSSProperties = {
      transition,
      ...origin,
      filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.05)" : "none",
    };
    const btnStyle: CSSProperties = {
      transition,
      ...origin,
      transform: isPressed ? "scale(0.97)" : "scale(1)",
      filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.02)" : "none",
    };

    const handlers = {
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseLeave: () => {
        setIsPressed(false);
        setIsHovered(false);
      },
      onMouseEnter: () => {
        if (!isTouchDevice) setIsHovered(true);
      },
      onTouchStart: () => setIsPressed(true),
      onTouchEnd: () => setIsPressed(false),
      onTouchCancel: () => setIsPressed(false),
    };

    const label = (
      <>
        <ShineEffect isPressed={isPressed} />
        {children}
        {isHovered && !isPressed && !isTouchDevice && (
          <div className="lb-m-hover-glow" aria-hidden="true" />
        )}
      </>
    );

    if (href) {
      return (
        <span className={`lb-m-outer ${METAL_VARIANT[variant]}`} style={outerStyle} role="presentation">
          <span className="lb-m-inner" style={innerStyle} />
          <a href={href} className={`lb-m-btn${className ? ` ${className}` : ""}`} style={btnStyle} {...handlers}>
            {label}
          </a>
        </span>
      );
    }

    return (
      <div className={`lb-m-outer ${METAL_VARIANT[variant]}${className ? ` ${className}` : ""}`} style={outerStyle}>
        <div className="lb-m-inner" style={innerStyle} />
        <button ref={ref} type="button" className="lb-m-btn" style={btnStyle} {...props} {...handlers}>
          {label}
        </button>
      </div>
    );
  }
);
MetalButton.displayName = "MetalButton";

export type { LiquidVariant, LiquidSize, MetalVariant };