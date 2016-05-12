
import React    from 'react'

import getBase64FaceImage from '../misc/FaceRenderer.js'

export default React.createClass({
  render() {
    return (
      <img ref={(c) => this._image = c} className={this.props.className} />
    )
  },

  propTypes: {
    className: React.PropTypes.string,
    faceColor: React.PropTypes.number,
    rollAngle: React.PropTypes.number,
    panAngle: React.PropTypes.number,
    tiltAngle: React.PropTypes.number
  },

  // Perhaps this is added for performance reasons?
  shouldComponentUpdate() {
    return false
  },

  componentDidMount() {
    this._image.src = getBase64FaceImage(this.props.tiltAngle,
      this.props.panAngle,
      this.props.rollAngle,
      this.props.faceColor)
  }
})
