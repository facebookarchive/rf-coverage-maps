/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */
const svgGlow = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path d="M 20,12.6 18.59,11.19 13,16.77 V 0 H 11 V 16.77 L 5.42,11.18 4,12.6 l 8,8 z" style="filter: url(#glow);" />
</svg>`;
const svgPlain = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
  <path d="M 20,12.6 18.59,11.19 13,16.77 V 0 H 11 V 16.77 L 5.42,11.18 4,12.6 l 8,8 z"/>
</svg>`;

function getArrow(glow: boolean): HTMLImageElement {
  // The xmlns MUST be present.
  const blob = new Blob([glow ? svgGlow : svgPlain], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const Arrow = document.createElement('img');
  Arrow.src = url;
  Arrow.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});
  return Arrow;
}

export default getArrow;
