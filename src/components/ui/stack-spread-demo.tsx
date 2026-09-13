// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import StackSpread from "@/components/ui/stack-spread";

// drop into a routed page (or its <main>) and it will render the
// scroll-driven scatter showcase with the default configuration.

export function StackSpreadDemo() {
  return (
    <div>
      <StackSpread
        scrollLength={350}
        bgColor="#ececeb"
        clusterRotation
        stackScale={0.82}
        cardRadius={8}
        textColor="#141414"
        showScrollHint
      />
    </div>
  );
}

export default StackSpreadDemo;