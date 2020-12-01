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
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';

function App(): React.Node {
  const theme = createMuiTheme({
    typography: {
      fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"]
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <MapScreen />
    </ThemeProvider>
  );
}

export default App;
