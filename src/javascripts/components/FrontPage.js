import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ToolboxApp from 'react-toolbox/lib/app'
import ImageView from './ImageView'
import RenderView from './RenderView'
import Sidebar from './Sidebar'
import Button from 'react-toolbox/lib/button'
import _ from 'lodash'
import * as sidebarActionCreators from '../actions/sidebar'
import 'stylesheets/FrontPage'
import {EventEmitter} from 'fbemitter'

const emitter = new EventEmitter()

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
        <ToolboxApp style={{height: '100vw'}}>
          <ImageView emitter={emitter} />
          <Sidebar sidebar={sidebar} emitter={emitter} {...sidebarBounds} />
        </ToolboxApp>
        <RenderView emitter={emitter} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { sidebar: state.sidebar }
}
export default connect(mapStateToProps)(FrontPage)
