# RF Coverage Maps

This project reads geospatial RF coverage data stored in CSV format. It will parse out relevant fields (latitude, longitude, altitude, bearing, and signal strength) and plot the data in a 3D map. It will highlight the location in space that has the highest observed signal strength.

# Usage
Clone this repo:
  git clone git@github.com:facebookexperimental/rf-coverage-maps.git

Start the app:
  cd rf-coverage-maps/app
  yarn start

Get a Mapbox Access Token:
  https://docs.mapbox.com/help/glossary/access-token

Open the app in browser:
http://localhost:3000/?access_token=<mapbox access token>
