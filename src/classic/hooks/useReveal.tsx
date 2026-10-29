import { Reveal as BaseReveal, useReveal, type RevealOptions, type RevealProps } from "../../hooks/useReveal";

/** Classic reveals start half a screen early, so content is already in place when it scrolls into view. */
const EARLY: RevealOptions = { rootMargin: "0px 0px 50% 0px", threshold: 0, failSafe: true };

export function Reveal(props: RevealProps) {
  return <BaseReveal {...props} options={{ ...EARLY, ...props.options }} />;
}

export { useReveal, type RevealOptions, type RevealProps };
