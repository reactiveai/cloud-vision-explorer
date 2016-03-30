'use strict'
import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import configureStore from './store/configureStore'
import EntrancePage from './components/EntrancePage'
import FrontPage from './components/FrontPage'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

ReactDom.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/galaxy" component={FrontPage} />
      <Route path="/" component={EntrancePage} />
    </Router>
  </Provider>,
  document.getElementById('contents')
)
