import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './store/reducers/reducer'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import sagaInitializer from './store/effects/effects'

import * as serviceWorker from './serviceWorker'


import './index.scss'
// import worker from '../worker'

declare const module: any

const sagaMiddleware = createSagaMiddleware()

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(sagaMiddleware)))

sagaMiddleware.run(sagaInitializer)

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'))

serviceWorker.register()

module.hot.accept()

export default store
