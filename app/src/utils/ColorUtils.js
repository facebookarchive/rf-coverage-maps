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

type rgb = [number, number, number];


// heatmap color gradient
export const COLORS = {
  heat10: [215, 48, 39],
  heat20: [244, 109, 67],
  heat30: [253, 174, 97],
  heat40: [254, 224, 144],
  heat50: [224, 243, 248],
  heat60: [171, 217, 233],
  heat70: [116, 173, 209],
  heat80: [69, 117, 180],
  heat90: [128, 128, 128],
  heat100: [64, 64, 64],
};

export function getRGB(
  startColor: Array<number>,
  endColor: Array<number>,
  weight: number,
): [number, number, number, number | void] {
  const inverseWeight = 1 - weight;
  const rgb = [
    Math.round(startColor[0] * weight + endColor[0] * inverseWeight),
    Math.round(startColor[1] * weight + endColor[1] * inverseWeight),
    Math.round(startColor[2] * weight + endColor[2] * inverseWeight),
  ];
  return [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]), 255];
}
