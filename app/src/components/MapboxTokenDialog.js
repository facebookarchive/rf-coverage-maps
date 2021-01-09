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
import {useState} from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';

type Props = {
  onClose: (?string) => void,
};

function MapboxTokenDialog(props: Props): React.Node {
  const [token, setToken] = useState<?string>();
  const {onClose} = props;

  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    onClose(token);
  };

  return (
    <Dialog
      onClose={handleCancel}
      aria-labelledby="simple-dialog-title"
      open={true}>
      <DialogTitle id="simple-dialog-title">Mapbox Token</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter your Mapbox token to be able to view maps.
        </DialogContentText>
        <DialogContentText variant="body2">
          Mapbox tokens can be found at{' '}
          <Link href="https://account.mapbox.com/access-tokens/">
            https://account.mapbox.com/access-tokens/
          </Link>
          .
        </DialogContentText>
        <TextField
          required
          fullWidth
          autoFocus
          id="token"
          label="Token"
          type="password"
          onChange={event => {
            setToken(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MapboxTokenDialog;
