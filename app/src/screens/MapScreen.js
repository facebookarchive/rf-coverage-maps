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
import {useEffect, useMemo, useRef, useState} from 'react';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import CacheMapsDialog from '../components/CacheMapsDialog';
import DeckGL from 'deck.gl';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import MapboxTokenDialog from '../components/MapboxTokenDialog';
import Paper from '@material-ui/core/Paper';
import ReactMapGL, {NavigationControl} from 'react-map-gl';
import RssiHeightGraph from '../components/RssiHeightGraph';
import SignalStrengthLegend from '../components/SignalStrengthLegend';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {AppBar, Button} from '@material-ui/core';
import {IconLayer} from '@deck.gl/layers';
import {getRGBTurbo} from '../utils/ColorUtils';
import {makeStyles} from '@material-ui/core/styles';
import {useCookies} from 'react-cookie';

import LayerList from '../components/LayerList';
import getArrow from '../components/ArrowElement';

import type {PickInfo, ViewStateProps} from '@deck.gl/core';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true},
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

type LayerInfo = {
  data: Array<Point>,
  xydata: Array<XYPoint>,
  visible: boolean,
  minRssi: number,
  maxRssi: number,
};
export type LayerDict = {[name: string]: LayerInfo};

function pointsToXY(points: Array<Point>): Array<XYPoint> {
  return points.map(point => {
    return {
      x: point.height,
      y: point.rssi,
    };
  });
}
const ArrowPlain = getArrow(false);
const ArrowGlow = getArrow(true);

function MapScreen(): React.Node {
  const [arrowGlow, setArrowGlow] = useState<boolean>(false);
  const [unfilteredLayers, setUnfilteredLayers] = useState<LayerDict>({});
  const [filteredLayers, setFilteredLayers] = useState<LayerDict>({});
  const [hoverInfo, setHoverInfo] = useState<?PickInfo<Point>>(null);
  const [mapStyle, setMapStyle] = useState<string>(
    'mapbox://styles/mapbox/satellite-v9',
  );
  const [satelliteView, setSatelliteView] = useState<boolean>(true);
  const [cacheMapDialogOpen, setCacheMapDialogOpen] = useState<boolean>(false);
  const [filterMinRssi, setFilterMinRssi] = useState<string>('');
  const [filterMaxRssi, setFilterMaxRssi] = useState<string>('');
  const [filterMinHeight, setFilterMinHeight] = useState<string>('10');
  const [filterMaxHeight, setFilterMaxHeight] = useState<string>('');
  const [cookies, setCookie] = useCookies(['token']);

  // Initialize view to MPK Campus
  const [view, setView] = useState<ViewStateProps>({
    latitude: 37.483175,
    longitude: -122.150084,
    zoom: 17,
    bearing: 0,
    pitch: 45,
  });

  const [maxRssiToDisplay, minRssiToDisplay] = useMemo<[number, number]>(
    () =>
      Object.keys(unfilteredLayers)
        .filter((name: string) => unfilteredLayers[name].visible)
        .map<[number, number]>((name: string) => [
          unfilteredLayers[name].maxRssi,
          unfilteredLayers[name].minRssi,
        ])
        .reduce(
          ([max, min]: [number, number], [max2, min2]) => [
            max > max2 ? max : max2,
            min < min2 ? min : min2,
          ],
          [-Infinity, Infinity],
        ),
    [unfilteredLayers],
  );

  const fileInput = useRef(null);

  useEffect(() => {
    if (!Object.keys(unfilteredLayers)) {
      return;
    }

    const newLayers: LayerDict = {};
    Object.keys(unfilteredLayers).forEach((key: string) => {
      newLayers[key] = {...unfilteredLayers[key]};
      newLayers[key].data = newLayers[key].data.filter(point => {
        if (filterMinRssi !== '' && point.rssi < parseFloat(filterMinRssi)) {
          return false;
        }
        if (filterMaxRssi !== '' && point.rssi > parseFloat(filterMaxRssi)) {
          return false;
        }
        if (
          filterMinHeight !== '' &&
          point.height < parseFloat(filterMinHeight)
        ) {
          return false;
        }
        if (
          filterMaxHeight !== '' &&
          point.height > parseFloat(filterMaxHeight)
        ) {
          return false;
        }
        return true;
      });
      newLayers[key].xydata = pointsToXY(newLayers[key].data);
    });
    setFilteredLayers(newLayers);
  }, [
    unfilteredLayers,
    filterMinRssi,
    filterMaxRssi,
    filterMinHeight,
    filterMaxHeight,
  ]);

  function handleOpenClick() {
    fileInput.current && fileInput.current.click && fileInput.current.click();
  }

  function handleFile(e: SyntheticInputEvent<HTMLInputElement>) {
    const allLayers = {...unfilteredLayers};
    const files = e.target.files;

    Array.from(files).forEach((file: File) => {
      const name = file.name;
      const reader = new FileReader();
      reader.onload = _e => {
        const content = reader.result;
        if (content !== null && typeof content === 'string') {
          const [lines, maxRssi, minRssi] = processFileData(content);
          if (lines.length === 0) {
            return;
          }
          const xyPoints = pointsToXY(lines);
          allLayers[name] = {
            data: lines,
            visible: true,
            xydata: xyPoints,
            maxRssi: maxRssi,
            minRssi: minRssi,
          };
          // Use a new object so that react updates
          setUnfilteredLayers({...allLayers});
          setView({
            latitude: lines[0].longitude,
            longitude: lines[0].latitude,
            zoom: 17,
            bearing: 0,
            pitch: 45,
          });
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
    let maxRssi: number = NaN;
    let minRssi: number = NaN;

    for (let i = 1; i < allTextLines.length; i++) {
      const data = allTextLines[i].split(',');
      if (data.length < 6) {
        continue;
      }
      // Pull out the fields needed
      const longitude: number = parseFloat(data[0]);
      const latitude: number = parseFloat(data[1]);
      const height: number = parseFloat(data[3]);
      const rssi: number = parseFloat(data[4]);
      const bearing: number = parseFloat(data[5]);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(height) ||
        !Number.isFinite(rssi) ||
        !Number.isFinite(bearing) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        continue;
      }

      if (typeof rssi === 'number' && (isNaN(maxRssi) || rssi < maxRssi)) {
        maxRssi = rssi;
      }
      if (typeof rssi === 'number' && (isNaN(minRssi) || rssi > minRssi)) {
        minRssi = rssi;
      }
      lines.push({
        latitude,
        longitude,
        height,
        rssi,
        bearing,
        message: `${longitude}, ${latitude} ${height} meters ${rssi}dBm ${bearing}°`,
      });
    }
    return [lines, maxRssi, minRssi];
  }

  function buildLayers() {
    return Object.keys(filteredLayers).map(
      (name: string) =>
        new IconLayer<Point>({
          id: name,
          data: filteredLayers[name].data,
          visible: filteredLayers[name].visible,
          pickable: true,
          // iconAtlas and iconMapping are required
          // $FlowIgnore Images actually work fine.
          iconAtlas: arrowGlow ? ArrowGlow : ArrowPlain,
          iconMapping: ICON_MAPPING,
          // getIcon: return a string
          getIcon: (_d: Point) => 'marker',
          sizeScale: 2,
          getPosition: d => [d.latitude, d.longitude, d.height],
          getSize: _d => 10,
          getColor: d => getRGBTurbo(d.rssi),
          getAngle: (d: Point) => 180 - d.bearing,
          billboard: false,
          onHover: info => setHoverInfo(info),
          updateTriggers: {iconAtlas: [arrowGlow]},
        }),
    );
  }

  function swapSatteliteView() {
    if (satelliteView) {
      setMapStyle('mapbox://styles/mapbox/light-v9');
      setSatelliteView(false);
    } else {
      setMapStyle('mapbox://styles/mapbox/satellite-v9');
      setSatelliteView(true);
    }
  }

  function openMapCacheDialog() {
    setCacheMapDialogOpen(true);
  }

  function buildFilters() {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel-filters">
          <Typography>Filters</Typography>
        </AccordionSummary>
        <TextField
          label="Min RSSI"
          type="number"
          value={filterMinRssi}
          onChange={({target}) => setFilterMinRssi(target.value)}
        />
        <TextField
          label="Max RSSI"
          type="number"
          value={filterMaxRssi}
          onChange={({target}) => setFilterMaxRssi(target.value)}
        />
        <br />
        <TextField
          label="Min Elevation"
          type="number"
          value={filterMinHeight}
          onChange={({target}) => setFilterMinHeight(target.value)}
        />
        <TextField
          label="Max Elevation"
          type="number"
          value={filterMaxHeight}
          onChange={({target}) => setFilterMaxHeight(target.value)}
        />
      </Accordion>
    );
  }

  function buildUISettings() {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel-filters">
          <Typography>UI Settings</Typography>
        </AccordionSummary>
        <FormGroup className={classes.formGroup}>
          <FormControlLabel
            control={
              <Switch
                onChange={swapSatteliteView}
                checked={satelliteView}
                inputProps={{'aria-labelledby': 'arrow-glow'}}
              />
            }
            label="Satellite View"
          />
          <FormControlLabel
            control={
              <Switch
                onChange={() => setArrowGlow(prev => !prev)}
                checked={arrowGlow}
                inputProps={{'aria-labelledby': 'arrow-glow'}}
              />
            }
            label="Arrow Glow"
          />
        </FormGroup>
      </Accordion>
    );
  }

  function renderMinMaxRSSI() {
    if (!isFinite(minRssiToDisplay) && !isFinite(maxRssiToDisplay)) {
      return null;
    }
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>
            <b>Max RSSI:</b> {minRssiToDisplay}dBm
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            <b>Min RSSI:</b> {maxRssiToDisplay}dBm
          </Typography>
        </Grid>
      </Grid>
    );
  }

  function closeMapCacheDialog(latitude: ?number, longitude: ?number) {
    if (longitude != null && latitude != null) {
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

  function closeMapboxTokenDialog(token: ?string) {
    if (token) {
      setCookie('token', token, {path: '/'});
    }
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenClick}>
                Open Files
              </Button>
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
            </Toolbar>
          </AppBar>
        </div>
        {cookies.token ? (
          <ReactMapGL mapboxApiAccessToken={cookies.token} mapStyle={mapStyle}>
            <div style={{position: 'absolute', right: 0}}>
              <NavigationControl showCompass={true} showZoom={false} />
            </div>
            <div style={{position: 'absolute', right: 35}}>
              <Paper className={classes.rightSideBar}>
                <SignalStrengthLegend />
              </Paper>
            </div>
          </ReactMapGL>
        ) : (
          <MapboxTokenDialog onClose={closeMapboxTokenDialog} />
        )}
        <Paper className={classes.sideBar}>
          <Typography variant="body2">Option+click to rotate map</Typography>
          <p />
          <LayerList
            setCustomLayers={setUnfilteredLayers}
            customLayers={filteredLayers}
          />
          {buildFilters()}
          <RssiHeightGraph customLayers={filteredLayers} />
          {buildUISettings()}
          <p />
          {renderMinMaxRSSI()}
        </Paper>
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
  formGroup: {
    'padding-left': '10px',
  },
  sideBar: {
    padding: 10,
    background: 'rgba(255,255,255,0.8)',
    display: 'inline-block',
    'max-height': '90%',
    'overflow-y': 'auto',
    'overflow-x': 'hidden',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
  rightSideBar: {
    padding: 0,
    background: 'rgba(255,255,255,0.8)',
    display: 'inline-block',
    'max-height': '90%',
    'overflow-y': 'auto',
    'overflow-x': 'hidden',
  },
}));

export default MapScreen;
