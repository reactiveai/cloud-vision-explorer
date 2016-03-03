'use strict'
import React from 'react'
import ReactDom from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import FrontPage from './components/FrontPage'

ReactDom.render(
  <FrontPage />,
  document.getElementById('contents')
)
