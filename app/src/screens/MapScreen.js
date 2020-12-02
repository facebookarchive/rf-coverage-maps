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
import {useRef, useState} from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CacheMapsDialog from '../components/CacheMapsDialog';
import DeckGL from 'deck.gl';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {IconLayer} from '@deck.gl/layers';
import ReactMapGL, {NavigationControl} from 'react-map-gl';
import {makeStyles} from '@material-ui/core/styles';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  MarkSeries,
} from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Checkbox from '@material-ui/core/Checkbox';

import type {PickInfo} from '@deck.gl/core/lib/deck';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const MIN_ELEVATION = 10;
const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true},
};

type ViewState = {
  latitude: number,
  longitude: number,
  zoom: number,
  bearing: number,
  pitch: number,
};

type Point = {
  latitude: number,
  longitude: number,
  height: number,
  rssi: number,
  bearing: number,
  message: string,
};

type XYPoint = {
  x: number,
  y: number,
};

type HoverInfo = PickInfo<Point>;

type LayerInfo = {
  data: Array<Point>,
  xydata: Array<XYPoint>,
  visible: boolean,
};
type LayerDict = {[name: string]: LayerInfo};

function pointsToXY(points: Array<Point>): Array<XYPoint> {
  return points.map(point => {
    return {
      x: point.height,
      y: point.rssi,
    };
  });
}

function MapScreen(): React.Node {
  const [customLayers, setCustomLayers] = useState<LayerDict>({});
  const [graphData, setGraphData] = useState<?Array<XYPoint>>(null);
  const [hoverInfo, setHoverInfo] = useState<?HoverInfo>(null);
  const [minRssiToDisplay, setMinRssiToDisplay] = useState<?number>(0);
  const [maxRssiToDisplay, setMaxRssiToDisplay] = useState<?number>(0);
  const [mapStyle, setMapStyle] = useState<string>(
    'mapbox://styles/mapbox/satellite-v9',
  );
  const [satelliteView, setSatelliteView] = useState<boolean>(true);
  const [cacheMapDialogOpen, setCacheMapDialogOpen] = useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  // Initialize view to MPK Campus
  const [view, setView] = useState<ViewState>({
    latitude: 37.483175,
    longitude: -122.150084,
    zoom: 17,
    bearing: 0,
    pitch: 45,
  });

  let minRssi = -1000;
  let maxRssi = 0;
  const fileInput = useRef(null);

  function handleOpenClick() {
    fileInput.current && fileInput.current.click && fileInput.current.click();
  }

  function handleFile(e: SyntheticInputEvent<HTMLInputElement>) {
    const newLayers: LayerDict = {};
    setGraphData(null);
    const files = e.target.files;

    Array.from(files).forEach((file: File) => {
      const name = file.name;
      const reader = new FileReader();
      reader.onload = _e => {
        const content = reader.result;
        if (content !== null && typeof content === 'string') {
          const lines = processFileData(content);
          const xyPoints = pointsToXY(lines);
          newLayers[name] = {
            data: lines,
            visible: true,
            xydata: xyPoints,
          };
          setCustomLayers(newLayers);
          setView({
            latitude: lines[0].longitude,
            longitude: lines[0].latitude,
            zoom: 17,
            bearing: 0,
            pitch: 45,
          });
          setGraphData(xyPoints);
          setMinRssiToDisplay(minRssi);
          setMaxRssiToDisplay(maxRssi);
        }
      };
      reader.readAsText(file);
    });
  }

  function processFileData(allText) {
    // Parse CSV with the header format:
    // latitude, longitude, altitude, height, rssi, bearing, status, time
    const allTextLines = allText.split(/\r\n|\n/);
    const lines: Array<Point> = [];

    for (let i = 1; i < allTextLines.length; i++) {
      const data = allTextLines[i].split(',');
      // Pull out the fields needed
      const longitude: number = parseFloat(data[0]);
      const latitude: number = parseFloat(data[1]);
      const height: number = parseFloat(data[3]);
      const rssi: number = parseFloat(data[4]);
      const bearing: number = parseFloat(data[5]);

      if (height > MIN_ELEVATION) {
        if (typeof rssi === 'number' && rssi < maxRssi) {
          maxRssi = rssi;
        }
        if (typeof rssi === 'number' && rssi > minRssi) {
          minRssi = rssi;
        }
        lines.push({
          latitude,
          longitude,
          height,
          rssi,
          bearing,
          message:
            longitude +
            ', ' +
            latitude +
            ' ' +
            height +
            ' meters ' +
            rssi +
            'dBm ' +
            bearing +
            '\u00b0',
        });
      }
    }
    return lines;
  }

  function buildLayers() {
    const rangeFactor = (-1 * 255) / (maxRssi - minRssi);
    return Object.keys(customLayers).map(
      name =>
        new IconLayer<Point>({
          id: name,
          data: customLayers[name].data,
          visible: customLayers[name].visible,
          pickable: true,
          // iconAtlas and iconMapping are required
          iconAtlas: 'arrow.png',
          iconMapping: ICON_MAPPING,
          // getIcon: return a string
          getIcon: (_d: Point) => 'marker',
          sizeScale: 2,
          getPosition: (d: Point) => [d.latitude, d.longitude, d.height],
          getSize: 15,
          getColor: (d: Point) => {
            const red = parseInt(255 - (minRssi - d.rssi) * rangeFactor);
            const blue = 255 - red;
            const green = 255 - red - blue;
            return [red, green, blue, 255];
          },
          getAngle: (d: Point) => 180 - d.bearing,
          billboard: false,
          onHover: info => setHoverInfo(info),
        }),
    );
  }

  function buildLayerList() {
    if (!customLayers) {
      return null;
    }
    return (
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
    );
  }

  function showMap() {
    setMapStyle('mapbox://styles/mapbox/light-v9');
    setSatelliteView(false);
  }

  function showSatellite() {
    setMapStyle('mapbox://styles/mapbox/satellite-v9');
    setSatelliteView(true);
  }

  function openMapCacheDialog() {
    setCacheMapDialogOpen(true);
  }

  function closeMapCacheDialog(latitude: ?number, longitude: ?number) {
    if (longitude && latitude) {
      setView({
        latitude: latitude,
        longitude: longitude,
        zoom: 17,
        bearing: 0,
        pitch: 45,
      });
    }
    setCacheMapDialogOpen(false);
  }

  const classes = useStyles();

  return (
    <div>
      <DeckGL
        initialViewState={view}
        controller={true}
        layers={buildLayers()}
        getTooltip={(p: Point) => p.message}>
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                3D Coverage Maps
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <ReactMapGL mapboxApiAccessToken={MAPBOX_TOKEN} mapStyle={mapStyle}>
          <div style={{position: 'absolute', right: 0}}>
            <NavigationControl showCompass={true} showZoom={false} />
          </div>
        </ReactMapGL>
        <div
          style={{
            padding: 10,
            background: 'rgba(255,255,255,0.8)',
            display: 'inline-block',
          }}>
          <Button variant="contained" color="primary" onClick={handleOpenClick}>
            Open Files
          </Button>
          <p />
          <Typography>
            Highest RSSI: {minRssiToDisplay}dBm
            <p />
            Lowest RSSI: {maxRssiToDisplay}dBm
          </Typography>
          <p />
          <ButtonGroup>
            <Button
              variant={satelliteView ? undefined : 'contained'}
              color="primary"
              onClick={showMap}>
              Map
            </Button>
            <Button
              variant={satelliteView ? 'contained' : undefined}
              color="primary"
              onClick={showSatellite}>
              Satellite
            </Button>
          </ButtonGroup>
          <p />
          <Typography>
            Ignoring all points under {MIN_ELEVATION} meters
            <p />
            Option+click to rotate map
            <p />
          </Typography>
          {buildLayerList()}
          {graphData ? (
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
              <MarkSeries data={graphData} size={1} />
            </XYPlot>
          ) : null}
          <p />
          <Button
            variant="outlined"
            color="secondary"
            onClick={openMapCacheDialog}>
            Download offline maps
          </Button>
          <CacheMapsDialog
            open={cacheMapDialogOpen}
            onClose={closeMapCacheDialog}
          />
        </div>
        <input
          type="file"
          ref={fileInput}
          style={{display: 'none'}}
          onChange={handleFile}
          multiple="multiple"
        />
        {hoverInfo && hoverInfo.object && (
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              pointerEvents: 'none',
              right: 35,
              top: 69,
              backgroundColor: 'black',
              color: 'white',
              padding: 3,
            }}>
            <Typography variant="body2">{hoverInfo.object.message}</Typography>
          </div>
        )}
      </DeckGL>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
}));

export default MapScreen;
