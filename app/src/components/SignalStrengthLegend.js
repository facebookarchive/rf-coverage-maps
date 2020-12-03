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
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import {DEFAULT_RANGE, TURBO_HEATMAP, getRGBCustom} from '../utils/ColorUtils';

import type {HeatmapType} from '../utils/ColorUtils';

type Props = {
  range: [number, number],
  heatmap: HeatmapType,
};

function SignalStrengthLegend(props: Props): React.Node {
  const [min, max] = props.range;
  const range = max - min;
  const bucketSize = range / (props.heatmap.length - 1);

  const values = [...new Array(props.heatmap.length)].map(
    (_, i) => max - bucketSize * i,
  );
  return (
    <List dense={true}>
      {values.map(value => (
        <ListItem key={value}>
          <ListItemAvatar>
            <Box
              style={{
                height: 20,
                width: 20,
                backgroundColor: `rgba(${getRGBCustom(
                  value,
                  min,
                  max,
                  props.heatmap,
                ).join(',')})`,
              }}
            />
          </ListItemAvatar>
          <ListItemText primary={'< ' + value + 'dBm'} />
        </ListItem>
      ))}
    </List>
  );
}
SignalStrengthLegend.defaultProps = {
  range: DEFAULT_RANGE,
  heatmap: TURBO_HEATMAP,
};

export default SignalStrengthLegend;
