interface Anchor {
  id: string;
  el: HTMLElement;
  order: number;
}

const anchors: Anchor[] = [];
let orderCounter = 0;

export function registerOrbAnchor(id: string, el: HTMLElement) {
  const existing = anchors.find((a) => a.id === id);
  if (existing) {
    existing.el = el;
  } else {
    anchors.push({ id, el, order: orderCounter++ });
    anchors.sort((a, b) => a.order - b.order);
  }
}

export function unregisterOrbAnchor(id: string) {
  const idx = anchors.findIndex((a) => a.id === id);
  if (idx >= 0) anchors.splice(idx, 1);
}

export function getOrbAnchors() {
  return anchors;
}
