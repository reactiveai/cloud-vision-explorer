import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ToolboxApp from 'react-toolbox/lib/app'
import ImageView from './ImageView'
import RenderView from './RenderView'
import InfoLink from './InfoLink'
import ImageCounter from './ImageCounter'
import Sidebar from './Sidebar'
import * as sidebarActionCreators from '../actions/sidebar'
import 'stylesheets/FrontPage'
import {EventEmitter} from 'fbemitter'
import { ReactiveLogo } from './ReactiveLogo'
import BrowserChecker from './BrowserChecker'

const emitter = new EventEmitter()

const style = {
  infoLink: {
    position: 'absolute',
    top: '2vh',
    left: '2vh',
    width: '20vh',
    zIndex: 100
  },
  imageCounter: {
    position: 'absolute',
    bottom: '1vh',
    left: '2vh',
  }
}

class FrontPage extends Component {
  static get propTypes() {
    return {
      sidebar: PropTypes.object.isRequired,
      dispatch: PropTypes.func.isRequired
    }
  }

  render() {
    const { sidebar, dispatch } = this.props
    const sidebarBounds = bindActionCreators(sidebarActionCreators, dispatch)

    return (
      <div >
        <ToolboxApp>
          <ImageCounter style={style.imageCounter} emitter={emitter} />
          <InfoLink style={style.infoLink} emitter={emitter} />
          <ImageView
            emitter={emitter}
            highlightFaceLandmarks={sidebar.highlightFaceLandmarks}
          />
          <Sidebar sidebar={sidebar} emitter={emitter} {...sidebarBounds} />
          <RenderView emitter={emitter} />
        </ToolboxApp>
        <ReactiveLogo />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { sidebar: state.sidebar }
}
export default connect(mapStateToProps)(FrontPage)
