import _ from 'lodash'
import $ from 'npm-zepto'
import React, { PropTypes } from 'react'
import { Tab, Tabs } from 'react-toolbox'
import Drawer from 'react-toolbox/lib/drawer'
import FontIcon from 'react-toolbox/lib/font_icon'
import IconButton from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import 'stylesheets/Sidebar'
import tabStyle from 'react-toolbox/lib/tabs/style'


const getVisionJsonURL = (id) => {
  return `https://gcs-samples2-explorer.storage.googleapis.com/vision/result/${id}.json`
}

class SidebarTabs extends Tabs {
  // Copied mainly from the original class, but modified some orders and styles
  render () {
    let className = tabStyle.root
    const { headers, contents } = this.parseChildren()
    if(this.props.className) { className += ` ${this.props.className}` }

    return (
      <div ref='tabs' data-react-toolbox='tabs' className={className}>
        {this.renderContents(contents)}
        <nav className={tabStyle.navigation} ref='navigation'>
          {this.renderHeaders(headers)}
        </nav>
        <span className={tabStyle.pointer}
              style={_.omit(this.state.pointer, 'top')} />
      </div>
    )
  }
}

class GraphTab extends React.Component {
  static get propTypes() {
    return {
      vision: PropTypes.object.isRequired
    }
  }

  render() {
    return (
      <div className="tab-graph">
        <section className="label-detection">
          <p>label annotation</p>
        </section>
        <section className="text-detection">
          <p>text detection</p>
        </section>
        <section className="safesearch-detection">
          <p>safesearch detection</p>
        </section>
        <section className="face-detection">
          <p>face detection</p>
        </section>
        <section className="logo-detection">
          <p>logo detection</p>
        </section>
        <section className="image-properties">
          <p>image detection</p>
        </section>
      </div>
    )
  }
}

export default class Sidebar extends React.Component {
  static get propTypes() {
    return {
      sidebar: PropTypes.object.isRequired,
      showSidebar: PropTypes.func.isRequired,
      hideSidebar: PropTypes.func.isRequired,
      changeTab: PropTypes.func.isRequired,
      emitter: PropTypes.object.isRequired
    }
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      vision: {}
    }
  }

  componentWillMount() {
    // Listening on event
    console.log('Listening....')
    this.props.emitter.addListener('showSidebar', (id) => {
      console.log(getVisionJsonURL(id))
      this.props.showSidebar()
      this.setState({ vision: {} }) // Clear results
      $.getJSON(getVisionJsonURL(id), (data) => {
        this.setState({ vision: data[0] }) // assuming an array at the moment
      })
    })

    this.props.emitter.addListener('hideSidebar', (id) => {
      this.props.hideSidebar()
    })
  }

  componentWillUnmount() {
    console.log('Removing Listeners....')
    this.props.emitter.removeAllListeners()
  }

  render() {
    const { sidebar, hideSidebar, changeTab } = this.props
    const classForTab = (index) => {
      return sidebar.tabIndex === index ? 'col-xs active' : 'col-xs'
    }

    return (
      <Drawer className="sidebar"
              active={sidebar.isActive}
              type="right"
              onOverlayClick={() => { this.props.emitter.emit('hideSidebar') }}>

        <ul className="feature-indicator row">
          <li className="col-xs active"><FontIcon value='label_outline' /></li>
          <li className="col-xs"><FontIcon value='translate' /></li>
          <li className="col-xs active"><span className="custom-icon safesearch" /></li>
          <li className="col-xs active"><FontIcon value='face' /></li>
          <li className="col-xs"><span className="custom-icon logo_detection" /></li>
          <li className="col-xs"><FontIcon value='place' /></li>
          <li className="col-xs active"><FontIcon value='photo' /></li>
        </ul>

        <SidebarTabs className="detail-tab"
                     index={sidebar.tabIndex}
                     onChange={changeTab}>
          <Tab label='Graph' className={classForTab(0)}>
            <GraphTab vision={this.state.vision} />
          </Tab>
          <Tab label='Data' className={classForTab(1)}>
            <pre>{JSON.stringify(this.state.vision, null, 2)}</pre>
          </Tab>
        </SidebarTabs>
      </Drawer>
    )
  }
}
