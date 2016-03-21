import React, { PropTypes } from 'react'

const getImageUrl = (id) => {
  return `https://storage.googleapis.com/gcs-samples2-explorer/image/${id}.jpg`
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
  },
  img: {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
    border: '2px solid black'
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
