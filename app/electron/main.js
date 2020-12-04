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

const {app, BrowserWindow} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });
  const startURL = isDev
    ? 'http://localhost:3000/?access_token=pk.eyJ1IjoiZmFubnlraGlldSIsImEiOiJja2k0eWRqcWcwNzI4MnBxbzM5bGllYjZ2In0.VjNz3ZjqXvByKLYAqqIgTg'
    : `file://${path.join(__dirname, '../public/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
app.on('ready', createWindow);
