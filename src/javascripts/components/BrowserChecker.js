import React, { Component } from 'react'
import Dialog from 'react-toolbox/lib/dialog'
import FontIcon from 'react-toolbox/lib/font_icon'

export default class BrowserChcker extends Component {
  isSupportedBrowser(userAgent) {
    const supportedVersion = 50
    const match = /Chrome\/[0-9]+/.exec(userAgent)
    return (match && match[0].split('/')[1] >= supportedVersion)
  }

  render() {
    return (
      <Dialog
        className="overlay-dialog"
        active={!this.isSupportedBrowser(navigator.userAgent)}
      >
          <FontIcon value='block' />
        <p>Sorry, this demo only supports latest Google Chrome</p>
      </Dialog>
    )
  }
}
