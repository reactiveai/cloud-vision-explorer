import React from 'react'

import THREE from 'three'
import Stats from 'three/examples/js/libs/stats.min'

import 'stylesheets/RenderView'

export default React.createClass({
  render() {
    return (
      <div ref={(c) => this._container = c} className="render-view"></div>
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

    const group = new THREE.Group()
    scene.add( group )

    for ( let i = 0; i < 1000; i++ ) {

      const material = new THREE.SpriteMaterial()

      const particle = new THREE.Sprite( material )

      particle.position.x = Math.random() * 2000 - 1000
      particle.position.y = Math.random() * 2000 - 1000
      particle.position.z = Math.random() * 2000 - 1000

      particle.scale.x = particle.scale.y = Math.random() * 20 + 10
      group.add( particle )
    }



    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    this._container.appendChild(renderer.domElement)

    const stats = new Stats()
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.top = '0px'
    this._container.appendChild(stats.domElement)

    window.addEventListener('resize', () => {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)

    }, false)

    const animate = () => {

      stats.begin()

      requestAnimationFrame(animate)

      group.rotation.x += 0.001
      group.rotation.y += 0.002

      stats.end()

      renderer.render(scene, camera)

    }

    animate()

  }
})
