"use client";

import { useCallback } from "react";
import { registerOrbAnchor, unregisterOrbAnchor } from "@/lib/orb-anchors";

export function useOrbAnchor(id: string) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) registerOrbAnchor(id, el);
      else unregisterOrbAnchor(id);
    },
    [id]
  );
}
