# Percorsi Agili

# Install
You need to install `NodeJS` and optionally `yarn`.

Then inside this repository run:
```bash
npm install
# yarn install -- if you installed yarn
```

# Development
To start the development server run
```bash
npm run start
# yarn start
```

# Build
Build is required to assemble the code 
```bash
npm run build
# yarn build
```

The result will be a folder called `build` which contains the HTML page and all the assets.

# Config
Configuration is split inside two files, one is `/src/constants.js`
and the other is in `/public/static/config.js`. A third file will be produced
inside `build/static/config.js` when you run build.

### src/constants.js
Contains the configuration for layers, and configurations that are built inside the bundle. When you change those, you'll
have to run again build.

### public/static/config.js
This file allows to inject configurations without rebuilding the whole app. This file should be considered a blueprint
and should provide a common environment for development.

### build/static/config.js
This file should be actually modified depending on the environment, for example in a production environment this file should
point API endpoints to actual production endpoints.

This file could be modified without requiring a whole rebuild of the webapp.

# Testing 
The app can be accessed at the following url [https://barriere.wikimedia.it](https://barriere.wikimedia.it)

# Data
Data is automatically fetched via Overpass Turbo on install and build, queries that generate layers are `.ql` files inside the `overpass` directory.
The resulting data is a GeoJSON file that is placed inside `public/static/data/` directory.

# Updating data (without rebuilding)
Updating data can be done in two steps:
1. run `yarn pull-data` to actually get the updates
2. run `yarn update-data-config` to replace inside the build folder the layers and the configurations

this could be easily automated using a cron expression like
```
0 0 * * 0 cd PROJECT-PATH/; yarn pull-data; yarn update-data-config;
```

**NOTES**: the example doesn't handle error reporting, yarn could be replaced by `npm run`.