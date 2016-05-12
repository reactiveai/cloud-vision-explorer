import React, { PropTypes } from 'react'
import 'stylesheets/ImageView'
import _ from 'lodash'

import { gcsBucketName } from '../config.js'

const getImageUrl = (id) => {
  return `https://storage.googleapis.com/${gcsBucketName}/image/${id}.jpg`
}

const style = {
  wrapper: {
    position: 'absolute',
    width: `calc(100vw - ${384 + 75}px)`,
    height: `calc(100% - ${20}px)`, // For some reason 'vw' doesn't work here
    margin: `10px ${384 + 20}px 10px 60px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

import { getVisionJsonURL } from '../misc/Util.js'

export default class ImaveView extends React.Component {
  static get propTypes() {
    return {
      emitter: PropTypes.object.isRequired,
      highlightFaceLandmarks: PropTypes.bool.isRequired
    }
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      active: false,
      vision: {},
      imgLeft: 0,
      imgTop: 0,
      imgWidthRatio: 1,
      imgHeightRatio: 1
    }
  }

  componentWillMount() {
    this.props.emitter.addListener('showSidebar', (id) => {
      this.setState({
        id,
        active: true
      })
      fetch(getVisionJsonURL(id)).then((res) => {
        return res.json()
      }).then((data) => {
        this.setState({ vision: data[0] })
      })
    })

    this.props.emitter.addListener('hideSidebar', () => {
      this.setState({ active: false, vision: {} })
    })
  }

  componentWillUnmount() {
    this.props.emitter.removeAllListeners()
  }

  onLoadFocusedImage() {
    const imageViewRect = this.refs.imageView.getBoundingClientRect()
    const img = this.refs.focusedImage
    const imgRect = img.getBoundingClientRect()
    this.setState(s => _.assign({}, s, {
      imgLeft: imgRect.left - imageViewRect.left,
      imgTop: imgRect.top - imageViewRect.top,
      imgWidthRatio: img.width / img.naturalWidth,
      imgHeightRatio: img.height / img.naturalHeight
    }))
  }

  render() {
    const { vision, imgLeft, imgTop, imgWidthRatio, imgHeightRatio } = this.state
    const getBoundingPolyStyle = (boundingPoly) => {
      const verts = _.orderBy(boundingPoly.vertices, ['x', 'y'])
      const leftTop = _.head(verts)
      const rightBottom = _.last(verts)
      return {
        left: `${leftTop.x * imgWidthRatio + imgLeft}px`,
        top: `${leftTop.y * imgHeightRatio + imgTop}px`,
        width: `${(rightBottom.x - leftTop.x) * imgWidthRatio}px`,
        height: `${(rightBottom.y - leftTop.y) * imgHeightRatio}px`
      }
    }
    const getLandmarkStyle = (landmark) => {
      return {
        left: `${landmark.position.x * imgWidthRatio + imgLeft}px`,
        top: `${landmark.position.y * imgHeightRatio + imgTop}px`
      }
    }
    const getFaceLandmarks = () => {
      return 'faceAnnotations' in vision ?
        vision.faceAnnotations.map((face, idx) =>
          <div className="face-detection-overlay" key={idx}>
            <div className="face-bounding-poly"
              style={getBoundingPolyStyle(face.boundingPoly)}>
              <div className="face-id">{idx + 1}</div>
            </div>
            {face.landmarks.map(landmark =>
              <img
                className="face-landmark" style={getLandmarkStyle(landmark)}
                key={landmark.type}
                src={require(`../../images/icon/face_landmark${idx % 3}`)}
              />
            )}
          </div>
        ) : ''
    }
    if(this.state.active) {
      return (
        <div ref="imageView" className="image-view" style={style.wrapper}>
          <img
            className="focused-image"
            ref="focusedImage"
            src={getImageUrl(this.state.id)}
            onLoad={this.onLoadFocusedImage.bind(this)}
          />
          {this.props.highlightFaceLandmarks ? getFaceLandmarks() : ''}
        </div>
      )
    }

    return <span />
  }
}
