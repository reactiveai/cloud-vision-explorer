import _ from 'lodash'
import React, { PropTypes } from 'react'
import Link from 'react-toolbox/lib/link'

const OPEN_IMAGE_BOOKMARK_IDS = [
  {id: '24e144ee08ce069fd077904f9039a5f4' },  // Cat
  {id: '8fc425eaa277db86186edd229b0e3591' },  // Kangaroo
  {id: '22b8f17c84059d5d293278f47d1561bf' },  // Ethnic Clothes
  {id: '0c68e487dd8f16f343341569c29733b3' },  // Citi Field
  {id: '326c917aed041bc7926238973ec5d36b' }   // Android
]

// These are actually also image IDs, because it's easy to reference them
// even though we're just using them to zoom to a particular part of a cluster
const ZOOM_CLUSTER_BOOKMARK_IDS = [
  {id: 'c8261057a5ff2d642d05c32824fa3a2c' },  // Bird
  {id: 'c7ead95d2cecba86a6d8e5eb4928cbbf' },  // Flower
  {id: 'b550497b9dd1937694ed7647620a258e' },  // Residental area
]

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
  return `https://storage.googleapis.com/gcs-samples2-explorer/thumbnail/32x32/${id}.jpg`
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
            onClick={() => { this.props.emitter.emit('showSidebar', item.id) }}>
          <img src={getThumbUrl(item.id)} />
        </li>
      )
    })

    const zoomBookmarks = _.map(ZOOM_CLUSTER_BOOKMARK_IDS, (item) => {
      return (
        <li key={item.id} style={style.imageBookmarks.li}
            onClick={() => { this.props.emitter.emit('zoomToImage', item.id) }}>
          <img src={getThumbUrl(item.id)} />
        </li>
      )
    })

    return (
      <div style={this.props.style}>
        <img className="gcp-logo" src="/images/Google-Cloud-Platform.png" /><br />
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
