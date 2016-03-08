import React from 'react'

import THREE from 'three'
import Stats from 'three/examples/js/libs/stats.min'

require('../misc/TrackballControls.js')(THREE)

import 'stylesheets/RenderView'

import _ from 'lodash'

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

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 1000

    const scene = new THREE.Scene()


    const numberOfMockGroups = _.random(50, 500)

    // Mock data
    const data = []
    for (let i = 0; i < numberOfMockGroups; i++) {

      const groupLocation = new THREE.Vector3(
        _.random(-1000.0, 1000.0),
        _.random(-1000.0, 1000.0),
        _.random(-1000.0, 1000.0))

      const groupSize = _.random(10.0, 100.0)

      for (let j = 0; j < 100000/numberOfMockGroups; j++) {
        data.push({
          id: i,
          x: groupLocation.x + _.random(-groupSize, groupSize),
          y: groupLocation.y + _.random(-groupSize, groupSize),
          z: groupLocation.z + _.random(-groupSize, groupSize),
          g: i
        })
      }
    }

    // First sort by the group ID ascending
    const sortedData = _.orderBy(data, ['g'], ['asc'])

    // Generate an object consisting out of groups of cluster IDs
    const groupedData = _.groupBy(sortedData, (element) => element.g)

    const vertices = data.map((p) => new THREE.Vector3(p.x, p.y, p.z))

    const positions = new Float32Array(vertices.length * 3)
    const colors = new Float32Array(vertices.length * 3)
    const sizes = new Float32Array(vertices.length)

    const PARTICLE_SIZE = 10

    const color = new THREE.Color()

    const group = new THREE.Group()

    for (let i = 0, l = vertices.length; i < l; i++) {

      const vertex = vertices[ i ]
      vertex.toArray(positions, i * 3)

      color.setHex(0xffffff * Math.random())
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
    group.add(particles)

    // To achieve an effect similar to the mocks, we need to shoot a line
    // at another node that is most near, except if node that was already drawn to
    const nodesDrawnTo = {}

    _.forEach(groupedData, (value, key) => {
      const geometry = new THREE.Geometry()

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff * Math.random(),
        blending:     THREE.AdditiveBlending,
        depthTest:    false,
        transparent:  true
      })

      const vertices = value.map((p) => new THREE.Vector3(p.x, p.y, p.z))

      geometry.vertices = vertices

      const line = new THREE.Line( geometry, lineMaterial )
      group.add(line)
    })

    scene.add(group)

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

      group.rotation.x += 0.00005
      group.rotation.y += 0.0001

      stats.end()

      renderer.render(scene, camera)

    }

    animate()

  }
})
