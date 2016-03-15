import _ from 'lodash'
import $ from 'npm-zepto'
import React, { PropTypes } from 'react'
import { Tab, Tabs } from 'react-toolbox'
import Drawer from 'react-toolbox/lib/drawer'
import FontIcon from 'react-toolbox/lib/font_icon'
import IconButton from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { Donut } from 'rebass'
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
    const { vision } = this.props
    const getAnnotations = (name) => {
      if (name == 'face') {
        return [
          {
            "rollAngle": 45,
            "panAngle": -80,
            "tiltAngle": 100,
            "joyLikelihood": "UNLIKELY",
            "sorrowLikelihood": "LIKELY",
            "angerLikelihood": "VERY_LIKELY",
            "surpriseLikelihood": "UNKNOWN",
            "underExposedLikelihood": "VERY_LIKELY",
            "blurredLikelihood": "POSSIBLE",
            "headwearLikelihood": "VERY_UNLIKELY"
          },
          {
            "rollAngle": 45,
            "panAngle": -80,
            "tiltAngle": 100,
            "joyLikelihood": "UNLIKELY",
            "sorrowLikelihood": "LIKELY",
            "angerLikelihood": "VERY_LIKELY",
            "surpriseLikelihood": "UNKNOWN",
            "underExposedLikelihood": "VERY_LIKELY",
            "blurredLikelihood": "POSSIBLE",
            "headwearLikelihood": "VERY_UNLIKELY"
          }
        ]
      }
      const key = name + 'Annotations'
      return (key in vision) ? vision[key] : []
    }
    const likelihoodLevel = (likelihood) => {
      const levelMap = {
        UNKNOWN: 0,
        VERY_UNLIKELY: 1,
        UNLIKELY: 2,
        POSSIBLE: 3,
        LIKELY: 4,
        VERY_LIKELY: 5
      }
      const level = levelMap[likelihood]
      return (
        <ul className="likelihood-level">
          <li className={level > 0 ? 'active' : ''}></li>
          <li className={level > 1 ? 'active' : ''}></li>
          <li className={level > 2 ? 'active' : ''}></li>
          <li className={level > 3 ? 'active' : ''}></li>
          <li className={level > 4 ? 'active' : ''}></li>
        </ul>
      )
    }

    return (
      <div className="tab-graph">
        <section className="label-detection">
          {getAnnotations('label').map(label =>
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
          {getAnnotations('face').map((face, idx) =>
            <div className="face-detection-person" key={idx}>
              <div>
                <FontIcon className="humanoid primary" value="accessibility" />
                <div className="person-label">Person {idx + 1}</div>
                <div className="angle">
                  <div className="angle-label">Roll</div>
                  <Donut
                    color="currentColor"
                    size={50}
                    strokeWidth={4}
                    value={(face.rollAngle + 180) / 360}
                  />
                </div>
                <div className="angle">
                  <div className="angle-label">Pan</div>
                  <Donut
                    color="currentColor"
                    size={50}
                    strokeWidth={4}
                    value={(face.panAngle + 180) / 360}
                  />
                </div>
                <div className="angle">
                  <div className="angle-label">Tilt</div>
                  <Donut
                    color="currentColor"
                    size={50}
                    strokeWidth={4}
                    value={(face.tiltAngle + 180) / 360}
                  />
                </div>
              </div>
              <div className="likelihoods">
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="sentiment_satisfied" />
                  <div className="likelihood-label">Joy</div>
                  {likelihoodLevel(face.joyLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="sentiment_dissatisfied" />
                  <div className="likelihood-label">Sorrow</div>
                  {likelihoodLevel(face.sorrowLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="lens" />
                  <div className="likelihood-label">Anger</div>
                  {likelihoodLevel(face.angerLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="lens" />
                  <div className="likelihood-label">Surprise</div>
                  {likelihoodLevel(face.surpriseLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="flare" />
                  <div className="likelihood-label">Under Expose</div>
                  {likelihoodLevel(face.underExposedLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="blur_on" />
                  <div className="likelihood-label">Blur</div>
                  {likelihoodLevel(face.blurredLikelihood)}
                </div>
                <div className="likelihood">
                  <FontIcon className="likelihood-icon" value="lens" />
                  <div className="likelihood-label">Headwear</div>
                  {likelihoodLevel(face.headwearLikelihood)}
                </div>
              </div>
            </div>
          )}
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
          <Tab label='Graphical' className={classForTab(0)}>
            <GraphTab vision={this.state.vision} />
          </Tab>
          <Tab label='JSON' className={classForTab(1)}>
            <pre>{JSON.stringify(this.state.vision, null, 2)}</pre>
          </Tab>
        </SidebarTabs>
      </Drawer>
    )
  }
}
