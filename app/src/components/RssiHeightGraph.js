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

import '../../node_modules/react-vis/dist/style.css';
import * as React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import {
  DiscreteColorLegend,
  HorizontalGridLines,
  MarkSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';
import {useState} from 'react';

import type {LayerDict} from '../screens/MapScreen';

type Props = {customLayers: LayerDict};

function RssiHeightGraph(props: Props): React.Node {
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const customLayers = props.customLayers;
  const noData = Object.keys(customLayers).length === 0;

  return (
    <>
      <Accordion
        expanded={showGraph}
        onChange={() => setShowGraph(isShown => !isShown)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel-filters">
          <Typography>RSSI/Height Graph</Typography>
        </AccordionSummary>
        {noData ? (
          <Typography style={{padding: 16}}>
            No layers! Add some files to get started!
          </Typography>
        ) : null}
        {showGraph && !noData ? (
          <XYPlot width={500} height={500}>
            <DiscreteColorLegend
              style={{top: 0, left: '12%', position: 'absolute'}}
              items={Object.keys(customLayers)}
            />
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis title="Drone Height (m, ALGL)" />
            <YAxis title="Path Loss (dB)" />
            {Object.keys(customLayers).map(name => (
              <MarkSeries
                key={'markseries' + name}
                data={customLayers[name].xydata}
                opacity={customLayers[name].visible ? 1 : 0}
                size={1}
              />
            ))}
          </XYPlot>
        ) : null}
      </Accordion>
    </>
  );
}
export default RssiHeightGraph;
