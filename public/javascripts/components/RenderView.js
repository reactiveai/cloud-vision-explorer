import React from 'react'

import THREE from 'three'

export default React.createClass({
  render() {
    return (
      <div>
        Render view
        <div ref={(c) => this._container = c} ></div>
      </div>
    )
  },
  // Perhaps this is added for performance reasons?
  shouldComponentUpdate() {
    console.log('shouldComponentUpdate')
    return false
  },
  componentDidMount() {

    console.log('componentDidMount')

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 400

    const scene = new THREE.Scene()

    const geometry = new THREE.BoxGeometry(200, 200, 200)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    this._container.appendChild(renderer.domElement)

    window.addEventListener('resize', () => {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)

    }, false)

    const animate = () => {

      requestAnimationFrame(animate)

      mesh.rotation.x += 0.01
      mesh.rotation.y += 0.01

      renderer.render(scene, camera)

    }

    animate()

  }
})
