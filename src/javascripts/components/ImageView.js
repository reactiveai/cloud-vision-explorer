import _ from 'lodash'
import $ from 'npm-zepto'
import React, { PropTypes } from 'react'

const getImageUrl = (id) => {
  return `https://gcs-samples2-explorer.storage.googleapis.com/image/${id}.jpg`
}

const style = {
  wrapper: {
    margin: '0 auto'
  },
  img: {
    width: '200px',
    height: '200px'
  }
}

export default class Sidebar extends React.Component {
  static get propTypes() {
    return {
      emitter: PropTypes.object.isRequired
    }
  }

  constructor(props, context) {
    super(props, context)

    this.state = { active: false }
  }

  componentWillMount() {
    this.props.emitter.addListener('showSidebar', (id) => {
      this.setState({
        id,
        active: true,
      })
    })

    this.props.emitter.addListener('hideSidebar', (id) => {
      this.setState({active: false})
    })
  }

  componentWillUnmount() {
    this.props.emitter.removeAllListeners()
  }

  render() {
    if(this.state.active) {
      return (
        <div style={style.wrapper}>
          <img style={style.img} src={getImageUrl(this.state.id)} />
        </div>
      )
    }

    return <span />
  }
}
