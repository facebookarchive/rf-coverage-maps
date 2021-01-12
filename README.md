# RF Coverage Maps

This project reads geospatial RF coverage data stored in CSV format. It will parse out relevant fields (latitude, longitude, altitude, bearing, and signal strength) and plot the data in a 3D map. It will highlight the location in space that has the highest observed signal strength.

# Usage
To use the software and view the map, you first need to register with MapBox and get an access token:
Get a Mapbox Access Token:
https://docs.mapbox.com/help/glossary/access-token

Next, download the latest release [rf-coverage-maps.zip](https://github.com/facebookexperimental/rf-coverage-maps/releases/download/release/rf-coverage-maps.zip) and unzip the file.  Open the `index.html` file and enter your MapBox token when prompted.

# For Developers
Clone this repo:
```
git clone git@github.com:facebookexperimental/rf-coverage-maps.git
```

Start the app:
```
cd rf-coverage-maps/app
yarn start
```

Get a Mapbox Access Token:
https://docs.mapbox.com/help/glossary/access-token

Use the token to see maps in the website:
http://localhost:3000/

See the [CONTRIBUTING](CONTRIBUTING.md) file for how to help out.

## Terms of Use
https://opensource.facebook.com/legal/terms

## Privacy Policy
https://opensource.facebook.com/legal/privacy

## License
This project is BSD licensed, as found in the [LICENSE](LICENSE) file.
