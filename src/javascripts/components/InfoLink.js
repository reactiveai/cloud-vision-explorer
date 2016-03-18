import _ from 'lodash'
import React, { PropTypes } from 'react'
import Link from 'react-toolbox/lib/link'

const TARGET_IMAGE_IDS = [
  {id: '8fc425eaa277db86186edd229b0e3591' },
  {id: '0c68e487dd8f16f343341569c29733b3' },
  {id: '9feac60b880aec9cc8d1235ede925c9d' },
  {id: '9cd08b4c67b69017a6c3a8682de6270d' }
]

const style = {
  h1: {
    color: '#cccccc',
    fontSize: 'x-small',
    marginBottom: 50
  },
  ul: {
    listStyleType: 'none',
    color: '#cccccc',
    paddingLeft: '0vh'
  },
  li: {
    cursor: 'pointer',
    marginBottom: 10
  }
}

const getThumbUrl = (id) => {
  return `https://gcs-samples2-explorer.storage.googleapis.com/thumbnail/32x32/${id}.jpg`
}

export default class InfoLink extends React.Component {
  static get propTypes() {
    return {
      emitter: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }
  }

  render() {
    const listItems = _.map(TARGET_IMAGE_IDS, (item) => {
      return (
        <li key={item.id} style={style.li}
            onClick={() => { this.props.emitter.emit('showSidebar', item.id) }}>
          <img src={getThumbUrl(item.id)} />
        </li>
      )
    })

    return (
      <div style={this.props.style}>
        <img className="gcp-logo" src="/images/Google-Cloud-Platform.png" /><br />
        <h1 style={style.h1}>Cloud Vision API<br/>Demo</h1>
        <ul style={style.ul}>
          {listItems}
        </ul>
      </div>
    )
  }
}
