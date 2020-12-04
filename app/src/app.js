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
import MapScreen from './screens/MapScreen';
import {createMuiTheme} from '@material-ui/core/styles';
import {MuiThemeProvider} from '@material-ui/core/styles';
import {CookiesProvider} from 'react-cookie';

function App(): React.Node {
  const theme = createMuiTheme({
    palette: {
      secondary: {
        light: '#e6e6e6',
        main: '#BBBBBB',
        dark: '#333333',
        contrastText: '#f2f2f2',
      },
    },
    typography: {
      fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CookiesProvider>
        <MapScreen />
      </CookiesProvider>
    </MuiThemeProvider>
  );
}

export default App;
