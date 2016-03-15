import React from 'react'

import THREE from 'three'
import TWEEN from 'tween.js'
import Stats from 'three/examples/js/libs/stats.min'

require('../misc/TrackballControls.js')(THREE)

import 'stylesheets/RenderView'

import _ from 'lodash'
import $ from 'npm-zepto'

import Shaders from '../misc/Shaders.js'

import { generateMockData } from '../misc/Util.js'

import io from 'socket.io-client'

// Promise jQuery getJSON version
const getJSON = (url) => new Promise((resolve) => $.getJSON(url, resolve))


// Promise TWEEN
const tween = (start, end, duration, onUpdateFn, easingFn = TWEEN.Easing.Quadratic.In) => {
  return new Promise((resolve) => {
    new TWEEN.Tween(start)
      .to(end, duration)
      .start()
      .easing(easingFn)
      .onUpdate(onUpdateFn) // Can't use arrow functions here as 'this' would be undefined
      .onComplete(resolve)
  })
}

export default React.createClass({
  render() {
    return (
      <div ref={(c) => this._container = c} className="render-view">
</div>
    )
  },

  propTypes: {
    emitter: React.PropTypes.object.isRequired
  },

  // Perhaps this is added for performance reasons?
  shouldComponentUpdate() {
    console.log('shouldComponentUpdate')
    return false
  },
  componentDidMount() {

    getJSON('http://gcs-samples2-explorer.storage.googleapis.com/datapoint/output_1k.json').then((data) => {

      // Normalize data
      data.points.forEach((elem) => {
        elem.x *= 1000.0
        elem.y *= 1000.0
        elem.z *= 1000.0
      })

      this._setupScene(data.points)
    })

    // {
    //   const data = generateMockData(1, 100, 0)
    //   this._setupScene(data)
    // }

  },
  _setupScene(data) {

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 3000

    const scene = new THREE.Scene()

    const raycaster = new THREE.Raycaster()

    // Increase the default mouseover detection radius of points
    raycaster.params.Points.threshold = 5

    const mouse = new THREE.Vector2()

    // Do some post-processing
    data.forEach((n, i) => {
      // Add a real THREE vector for easy access later
      n.vec = new THREE.Vector3(n.x, n.y, n.z)

      // Add a real THREE color
      n.color = new THREE.Color()

      // Add the index too for easy post-processing
      n.index = i

      // Add a resolved promised so we can chain events to it
      n._promise = Promise.resolve()
    })

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

    const positions = new Float32Array(data.length * 3)
    const colors = new Float32Array(data.length * 3)
    const sizes = new Float32Array(data.length)

    const PARTICLE_SIZE = 10

    const group = new THREE.Group()

    for (let i = 0, l = data.length; i < l; i++) {

      const vertex = data[ i ].vec
      vertex.toArray(positions, i * 3)

      data[i].color.setHex(groupedData[data[i].g].color)
      data[i].color.toArray(colors, i * 3)

      sizes[i] = PARTICLE_SIZE
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
      vertexShader: Shaders.points.vertexShader,
      fragmentShader: Shaders.points.fragmentShader,
      alphaTest: 0.5,
      depthTest: false
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
        opacity: 0.18
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

    document.addEventListener( 'mousemove', () => {
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    }, false)

    const socket = io()

    socket.on('connect', () => {
      console.debug('connected')
    })

    const sendAndAwait = (event, data) => new Promise((resolve) => { socket.emit(event, data, resolve) })

    window.addEventListener('resize', () => {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)

      controls.handleResize()

    }, false)

    let lastClickedNodeIndex = null
    let lastIntersectIndex = null

    let currentListOfNearbyVectors = []

    const updateNodeColor = (r, g, b, index) => {
      const attributes = geometry.attributes

      const color = new THREE.Color(r, g, b)
      color.toArray(attributes.customColor.array, index * 3)
      attributes.customColor.needsUpdate = true
    }


    const checkForImagesThatCanBeDownloaded = _.throttle(() => {
      // Keep track of particles that are within our range, and particles
      // that are outside our range. Add images for the ones that are near
      const listOfNearbyVectors = []
      data.forEach((n) => {
        if (n.vec.distanceToSquared(camera.position) < Math.pow(500, 2)) {
          listOfNearbyVectors.push(n)
        }
      })

      const listOfRemovedNearbyVectors = currentListOfNearbyVectors.filter((nearbyVector) => {
        return !_.includes(listOfNearbyVectors, nearbyVector)
      })

      listOfRemovedNearbyVectors.forEach((nearbyVector) => {
        nearbyVector._promise = nearbyVector._promise
        .then(() => {
          return tween({
            o: 1.0
          }, {
            o: 0.0
          }, 1000, function () {
            nearbyVector.plane.material.opacity = this.o
          })
          .then(() => {
            nearbyVector.plane.material.map.dispose()
            nearbyVector.plane.material.dispose()

            group.remove(nearbyVector.plane)

            delete nearbyVector.plane
          })
          .then(() => {
            return tween({
              r: 0,
              g: 0,
              b: 0
            }, {
              r: nearbyVector.color.r,
              g: nearbyVector.color.g,
              b: nearbyVector.color.b
            }, 1000, function () {
              updateNodeColor(this.r, this.g, this.b, nearbyVector.index)
            })
          })

        }
      })

      const listOfNewNearbyVectors = listOfNearbyVectors.filter((nearbyVector) => {
        return !_.includes(currentListOfNearbyVectors, nearbyVector)
      })

      listOfNewNearbyVectors.forEach((nearbyVector) => {
        nearbyVector._promise = nearbyVector._promise
        .then(() => {
          return tween({
            r: nearbyVector.color.r,
            g: nearbyVector.color.g,
            b: nearbyVector.color.b
          }, {
            r: 0,
            g: 0,
            b: 0
          }, 1000, function () {
            updateNodeColor(this.r, this.g, this.b, nearbyVector.index)
          })
        })
      })

      const listOfNewNearbyVectorsIds = listOfNewNearbyVectors.map((v) => v.i)

      // Only request thumbs if there are any vectors nearby at all
      if (listOfNewNearbyVectorsIds.length) {
        const getAllImagesPromise = sendAndAwait('thumb64', listOfNewNearbyVectorsIds)
        .then((thumbs) => {
          thumbs.forEach((thumb, i) => {

            const nearbyVector = listOfNewNearbyVectors[i]

            nearbyVector._promise = nearbyVector._promise.then(() => {
              // Magic here! (ArrayBuffer to Base64String)
              const b64img = btoa([].reduce.call(new Uint8Array(thumb),(p,c) => {return p+String.fromCharCode(c)},'')) //eslint-disable-line

              const image = new Image()
              image.src = `data:image/jpeg;base64,${b64img}`

              const texture = new THREE.Texture()
              texture.image = image
              image.onload = function() {
                texture.needsUpdate = true
              }

              const spriteMaterial = new THREE.SpriteMaterial({
                // color: 0xff0000,
                transparent: true,
                opacity: 0,
                map: texture
              })

              nearbyVector.plane = new THREE.Sprite(spriteMaterial)
              nearbyVector.plane.position.copy(nearbyVector.vec)
              nearbyVector.plane.scale.multiplyScalar(5)

              group.add(nearbyVector.plane)
            })
            .then(() => {
              return tween({
                o: 0
              }, {
                o: 1.0
              }, 1000, function () {
                nearbyVector.plane.material.opacity = this.o
              })
            })

          })
        })

      }

      currentListOfNearbyVectors = listOfNearbyVectors
    }, 1000)

    document.addEventListener( 'mouseup', (e) => {
      e.preventDefault()

      raycaster.setFromCamera( mouse, camera )
      const intersects = raycaster.intersectObject(particles)

      if ( intersects.length > 0 ) {
        if ( lastClickedNodeIndex != intersects[ 0 ].index ) {
          lastClickedNodeIndex = intersects[ 0 ].index
          this.props.emitter.emit('showSidebar', data[lastClickedNodeIndex].i)
        }
      }
    }, false)

    const tick = () => {

      // TODO fix absolute coords for nodes
      // group.rotation.x += 0.00005
      // group.rotation.y += 0.0001

      const geometry = particles.geometry
      const attributes = geometry.attributes

      raycaster.setFromCamera( mouse, camera )

      const intersects = raycaster.intersectObject(particles)

      // If our mouse hovers over something
      if ( intersects.length > 0 ) {

        // If the object we're hovering over is different from what we last hovered over
        if ( lastIntersectIndex != intersects[ 0 ].index ) {

          // If we have hovered over something before
          if (lastIntersectIndex) {

          }

          lastIntersectIndex = intersects[ 0 ].index




        }


      }
      // If we're not hovering over something
      else {
        // If we were hovering over an object before
        if ( lastIntersectIndex !== null ) {


          lastIntersectIndex = null

        }
      }

      checkForImagesThatCanBeDownloaded()

    }

    const animate = () => {

      stats.begin()

      controls.update()

      requestAnimationFrame(animate)

      TWEEN.update()

      tick()

      stats.end()

      renderer.render(scene, camera)

    }

    animate()

  }
})
