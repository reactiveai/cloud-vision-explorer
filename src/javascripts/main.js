'use strict'
import 'babel-polyfill'
import 'stylesheets/main'
import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, Redirect, hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import configureStore from './store/configureStore'
import EntrancePage from './components/EntrancePage'
import FrontPage from './components/FrontPage'

const store = configureStore()

ReactDom.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/galaxy" component={FrontPage} />
      <Route path="/" component={EntrancePage} />
      <Redirect from="*" to="/" />
    </Router>
  </Provider>,
  document.getElementById('contents')
)
