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

import * as React from 'react';
import {useState} from 'react';
import Button from '@material-ui/core/Button';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  MarkSeries,
} from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';

import type {LayerDict} from '../screens/MapScreen';

type Props = {customLayers: LayerDict};

function RssiHeightGraph(props: Props): React.Node {
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const customLayers = props.customLayers;
  return (
    <>
      {Object.keys(customLayers).length ? (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowGraph(isShown => !isShown)}>
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </Button>
      ) : null}
      {showGraph ? (
        <XYPlot width={500} height={500}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis title="Drone Height (m, ALGL)" />
          <YAxis title="Path Loss (dB)" />
          {Object.keys(customLayers).map(name => (
            <MarkSeries
              data={customLayers[name].xydata}
              opacity={customLayers[name].visible ? 1 : 0}
              size={1}
            />
          ))}
        </XYPlot>
      ) : null}
    </>
  );
}
export default RssiHeightGraph;
