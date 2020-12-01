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
import { useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

type Props = {
    onClose: (?number, ?number) => void,
    open: boolean,
}

function CacheMapsDialog(props: Props): React.Node {
    const [latitude, setLatitude] = useState<?number>(null);
    const [longitude, setLongitude] = useState<?number>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const { onClose, open } = props;

    const handleCancel = () => {
        onClose();
    }

    const handleDownload = () => {
        if (longitude && latitude && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
            onClose(latitude, longitude);
        } else {
            setShowError(true);
        }
    }

    return (
        <Dialog onClose={handleCancel} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">Download Offline Maps</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter the latitude and longitude of the area that should be downloaded.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="latitude"
                    label="Latitude"
                    type="number"
                    onChange={(event) => {
                        setShowError(false);
                        setLatitude(parseFloat(event.target.value))
                    }}
                />
                <TextField
                    margin="dense"
                    id="longitude"
                    label="Longitude"
                    type="number"
                    onChange={(event) => {
                        setShowError(false);
                        setLongitude(parseFloat(event.target.value))
                    }}
                />
                <DialogContentText>
                    {showError ? "Latitude must be between -90 and 90, and Longitude must be between -180 and 180." : null}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleDownload} color="primary">
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CacheMapsDialog;
