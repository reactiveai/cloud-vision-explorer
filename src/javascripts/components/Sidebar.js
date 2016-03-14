import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Tab, Tabs } from 'react-toolbox'
import Drawer from 'react-toolbox/lib/drawer'
import FontIcon from 'react-toolbox/lib/font_icon'
import IconButton from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import 'stylesheets/Sidebar'
import tabStyle from 'react-toolbox/lib/tabs/style'

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

  componentWillMount() {
    const dummy = require('json!../data/sample1.json')
    this.setState(s =>
      _.assign(s, { visionData: JSON.stringify(dummy, null, 2) }))

    // Listening on event
    console.log('Listening....')
    this.props.emitter.addListener('showSidebar', (id) => {
      console.log(`Displaying : ${id}`)
      this.props.showSidebar()
    })
  }

  componentWillUnmount() {
    console.log('Removing Listeners....')
    this.props.emitter.removeAllListeners()
  }

  getVisionData() {
    // dummy data for Graph pain
    return {
      labelAnnotations: [
        { description: 'cat', score: 0.96 },
        { description: 'floor', score: 0.55 },
        { description: 'wall', score: 0.30 },
        { description: 'Hairball', score: 0.40 },
        { description: 'Curtain', score: 0.13 },
      ]
    }
  }

  render() {
    const visionData = this.getVisionData()
    const { sidebar, hideSidebar, changeTab } = this.props
    const classForTab = (index) => {
      return sidebar.tabIndex === index ? 'col-xs active' : 'col-xs'
    }
    const graphTabContent = (
      <div className="tab-graph">
        <section className="label-detection">
          {visionData['labelAnnotations'].map(label =>
            <div key={label.description} className="row">
              <div className="col-xs-3">{_.capitalize(label.description)}</div>
              <ProgressBar
                className="col-xs" type="linear" mode="determinate"
                value={_.round(label.score * 100)}
              />
              <div className="col-xs-1 score">{_.round(label.score * 100)}%</div>
            </div>
          )}
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

    return (
      <Drawer className="sidebar"
              active={sidebar.isActive} type="right"
              onOverlayClick={hideSidebar}>

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
          <Tab label='Graph' className={classForTab(0)}>{graphTabContent}</Tab>
          <Tab label='Data' className={classForTab(1)}>
            <pre>{this.state.visionData}</pre>
          </Tab>
        </SidebarTabs>
      </Drawer>
    )
  }
}

class SidebarTabs extends Tabs {
  // Copied mainly from the original class, but modified some orders and styles
  render () {
    let className = tabStyle.root
    const { headers, contents } = this.parseChildren()
    if (this.props.className) className += ` ${this.props.className}`

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
