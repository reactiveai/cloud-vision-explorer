/*global $*/

import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Tab, Tabs } from 'react-toolbox'
import Drawer from 'react-toolbox/lib/drawer'
import FontIcon from 'react-toolbox/lib/font_icon'
import IconButton from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { Donut } from 'rebass'
import 'stylesheets/Sidebar'
import tabStyle from 'react-toolbox/lib/tabs/style'
import PlusTitle from './PlusTitle'

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
    const getDetectionSection = (key, className, callback) => {
      return key in vision ?
        <section className={className}>
          {callback(vision[key])}
        </section> : ''
    }
    const getAngleSection = (name, value) => {
      return (
        <section className="angle">
          <div className="angle-label">{name}</div>
          <Donut
            color="currentColor"
            size={50}
            strokeWidth={4}
            value={(value + 180) / 360}
          >
            <span className="angle-value">{_.round(value)}&deg;</span>
          </Donut>
        </section>
      )
    }
    const getColorStyle = (color) => {
      const c = color.color
      return {
        backgroundColor: `rgb(${c.red}, ${c.green}, ${c.blue})`,
        flexGrow: color.score * 100
      }
    }

    return (
      <div className="tab-graph">
        {getDetectionSection('labelAnnotations', 'label-detection', annons =>
          annons.map(label =>
            <div key={label.description} className="label">
              <div className="label-name">{_.capitalize(label.description)}</div>
              <ProgressBar
                className="label-score-bar" type="linear" mode="determinate"
                value={_.round(label.score * 100)}
              />
              <div className="label-score">{_.round(label.score * 100)}%</div>
            </div>
          )
        )}
        {getDetectionSection('textAnnotations', 'text-detection', annons =>
          annons.map((text, idx) =>
            <p key={idx}>
              <span className="text-quote">“</span>
              <span className="text-description">{text.description}</span>
              <span className="text-quote">„</span>
            </p>
          )
        )}
        {getDetectionSection('safeSearchAnnotation', 'safesearch-detection', annon =>
          <div className="likelihoods">
            <div className="likelihoods-row">
              <div className="likelihood">
                <div className="likelihood-label">Adult</div>
                {likelihoodLevel(annon.adult)}
              </div>
              <div className="likelihood">
                <div className="likelihood-label">Spoof</div>
                {likelihoodLevel(annon.spoof)}
              </div>
            </div>
            <div className="likelihoods-row">
              <div className="likelihood">
                <div className="likelihood-label">Medical</div>
                {likelihoodLevel(annon.medical)}
              </div>
              <div className="likelihood">
                <div className="likelihood-label">Violence</div>
                {likelihoodLevel(annon.violence)}
              </div>
            </div>
          </div>
        )}
        {getDetectionSection('faceAnnotations', 'face-detection', annons =>
          annons.map((face, idx) =>
            <div className="face-detection-person" key={idx}>
              <div>
                <FontIcon className="humanoid primary" value="accessibility" />
                <div className="person-label">Person {idx + 1}</div>
                {getAngleSection('Roll', face.rollAngle)}
                {getAngleSection('Pan', face.panAngle)}
                {getAngleSection('Tilt', face.tiltAngle)}
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
                  <span className="likelihood-icon custom-icon anger" />
                  <div className="likelihood-label">Anger</div>
                  {likelihoodLevel(face.angerLikelihood)}
                </div>
                <div className="likelihood">
                  <span className="likelihood-icon custom-icon surprise" />
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
                  <span className="likelihood-icon custom-icon headwear" />
                  <div className="likelihood-label">Headwear</div>
                  {likelihoodLevel(face.headwearLikelihood)}
                </div>
              </div>
            </div>
          )
        )}
        {getDetectionSection('logoAnnotations', 'logo-detection', annons =>
          <p>logo detection</p>
        )}
        {getDetectionSection('landmarkAnnotations', 'landmark-detection', annons =>
          annons.map(({description, mid}) =>
            <div key={mid} className="landmark-detection">
              <PlusTitle>
                <p className="description">{description}</p>
              </PlusTitle>
            </div>
          )
        )}
        {getDetectionSection('imagePropertiesAnnotation', 'image-properties', annon =>
          <ul>
            {_.orderBy(annon.dominantColors.colors, ['score'], ['desc']).map((color, idx) =>
              <li key={idx} style={getColorStyle(color)} />
            )}
          </ul>
        )}
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
      fetch(getVisionJsonURL(id)).then((res) => {
        return res.json()
      }).then((data) => {
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
      return sidebar.tabIndex === index ? 'active' : ''
    }
    const classForIndicator = (key) => {
      return key in this.state.vision ? 'active' : ''
    }

    const handIcon = {
      cursor: 'pointer'
    }

    return (
      <Drawer className="sidebar"
              active={sidebar.isActive}
              type="right"
              onOverlayClick={() => { this.props.emitter.emit('hideSidebar') }}>

        <ul className="feature-indicator">
          <li className={classForIndicator('labelAnnotations')}>
            <FontIcon style={handIcon} value='label_outline' />
          </li>
          <li className={classForIndicator('textAnnotations')}>
            <FontIcon style={handIcon} value='translate' />
          </li>
          <li className={classForIndicator('safeSearchAnnotation')}>
            <span style={handIcon} className="custom-icon safesearch" />
          </li>
          <li className={classForIndicator('faceAnnotations')}>
            <FontIcon style={handIcon} value='face' />
          </li>
          <li className={classForIndicator('logoAnnotations')}>
            <span style={handIcon} className="custom-icon logo_detection" />
          </li>
          <li className={classForIndicator('landmarkAnnotations')}>
            <FontIcon style={handIcon} value='place' />
          </li>
          <li className={classForIndicator('imagePropertiesAnnotation')}>
            <FontIcon style={handIcon} value='photo' />
          </li>
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
