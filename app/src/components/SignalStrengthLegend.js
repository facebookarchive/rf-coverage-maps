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

type Bucket = {
  color: number[],
  maxValue: number,
};

type Props = {
  buckets: Array<Bucket>,
};

function SignalStrengthLegend(props: Props): React.Node {
  return (
    <List dense={true}>
      {props.buckets.map(bucket => (
        <ListItem key={bucket.maxValue}>
          <ListItemAvatar>
            <Box
              style={{
                height: 20,
                width: 20,
                backgroundColor: `rgba(${bucket.color.join(',')},1)`,
              }}
            />
          </ListItemAvatar>
          <ListItemText primary={'< ' + bucket.maxValue + 'dBm'} />
        </ListItem>
      ))}
    </List>
  );
}

export default SignalStrengthLegend;
