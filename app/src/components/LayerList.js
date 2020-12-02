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

import type {LayerDict} from '../screens/MapScreen';

import * as React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Checkbox from '@material-ui/core/Checkbox';

import {useMemo, useRef, useState} from 'react';

type Props = {
  setCustomLayers: ((LayerDict => LayerDict) | LayerDict) => void,
  customLayers: LayerDict,
};

export default function LayerList(props: Props): React.Node {
  const {customLayers, setCustomLayers} = props;
  if (!Object.keys(customLayers).length) {
    return null;
  }

  return (
    <Accordion defaultExpanded={true}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header">
        <Typography>Layers</Typography>
      </AccordionSummary>
      <List dense={true}>
        {Object.keys(customLayers).map(name => {
          const onClick = (shouldDelete: boolean) => () =>
            setCustomLayers(prevLayers => {
              const newLayer = {...prevLayers};
              if (shouldDelete) {
                delete newLayer[name];
              } else {
                const layer = newLayer[name];
                layer.visible = !layer.visible;
                newLayer[name] = layer;
              }
              return newLayer;
            });
          return (
            <ListItem
              key={name}
              role={undefined}
              dense
              button
              onClick={onClick(false)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={customLayers[name].visible}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{'aria-labelledby': name}}
                />
              </ListItemIcon>
              <ListItemText primary={name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={onClick(true)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Accordion>
  );
}
