/*global $*/

import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Tab, Tabs } from 'react-toolbox'
import Drawer from 'react-toolbox/lib/drawer'
import FontIcon from 'react-toolbox/lib/font_icon'
import Button from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { Donut } from 'rebass'
import 'stylesheets/Sidebar'
import tabStyle from 'react-toolbox/lib/tabs/style'
import PlusTitle from './PlusTitle'
import Checkbox from 'react-toolbox/lib/checkbox'

const getVisionJsonURL = (id) => {
  return `https://storage.googleapis.com/gcs-samples2-explorer/vision/result/${id}.json`
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
      vision: PropTypes.object.isRequired,
      highlightFaceLandmarks: PropTypes.bool.isRequired,
      toggleHighlightFaceLandmarks: PropTypes.func.isRequired,
    }
  }

  landmarkContent(annon) {
    if(!_.has(annon, 'locations') || annon.locations.length == 0) {
      return (
        <div className="description">
          {annon.description}
        </div>
      )
    }

    const {latitude, longitude} = annon.locations[0].latLng   // takes only the first one
    const style = {
      marginTop: 8,
      fontSize: 'medium'
    }

    return (
      <div className="description">
        <div>{annon.description}</div>
        <div style={style}>
          Latitude : {latitude}<br />
          Longitude : {longitude}
        </div>
      </div>
    )
  }

  render() {
    const { vision } = this.props
    const classForPerson = (idx) => {
      const classes = ['primary', 'secondary', 'third']
      return 'face-detection-person ' + classes[idx % classes.length]
    }
    const likelihoodLevel = (likelihood) => {
      const levelMap = {
        UNKNOWN: 0,
        VERY_UNLIKELY: 0,
        UNLIKELY: 1,
        POSSIBLE: 2,
        LIKELY: 3,
        VERY_LIKELY: 4
      }
      const level = levelMap[likelihood]
      return (
        <ul className="likelihood-level">
          <li className={level > 0 ? 'active' : ''}></li>
          <li className={level > 1 ? 'active' : ''}></li>
          <li className={level > 2 ? 'active' : ''}></li>
          <li className={level > 3 ? 'active' : ''}></li>
        </ul>
      )
    }
    const getDetectionSection = (key, className, label, callback) => {
      return key in vision ?
        <section className={className}>
          <label className="result-caption">{label}</label>
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
        {getDetectionSection('labelAnnotations', 'label-detection', 'LABEL', annons =>
          annons.map((label, idx) =>
            <div key={idx} className="label">
              <div className="label-name">
                {_.capitalize(label.description)}
              </div>
              <div className="label-score">
                <ProgressBar
                  className="label-score-bar" type="linear" mode="determinate"
                  value={_.round(label.score * 100)}
                />
                <div className="label-score-value">
                  {_.round(label.score, 2).toFixed(2)}
                </div>
              </div>
            </div>
          )
        )}
        {getDetectionSection('textAnnotations', 'text-detection', 'TEXT', annons =>
          annons.map((text, idx) =>
            <p key={idx}>
              <span className="text-quote">“</span>
              <span className="text-description">{text.description}</span>
              <span className="text-quote">„</span>
            </p>
          )
        )}
        {getDetectionSection('faceAnnotations', 'face-detection', 'FACE', annons =>
          <div>
            <div className="highlight-face-landmarks">
              <img src={require('../../images/icon/highlight_face_landmarks.svg')} />
              <span className="highlight-face-landmarks-label">Landmarks</span>
              <Checkbox
                checked={this.props.highlightFaceLandmarks}
                onChange={this.props.toggleHighlightFaceLandmarks}
              />
            </div>
            {annons.map((face, idx) =>
              <div className={classForPerson(idx)} key={idx}>
                <div>
                  <FontIcon className="humanoid" value="accessibility" />
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
            )}
          </div>
        )}
        {getDetectionSection('logoAnnotations', 'logo-detection', 'LOGO', annons =>
          annons.map(({description, mid}) =>
            <div key={mid} className="logo-detection">
              <PlusTitle>
                <p className="description">{description}</p>
              </PlusTitle>
            </div>
          )
        )}
        {getDetectionSection('landmarkAnnotations', 'landmark-detection', 'LANDMARK', annons =>
          annons.map((annon, index) =>
            <div key={index} className="landmark-detection">
              <PlusTitle>{this.landmarkContent(annon)}</PlusTitle>
            </div>
          )
        )}
        {getDetectionSection('imagePropertiesAnnotation', 'image-properties', 'COLOR', annon =>
          <ul>
            {_.orderBy(annon.dominantColors.colors, ['score'], ['desc']).map((color, idx) =>
              <li key={idx} style={getColorStyle(color)} />
            )}
          </ul>
        )}
        {getDetectionSection('safeSearchAnnotation', 'safesearch-detection', 'INAPPROPRIATE', annon =>
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
      toggleHighlightFaceLandmarks: PropTypes.func.isRequired,
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
    this.props.emitter.addListener('showSidebar', (id) => {
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
    const animateScroll = (divid) => {
      const currentScroll = $('.detail-tab > section').prop('scrollTop')
      const el = $(`.${divid}`)
      if (el.length) {
        let targetScroll = el.position().top
        targetScroll += currentScroll
        $('.detail-tab > section').animate({scrollTop: targetScroll}, 'slow')
      }
    }
    const getIndicator = (key, icon, jumpTo, opts) => {
      const active = key in this.state.vision
      return (
        <li
          className={active ? 'active' : ''}
          onClick={animateScroll.bind(this, jumpTo)}
        >
          {opts && opts.customIcon ?
            <Button ripple inverse disabled={!active}>
              <span className={'custom-icon ' + icon} />
            </Button>
          :
            <Button icon={icon} ripple inverse disabled={!active} />
          }
        </li>
      )
    }

    return (
      <Drawer className="sidebar"
              active={sidebar.isActive}
              type="right"
              onOverlayClick={() => { this.props.emitter.emit('hideSidebar') }}>

        <ul className="feature-indicator">
          {getIndicator('labelAnnotations', 'label_outline', 'label-detection')}
          {getIndicator('textAnnotations', 'translate', 'text-detection')}
          {getIndicator('faceAnnotations', 'face', 'face-detection')}
          {getIndicator(
            'logoAnnotations', 'logo', 'logo-detection',
            { customIcon: true }
          )}
          {getIndicator('landmarkAnnotations', 'place', 'landmark-detection')}
          {getIndicator('imagePropertiesAnnotation', 'photo', 'image-properties')}
          {getIndicator(
            'safeSearchAnnotation', 'safesearch', 'safesearch-detection',
            { customIcon: true }
          )}
        </ul>

        <SidebarTabs className="detail-tab"
                     index={sidebar.tabIndex}
                     onChange={changeTab}>
          <Tab label='Graphical' className={classForTab(0)}>
            <GraphTab
              vision={this.state.vision}
              highlightFaceLandmarks={sidebar.highlightFaceLandmarks}
              toggleHighlightFaceLandmarks={this.props.toggleHighlightFaceLandmarks}
            />
          </Tab>
          <Tab label='JSON' className={classForTab(1)}>
            <pre>{JSON.stringify(this.state.vision, null, 2)}</pre>
          </Tab>
        </SidebarTabs>
      </Drawer>
    )
  }
}
