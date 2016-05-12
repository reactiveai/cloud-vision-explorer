import _ from 'lodash'
import React, { PropTypes } from 'react'

import 'stylesheets/InfoLink'

import { OPEN_IMAGE_BOOKMARK_IDS, ZOOM_CLUSTER_BOOKMARK_IDS } from '../misc/Constants.js'
import { gcsBucketName } from '../config.js'

const style = {
  h1: {
    color: '#cccccc',
    fontSize: 'x-small',
    marginBottom: 50
  },
  imageBookmarks: {
    ul: {
      listStyleType: 'none',
      color: '#cccccc',
      paddingLeft: '0vh'
    },
    li: {
      cursor: 'pointer',
      marginBottom: 10
    }
  },
  zoomBookmarks: {
    ul: {
      marginTop: '50px',
      listStyleType: 'none',
      color: '#cccccc',
      paddingLeft: '0vh'
    },
    li: {
      cursor: 'pointer',
      marginBottom: 10
    }
  }
}

const getThumbUrl = (id) => {
  return `https://storage.googleapis.com/${gcsBucketName}/thumbnail/64x64/${id}.jpg`
}

export default class InfoLink extends React.Component {
  static get propTypes() {
    return {
      emitter: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }
  }

  render() {
    const imageBookmarks = _.map(OPEN_IMAGE_BOOKMARK_IDS, (item) => {
      return (
        <li key={item.id} style={style.imageBookmarks.li}
            onClick={() => { this.props.emitter.emit('zoomToImage', item.id, true) }}>
          <img src={getThumbUrl(item.id)} className='thumbnailImg' />
        </li>
      )
    })

    const zoomBookmarks = _.map(ZOOM_CLUSTER_BOOKMARK_IDS, (item) => {
      return (
        <li key={item.id} style={style.imageBookmarks.li}
            onClick={() => { this.props.emitter.emit('zoomToImage', item.id) }}>
          <img src={getThumbUrl(item.id)} className='thumbnailImg' />
        </li>
      )
    })

    return (
      <div style={this.props.style}>
        <img className="gcp-logo" src="/images/Vision-API.png" /><br />
        <h1 style={style.h1}>Cloud Vision API<br/>Demo</h1>
        <ul style={style.imageBookmarks.ul}>
          {imageBookmarks}
        </ul>
        <ul style={style.zoomBookmarks.ul}>
          {zoomBookmarks}
        </ul>
      </div>
    )
  }
}
