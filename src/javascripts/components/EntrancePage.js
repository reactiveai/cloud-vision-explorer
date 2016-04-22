import React, { Component } from 'react'
import { Link } from 'react-router'
import Ripple from 'react-toolbox/lib/ripple'
import 'stylesheets/EntrancePage'
import { ReactiveLogo } from './ReactiveLogo'

export default class EntrancePage extends Component {
  render() {
    const RippleLink = Ripple()(props =>
      <Link {...props}>{props.children}</Link>
    )
    return (
      <div className="entrance">
        <div className="poweredby">
          <img className="gcp-logo" src="/images/Google-Cloud-Platform.png" /><br />
          <h1>Cloud Vision API<br/>Demo</h1>
        </div>
        <RippleLink className="launch-button" to="/galaxy">LAUNCH</RippleLink>
        <ReactiveLogo />
      </div>
    )
  }
}
