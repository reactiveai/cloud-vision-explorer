import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ToolboxApp from 'react-toolbox/lib/app'
import RenderView from './RenderView'
import Sidebar from './Sidebar'
import Button from 'react-toolbox/lib/button'
import _ from 'lodash'
import { showSidebar } from '../actions/sidebar'
import * as sidebarActionCreators from '../actions/sidebar'
import 'stylesheets/FrontPage'

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
      <div>
        <ToolboxApp>
          <Sidebar sidebar={sidebar} {...sidebarBounds} />
          <Button
            label='Show Sidebar' accent onClick={sidebarBounds.showSidebar}
            style={{ top: '45px' }}
          />
        </ToolboxApp>
        <RenderView />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { sidebar: state.sidebar }
}
export default connect(mapStateToProps)(FrontPage)
