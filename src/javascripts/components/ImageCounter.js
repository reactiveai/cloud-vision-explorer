import React, { PropTypes } from 'react'
import numeral from 'numeral'

const style = {
  number: {
    color: '#9e9e9e',
    fontSize: 'x-large',
    fontWeight: 'lighter',
    padding: '4px 8px'
  },
  text: {
    fontSize: 'medium',
    paddingLeft: 5
  }
}

export default class ClusterLabel extends React.Component {
  static get propTypes() {
    return {
      emitter: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }
  }

  constructor(props, context) {
    super(props, context)

    this.state = { count: 0 }
  }

  componentWillMount() {
    this.props.emitter.addListener('imageCount', (count) => {
      this.setState({count})
    })
  }

  componentWillUnmount() {
    this.props.emitter.removeAllListeners()
  }

  render() {
    return (
      <div style={this.props.style}>
        <div style={style.number}>
          {numeral(this.state.count).format('0,0')}
          <span style={style.text}>IMAGES</span>
        </div>
      </div>
    )
  }
}
