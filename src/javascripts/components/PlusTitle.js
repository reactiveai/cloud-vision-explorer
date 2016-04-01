import React, { PropTypes } from 'react'

const styles = {
  plusTopLeft: {
    position: 'absolute',
    width: '16px',
    left: '-8px',
    top: '-8px'
  },
  plusTopRight: {
    position: 'absolute',
    width: '16px',
    right: '-8px',
    top: '-8px'
  },
  plusBottomLeft: {
    position: 'absolute',
    width: '16px',
    left: '-8px',
    bottom: '-8px'
  },
  plusBottomRight: {
    position: 'absolute',
    width: '16px',
    right: '-8px',
    bottom: '-8px'
  },
  wrapper: {
    position: 'relative',
    padding: '15px 20px',
    display: 'inline-block'
  }
}

const PlusIcon = (props) => {
  return (
    <svg style={props.style} id="Text" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.48 25.48">
      <title>+</title>
      <rect x="12.15" width="1.18" height="25.48"/>
      <rect y="12.15" width="25.48" height="1.18"/>
    </svg>
  )
}

PlusIcon.propTypes = {
  style: PropTypes.object.isRequired
}

export default class PlusTitle extends React.Component {
  static get propTypes() {
    return {
      children: React.PropTypes.node
    }
  }

  render() {
    return (
      <div className="plus-title" style={styles.wrapper}>
        <PlusIcon style={styles.plusTopLeft}></PlusIcon>
        <PlusIcon style={styles.plusTopRight}></PlusIcon>
        <PlusIcon style={styles.plusBottomLeft}></PlusIcon>
        <PlusIcon style={styles.plusBottomRight}></PlusIcon>
        {this.props.children}
      </div>
    )
  }
}
