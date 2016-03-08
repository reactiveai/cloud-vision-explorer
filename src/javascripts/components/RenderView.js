import React from 'react'

import THREE from 'three'
import Stats from 'three/examples/js/libs/stats.min'

require('../misc/TrackballControls.js')(THREE)

import 'stylesheets/RenderView'

const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min

export default React.createClass({
  render() {
    return (
      <div ref={(c) => this._container = c} className="render-view">
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
    camera.position.z = 1000

    const scene = new THREE.Scene()


    const vertices = []
    for (let i = 0; i < 1000; i++) {
      vertices.push(new THREE.Vector3(
        getRandomArbitrary(-1000, 1000),
        getRandomArbitrary(-1000, 1000),
        getRandomArbitrary(-1000, 1000)
      ))
    }

    const positions = new Float32Array(vertices.length * 3)
    const colors = new Float32Array(vertices.length * 3)
    const sizes = new Float32Array(vertices.length)

    const PARTICLE_SIZE = 20

    const color = new THREE.Color()

    for (let i = 0, l = vertices.length; i < l; i++) {

      const vertex = vertices[ i ]
      vertex.toArray(positions, i * 3)

      color.setHSL(0.01 + 0.1 * ( i / l ), 1.0, 0.5)
      color.toArray(colors, i * 3)

      sizes[i] = PARTICLE_SIZE * 0.5

    }

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color:   { type: 'c', value: new THREE.Color( 0xffffff ) },
        texture: { type: 't', value: new THREE.TextureLoader().load( 'images/disc.png' ) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;

        varying vec3 vColor;

        void main() {

          vColor = customColor;

          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

          gl_PointSize = size * ( 300.0 / -mvPosition.z );

          gl_Position = projectionMatrix * mvPosition;

        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D texture;

        varying vec3 vColor;

        void main() {

          gl_FragColor = vec4( color * vColor, 1.0 );

          gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );

          if ( gl_FragColor.a < ALPHATEST ) discard;

        }
      `,
      alphaTest: 0.9,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const controls = new THREE.TrackballControls(camera)

    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 1.2
    controls.panSpeed = 0.8

    controls.noZoom = false
    controls.noPan = false

    controls.staticMoving = true
    controls.dynamicDampingFactor = 0.3

    controls.keys = [ 65, 83, 68 ]

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

      controls.handleResize()

    }, false)

    const animate = () => {

      stats.begin()

      controls.update()

      requestAnimationFrame(animate)

      particles.rotation.x += 0.0005
      particles.rotation.y += 0.001

      stats.end()

      renderer.render(scene, camera)

    }

    animate()

  }
})
