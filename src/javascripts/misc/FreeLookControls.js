import _        from 'lodash'

module.exports = (THREE) => {
  THREE.FreeLookControls = function (object, element) {
    const PI_2 = Math.PI / 2
    const mouseQuat = {
      x: new THREE.Quaternion(),
      y: new THREE.Quaternion()
    }

    const xVector = new THREE.Vector3( 1, 0, 0 )
    const yVector = new THREE.Vector3( 0, 1, 0 )

    this.holdingDownMouse = false
    this.hasRecentlyRotated = false

    this.enabled = true

    this.orientation = {
      x: 0,
      y: 0,
    }

    const clearRecentlyRotated = _.debounce(() => {
      this.hasRecentlyRotated = false
    }, 100)

    this.update = function() {
      if ( this.enabled === false ) return

      mouseQuat.x.setFromAxisAngle( xVector, this.orientation.x )
      mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y )

      const quat = new THREE.Quaternion()
      quat.copy( mouseQuat.y ).multiply( mouseQuat.x )

      this.orientation.x = 0
      this.orientation.y = 0

      object.quaternion.multiply(quat)
    }

    let previousEvent = null

    element.addEventListener('mousemove', (event) => {
      if ( this.enabled === false || !this.holdingDownMouse ) return

      if (!previousEvent) {
        previousEvent = {
          screenX: event.screenX,
          screenY: event.screenY
        }
      }

      this.hasRecentlyRotated = true
      clearRecentlyRotated()

      const movementX = event.screenX - previousEvent.screenX
      const movementY = event.screenY - previousEvent.screenY

      previousEvent = {
        screenX: event.screenX,
        screenY: event.screenY
      }

      this.orientation.y += movementX * 0.0025
      this.orientation.x += movementY * 0.0025

      this.orientation.x = Math.max( - PI_2, Math.min( PI_2, this.orientation.x ) )
    }, false )

    element.addEventListener( 'mousedown', () => {
      this.holdingDownMouse = true
    }, false)

    element.addEventListener( 'mouseup', () => {
      this.holdingDownMouse = false
      previousEvent = null
    }, false)
  }
}
