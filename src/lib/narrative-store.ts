import { create } from "zustand";

export type GuideState =
  | "idle"
  | "curious"
  | "following"
  | "excited"
  | "building"
  | "working"
  | "done";

export type DeviceCapability = "high" | "low";

export const CHAPTERS = [
  { id: "idea", label: "Idea" },
  { id: "workshop", label: "Workshop" },
  { id: "build", label: "Build" },
  { id: "products", label: "Products" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

interface NarrativeState {
  currentChapter: ChapterId;
  guideState: GuideState;
  reducedMotion: boolean;
  deviceCapability: DeviceCapability;
  guideEscaped: boolean;
  ctaRequestId: number;
  ctaPrefill: string;
  setChapter: (id: ChapterId) => void;
  setGuideState: (state: GuideState) => void;
  setReducedMotion: (value: boolean) => void;
  setDeviceCapability: (value: DeviceCapability) => void;
  setGuideEscaped: (value: boolean) => void;
  requestCta: (text?: string) => void;
}

export const useNarrativeStore = create<NarrativeState>((set) => ({
  currentChapter: "idea",
  guideState: "idle",
  reducedMotion: false,
  deviceCapability: "high",
  guideEscaped: false,
  ctaRequestId: 0,
  ctaPrefill: "",
  setChapter: (id) => set({ currentChapter: id }),
  setGuideState: (state) => set({ guideState: state }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setDeviceCapability: (value) => set({ deviceCapability: value }),
  setGuideEscaped: (value) => set({ guideEscaped: value }),
  requestCta: (text) =>
    set((s) => ({ ctaRequestId: s.ctaRequestId + 1, ctaPrefill: text ?? "" })),
}));
