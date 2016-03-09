import React, { PropTypes } from 'react'
import Drawer from 'react-toolbox/lib/drawer'

export default class Sidebar extends React.Component {
  static get propTypes() {
    return {
      showSidebar: PropTypes.bool.isRequired,
      handleSidebar: PropTypes.func.isRequired
    }
  }

  render() {
    return (
      <div>
        <Drawer
          active={this.props.showSidebar} type="right"
          onOverlayClick={this.props.handleSidebar.bind(this, false)}
        >
          <h5>This is your Drawer.</h5>
          <p>You can embed any content you want, for example a Menu.</p>
        </Drawer>
      </div>
    )
  }
}
