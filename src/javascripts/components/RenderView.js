import React from 'react'

import THREE from 'three'
import Stats from 'three/examples/js/libs/stats.min'

require('../misc/TrackballControls.js')(THREE)

import 'stylesheets/RenderView'

import _ from 'lodash'
import $ from 'npm-zepto'

const generateMockData = () => {
  const numberOfMockGroups = _.random(50, 500)

  // Mock data
  const data = []
  for (let i = 0; i < numberOfMockGroups; i++) {

    const groupLocation = new THREE.Vector3(
      _.random(-1000.0, 1000.0),
      _.random(-1000.0, 1000.0),
      _.random(-1000.0, 1000.0))

    const groupSize = _.random(10.0, 500.0)

    for (let j = 0; j < 100000/numberOfMockGroups; j++) {
      data.push({
        id: i,
        x: groupLocation.x + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
        y: groupLocation.y + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
        z: groupLocation.z + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
        g: i
      })
    }
  }

  return data
}

// Promise jQuery getJSON version
const getJSON = (url) => new Promise((resolve) => $.getJSON(url, resolve))

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

    // getJSON('/output.json').then((data) => {
    //
    //   // Normalize data
    //   data.forEach((elem) => {
    //     elem.x *= 1000.0
    //     elem.y *= 1000.0
    //     elem.z *= 1000.0
    //   })
    //
    //   this._setupScene(data)
    // })

    {
      const data = generateMockData()
      this._setupScene(data)
    }

  },
  _setupScene(data) {

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 1000

    const scene = new THREE.Scene()

    // First sort by the group ID ascending
    const sortedData = _.orderBy(data, ['g'], ['asc'])

    // Generate an object consisting out of groups of cluster IDs
    const groupedData = _.groupBy(sortedData, (element) => element.g)

    // Add metadata to each group
    _.each(groupedData, (value, key, coll) => {
      coll[key] = {
        nodes: value,
        color: 0xffffff * Math.random()
      }
    })

    // Extract a pure vector array
    const vertices = data.map((p) => new THREE.Vector3(p.x, p.y, p.z))

    const positions = new Float32Array(vertices.length * 3)
    const colors = new Float32Array(vertices.length * 3)
    const sizes = new Float32Array(vertices.length)

    const PARTICLE_SIZE = 40

    const color = new THREE.Color()

    const group = new THREE.Group()

    for (let i = 0, l = vertices.length; i < l; i++) {

      const vertex = vertices[ i ]
      vertex.toArray(positions, i * 3)

      color.setHex(groupedData[data[i].g].color)
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
    _.forEach(groupedData, (value) => {
      const geometry = new THREE.Geometry()

      const lineMaterial = new THREE.LineBasicMaterial({
        color: value.color,
        blending:     THREE.AdditiveBlending,
        depthTest:    false,
        transparent:  true,
        opacity: 0.2
      })

      const vertices = value.nodes.map((p) => new THREE.Vector3(p.x, p.y, p.z))

      const findClosestVertex = (list, other, closeNess=0) => {
        const clonedArr = _.without(_.clone(list), other)
        clonedArr.sort((a, b) => a.distanceToSquared(other) - b.distanceToSquared(other))
        return clonedArr[closeNess]
      }

      const allowedVerticesToSearch = _.clone(vertices)

      const sortedVertices = []

      const doSearch = (list, v) => {
        if (sortedVertices.length === 0) {
          sortedVertices.push(v)
        }

        list = _.without(list, v)
        const nextVertex = findClosestVertex(list, v)
        if (nextVertex) {
          sortedVertices.push(nextVertex)
          doSearch(list, nextVertex)
        }
      }

      doSearch(allowedVerticesToSearch, vertices[0])

      geometry.vertices = sortedVertices

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
