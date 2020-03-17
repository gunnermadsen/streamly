# Streamily is a React-based music streaming application that provides a music player in the browser. This application uses Typescript and SCSS precompilers, with webpack for build operations, and webpack-dev-server for development. 


## Available Scripts

In the project directory, to run the application using the webpack development server:

### `yarn run wp:start`

Runs the app using the devel.<br />
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.<br />

A note on Hot module replacement and streaming music:
the application will continue to stream music even after an hmr update. While developing you save while music is streaming, please refresh the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run wp:build`

Builds the app for production to the `build` folder using webpack production mode<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Please see https://www.gunner-madsen.com for more projects
