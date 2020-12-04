/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 */

import type {RGBAColor} from '@deck.gl/core/utils/color';

export type RGB_Type = [number, number, number];
export type HeatmapType = Array<RGB_Type>;

export const DEFAULT_RANGE: [number, number] = [-105, -60];

// Heatmap color gradient, closely matching google's turbo, lowest to highest
export const TURBO_HEATMAP: HeatmapType = [
  [64, 64, 64],
  [128, 128, 128],
  [69, 117, 180],
  [116, 173, 209],
  [171, 217, 233],
  [224, 243, 248],
  [254, 224, 144],
  [253, 174, 97],
  [244, 109, 67],
  [215, 48, 39],
];

export function getRGBCustom(
  value: number,
  min: number,
  max: number,
  heatmap: HeatmapType,
): RGBAColor {
  // Remove bad values and clamp outliers.
  if (isNaN(value)) {
    return [0, 0, 0, 0];
  } else if (value <= min) {
    return [...heatmap[0], 255];
  } else if (value >= max) {
    return [...heatmap[heatmap.length - 1], 255];
  }
  const range = max - min;
  // We can only use areas between colors, thus 1 less than length
  const bucketSize = range / (heatmap.length - 1);

  // Scale value so we can do arithmetic on it
  const shiftedValue = value - min;
  const bucket = Math.floor(shiftedValue / bucketSize);
  // How far between the buckets is it, for interpolating between colors
  const inverseWeight = (shiftedValue - bucket * bucketSize) / bucketSize;
  const weight = 1 - inverseWeight;

  return [
    Math.round(
      heatmap[bucket][0] * weight + heatmap[bucket + 1][0] * inverseWeight,
    ),
    Math.round(
      heatmap[bucket][1] * weight + heatmap[bucket + 1][1] * inverseWeight,
    ),
    Math.round(
      heatmap[bucket][2] * weight + heatmap[bucket + 1][2] * inverseWeight,
    ),
    255, // alpha
  ];
}

export function getRGBTurbo(value: number): RGBAColor {
  return getRGBCustom(value, DEFAULT_RANGE[0], DEFAULT_RANGE[1], TURBO_HEATMAP);
}
