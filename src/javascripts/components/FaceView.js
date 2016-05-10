
import React    from 'react'
import THREE    from 'three'

// Load some webpack-incompatible modules
require('../misc/OBJLoader.js')(THREE)

export default React.createClass({
  render() {
    return (
      <div ref={(c) => this._container = c} className={this.props.className}></div>
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

    const camera = new THREE.PerspectiveCamera(70, this._container.clientWidth / this._container.clientHeight, 1, 1000)
    camera.position.z = 3

    const scene = new THREE.Scene()

    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(this._container.clientWidth, this._container.clientHeight)
    this._container.appendChild(renderer.domElement)

    const ambient_light = new THREE.AmbientLight(0x333333)
    scene.add(ambient_light)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, -1, 0)
    scene.add(directionalLight)

    const point_light = new THREE.PointLight(0xffffff)
    point_light.position.x = 2
    point_light.position.y = 5
    point_light.position.z = 10
    scene.add(point_light)

    const group = new THREE.Object3D()
    scene.add(group)

    group.rotation.x = THREE.Math.degToRad(-this.props.tiltAngle)
    group.rotation.y = THREE.Math.degToRad(this.props.panAngle)
    group.rotation.z = THREE.Math.degToRad(-this.props.rollAngle)

    const loader = new THREE.OBJLoader()

    loader.load(
      'models/head.obj',
      (object) => {
        object.traverse((child) => {
          if ( child instanceof THREE.Mesh ) {
            child.material = new THREE.MeshPhongMaterial({
              color: this.props.faceColor || 0xff0000
            })
          }
        })

        group.add(object)
      }
    )

    const animate = () => {
      requestAnimationFrame(animate)

      renderer.render(scene, camera)
    }

    animate()
  }
})
