import _ from 'lodash'
import React, { PropTypes } from 'react'

const style = {
  color: '#9e9e9e',
  fontSize: 'medium',
  fontWeight: 'bold',
  padding: '4px 8px'
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

    this.state = { clusterName: '' }
  }

  componentWillMount() {
    this.props.emitter.addListener('currentCluster', (clusterName) => {
      this.setState({clusterName})
    })
  }

  componentWillUnmount() {
    this.props.emitter.removeAllListeners()
  }

  render() {
    return (
      <div style={this.props.style}>
        <h2 style={style}>{this.state.clusterName}</h2>
      </div>
    )
  }
}
