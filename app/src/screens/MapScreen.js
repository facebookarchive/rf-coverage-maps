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

import {AppBar, Button} from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CacheMapsDialog from '../components/CacheMapsDialog';
import DeckGL from 'deck.gl';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {IconLayer} from '@deck.gl/layers';
import ReactMapGL, {NavigationControl} from 'react-map-gl';
import {makeStyles} from '@material-ui/core/styles';
import RssiHeightGraph from '../components/RssiHeightGraph';
import SignalStrengthLegend from '../components/SignalStrengthLegend';
import {getRGBTurbo} from '../utils/ColorUtils';

import LayerList from '../components/LayerList';
import getArrow from '../components/ArrowElement';

import type {ViewStateProps, PickInfo} from '@deck.gl/core/lib/deck';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

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
  const [filterMinRssi, setFilterMinRssi] = useState('');
  const [filterMaxRssi, setFilterMaxRssi] = useState('');
  const [filterMinHeight, setFilterMinHeight] = useState('10');
  const [filterMaxHeight, setFilterMaxHeight] = useState('');

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
        .filter(name => unfilteredLayers[name].visible)
        .map<[number, number]>((name: string) => [
          unfilteredLayers[name].maxRssi,
          unfilteredLayers[name].minRssi,
        ])
        .reduce(
          ([max, min], [max2, min2]) => [
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

    const newLayers = {};
    Object.keys(unfilteredLayers).forEach(key => {
      newLayers[key] = {...unfilteredLayers[key]};
      newLayers[key].data = newLayers[key].data.filter(point => {
        if (filterMinRssi !== '' && point.rssi < filterMinRssi) {
          return false;
        }
        if (filterMaxRssi !== '' && point.rssi > filterMaxRssi) {
          return false;
        }
        if (filterMinHeight !== '' && point.height < filterMinHeight) {
          return false;
        }
        if (filterMaxHeight !== '' && point.height > filterMaxHeight) {
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
      name =>
        new IconLayer<Point>({
          id: name,
          data: filteredLayers[name].data,
          visible: filteredLayers[name].visible,
          pickable: true,
          // iconAtlas and iconMapping are required
          // $FlowFixMe Images actually work fine.
          iconAtlas: arrowGlow ? ArrowGlow : ArrowPlain,
          iconMapping: ICON_MAPPING,
          // getIcon: return a string
          getIcon: (_d: Point) => 'marker',
          sizeScale: 2,
          getPosition: d => [d.latitude, d.longitude, d.height],
          getSize: d => 10,
          getColor: d => getRGBTurbo(d.rssi),
          getAngle: (d: Point) => 180 - d.bearing,
          billboard: false,
          onHover: info => setHoverInfo(info),
          updateTriggers: {iconAtlas: [arrowGlow]},
        }),
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

  function buildFilters() {
    if (!Object.keys(filteredLayers).length) {
      return null;
    }
    return (
      <Accordion defaultExpanded={true}>
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
    if (!Object.keys(filteredLayers).length) {
      return null;
    }
    return (
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel-filters">
          <Typography>UI Settings</Typography>
        </AccordionSummary>
        <FormGroup row className={classes.formGroup}>
          <FormControlLabel
            control={
              <Switch
                name={'Arrow Glow'}
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
        <ReactMapGL mapboxApiAccessToken={MAPBOX_TOKEN} mapStyle={mapStyle}>
          <div style={{position: 'absolute', right: 0}}>
            <NavigationControl showCompass={true} showZoom={false} />
          </div>
          <div style={{position: 'absolute', right: 35}}>
            <Paper className={classes.rightSideBar}>
              <SignalStrengthLegend />
            </Paper>
          </div>
        </ReactMapGL>
        <Paper className={classes.sideBar}>
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
          <Divider className={classes.divider} />
          <Typography variant="body2">Option+click to rotate map</Typography>
          <p />
          {isFinite(minRssiToDisplay) || isFinite(maxRssiToDisplay) ? (
            <>
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
              <p />
            </>
          ) : null}

          <LayerList
            setCustomLayers={setUnfilteredLayers}
            customLayers={filteredLayers}
          />
          <p />
          {buildFilters()}
          <p />
          <RssiHeightGraph customLayers={filteredLayers} />
          <Divider className={classes.divider} />
          {buildUISettings()}
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
  divider: {
    margin: theme.spacing(2),
  },
}));

export default MapScreen;
