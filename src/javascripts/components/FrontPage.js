import React from 'react'
import ToolboxApp from 'react-toolbox/lib/app'
import RenderView from './RenderView'
import Sidebar from './Sidebar'
import Button from 'react-toolbox/lib/button'
import _ from 'lodash'

import 'stylesheets/FrontPage'

export default class FrontPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSidebar: false
    }
  }

  handleSidebar(showSidebar) {
    this.setState(s => _.assign(s, { showSidebar }))
  }

  render() {
    return (
      <div>
        <ToolboxApp>
          <RenderView />
          <Sidebar
            showSidebar={this.state.showSidebar}
            handleSidebar={this.handleSidebar.bind(this)}
          />
          <Button
            label='Show Sidebar' accent
            onClick={this.handleSidebar.bind(this, true)}
          />
        </ToolboxApp>
      </div>
    )
  }
}
