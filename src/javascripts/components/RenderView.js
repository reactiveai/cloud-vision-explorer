/*global $*/

import React from 'react'

import THREE from 'three'
import TWEEN from 'tween.js'

require('../misc/TrackballControls.js')(THREE)

import 'stylesheets/RenderView'

import _ from 'lodash'

import Shaders from '../misc/Shaders.js'

import { getVisionJsonURL, preloadImage } from '../misc/Util.js'

import io from 'socket.io-client'

import Random from 'random-js'
const random = new Random(Random.engines.mt19937().seed(0))

const DATAPOINT_URL = 'https://storage.googleapis.com/gcs-samples2-explorer/datapoint/output_100k.json'

const tweenSpeed = 200
const thumbCheckSpeed = 100
const denseFactor = 1000.0
const nodeAnimationOrbitDistance = denseFactor * 1.5

// When this is not null, the camera will zoom in to this thumb
// If a mouse event happens, set it back to null
let currentlyTrackingNode = null
let currentlyZoomedCluster = null
let cameraAnimationQueue = Promise.resolve()

// Promise TWEEN
const tween = (start, end, duration, onUpdateFn, easingFn = TWEEN.Easing.Quadratic.InOut) => {
  return new Promise((resolve) => {
    new TWEEN.Tween(start)
      .to(end, duration)
      .start()
      .easing(easingFn)
      .onUpdate(onUpdateFn) // Can't use arrow functions here as 'this' would be undefined
      .onComplete(resolve)
  })
}

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))

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
    fetch(DATAPOINT_URL).then((res) => {
      return res.json()
    }).then((data) => {

      data.clusters.forEach((c) => {
        if (c.label === 'font') c.label = 'text'
        if (c.label === 'statue') c.label = 'architecture'
        if (c.label === 'animal') c.label = ''
        if (c.label === 'food') c.label = 'animal'
      })

      this._setupScene(data)
    })

    // {
    //   const data = generateMockData(1, 100, 0)
    //   this._setupScene(data)
    // }

  },
  _setupScene({points, clusters}) {
    this.props.emitter.emit('imageCount', points.length)

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, denseFactor * 10)
    camera.position.z = denseFactor * 1.2

    const scene = new THREE.Scene()

    const raycaster = new THREE.Raycaster()

    // Increase the default mouseover detection radius of points
    raycaster.params.Points.threshold = denseFactor / 1000

    const mouse = new THREE.Vector2()

    // Do some post-processing
    points.forEach((n, i) => {
      // Add a real THREE vector for easy access later
      n.vec = new THREE.Vector3(n.x, n.y, n.z)

      // Normalize it
      n.vec.multiplyScalar(denseFactor)

      // Add a real THREE color
      n.color = new THREE.Color()

      // Add the index too for easy post-processing
      n.index = i

      // Add a resolved promised so we can chain events to it
      n._promise = Promise.resolve()
    })

    // First sort by the group ID ascending
    const sortedData = _.orderBy(points, ['g'], ['asc'])

    // Generate an object consisting out of groups of cluster IDs
    const groupedData = _.groupBy(sortedData, (element) => element.g)

    // Add metadata to each group
    _.each(groupedData, (value, key, coll) => {
      coll[key] = {
        nodes: value,
        color: new THREE.Color(0xffffff * random.real(0.0, 1.0))
      }
    })

    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)
    const sizes = new Float32Array(points.length)

    const PARTICLE_SIZE = denseFactor / 100

    const group = new THREE.Group()

    for (let i = 0, l = points.length; i < l; i++) {

      const vertex = points[ i ].vec
      vertex.toArray(positions, i * 3)

      points[i].color.set(groupedData[points[i].g].color)
      points[i].color.toArray(colors, i * 3)

      sizes[i] = PARTICLE_SIZE
    }

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const updateNodeColor = (r, g, b, index) => {
      const attributes = geometry.attributes

      const color = new THREE.Color(r, g, b)
      color.toArray(attributes.customColor.array, index * 3)
      attributes.customColor.needsUpdate = true
    }

    const updateGroupColor = _.throttle((r, g, b, group) => {
      points.forEach((p, i) => {
        if (p.g === group) {
          if (!points[i].plane) {
            updateNodeColor(r, g, b, i)
          }
        }
      })
    }, 100)

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color:   { type: 'c', value: new THREE.Color( 0xffffff ) },
        texture: { type: 't', value: new THREE.TextureLoader().load( 'images/disc.png' ) }
      },
      vertexShader: Shaders.points.vertexShader,
      fragmentShader: Shaders.points.fragmentShader,
      alphaTest: 0.5,
      transparent: true,
      depthTest: false
    })

    const particles = new THREE.Points(geometry, material)
    group.add(particles)

    // To achieve an effect similar to the mocks, we need to shoot a line
    // at another node that is most near, except if node that was already drawn to
    _.forEach(groupedData, (value, key) => {
      const geometry = new THREE.Geometry()

      const lineMaterial = new THREE.LineBasicMaterial({
        color: value.color,
        blending:     THREE.AdditiveBlending,
        depthTest:    false,
        transparent:  true,
        opacity: 0.3
      })

      const vertices = clusters[key].lines.map((v) => {
        // Deserialize and normalize
        return (new THREE.Vector3()).fromArray(v).multiplyScalar(denseFactor)
      })


      geometry.vertices = vertices

      const line = new THREE.Line( geometry, lineMaterial )

      value.lineMaterial = lineMaterial

      group.add(line)
    })

    // Add cluster names
    clusters.forEach((cluster) => {
      console.log(cluster.label)

      const center = new THREE.Vector3(cluster.x, cluster.y, cluster.z)
      cluster.center = center

      center.multiplyScalar(denseFactor)
      const text = cluster.label

      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512

      const context = canvas.getContext('2d')

      const textColor = '#bbbbbb'

      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = textColor
      context.font = '60px Roboto'
      context.fillText(text, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.Texture(canvas)
      texture.needsUpdate = true

      const spriteMaterial = new THREE.SpriteMaterial({
        color: 0xdddddd,
        transparent: true,
        opacity: 1.0,
        map: texture
      })

      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.copy(center)
      sprite.scale.multiplyScalar(denseFactor / 2)

      cluster.sprite = sprite

      group.add(sprite)
    })

    scene.add(group)

    const controls = new THREE.TrackballControls(camera, this._container)

    controls.rotateSpeed = 1.0 * 1.0
    controls.zoomSpeed = 1.2 * 0.1
    controls.panSpeed = 0.8 * 0.1

    controls.noZoom = false
    controls.noPan = false

    controls.staticMoving = false
    controls.dynamicDampingFactor = 0.2

    controls.keys = [ 65, 83, 68 ]

    const groupOpacFunction = (cluster) => {
      return function () { // can't be an arrow function!
        _.each(groupedData, (value, key) => {
          if (value !== cluster) {
            const gc = value.color
            updateGroupColor(gc.r * this.f, gc.g * this.f, gc.b * this.f, parseInt(key, 10))
            value.lineMaterial.opacity = 0.3 * this.f
            clusters[key].sprite.material.opacity = 1.0 * this.f
          }
        })
      }
    }

    const trackNode = (node) => {
      const nodeGroup = groupedData[node.g]

      // We only want to reset the panning, so still save the camera position
      // as that needs to lerp to its target instead
      const startPoint = camera.position.clone()

      const endPointUnit = node.vec.clone().normalize()
      const endPoint = node.vec.clone().add(endPointUnit.clone().multiplyScalar(5))

      const startPointNormalized = startPoint.clone().normalize()
      const endPointNormalized = endPoint.clone().normalize()
      const cross = endPointNormalized.clone().cross(startPointNormalized).normalize()

      const angle = startPoint.angleTo(endPoint)

      const startPointDistance = startPoint.length()
      const endPointDistance = endPoint.length()

      const zoomOutDistance = 2000

      let totalAnimTime = angle * 2000
      totalAnimTime = Math.max(totalAnimTime, 2000)

      const otherGroupsFadeInTime = 1000
      const groupFocusTime = 1000

      const waitTime = totalAnimTime - otherGroupsFadeInTime - groupFocusTime

      return Promise.resolve()
      // Make other clusters look dark
      .then(() => {
        currentlyTrackingNode = node

        // Rotate around
        return Promise.all([
          Promise.resolve()
          .then(() => wait(waitTime/3))
          .then(() => {
            return (currentlyZoomedCluster !== null ? tween({
              f: 0.3
            }, {
              f: 1.0
            }, otherGroupsFadeInTime, groupOpacFunction(currentlyZoomedCluster)) : wait(otherGroupsFadeInTime))
          })
          .then(() => wait((waitTime/3)*0.5))
          .then(() => {
            return tween({
              f: 1.0
            }, {
              f: 0.3
            }, groupFocusTime, groupOpacFunction(nodeGroup))
          }),
          tween({
            f: 0
          }, {
            f: 1
          }, totalAnimTime, function () {

            const qF = TWEEN.Easing.Quadratic.InOut(this.f)
            const qD = startPointDistance + (endPointDistance - startPointDistance) * qF

            const interpolatedPosition = startPoint.clone().applyAxisAngle(cross, -angle * qF)

            let bouncingF = this.f
            if (bouncingF > 0.5) {
              bouncingF = TWEEN.Easing.Sinusoidal.InOut((1.0 - bouncingF) * 2)
            }
            else {
              bouncingF = TWEEN.Easing.Quadratic.InOut(this.f * 2)
            }

            const distance = qD + zoomOutDistance * bouncingF * angle * 0.2

            interpolatedPosition.normalize().multiplyScalar(distance)

            camera.position.copy(interpolatedPosition)

            camera.lookAt(new THREE.Vector3())
          }, TWEEN.Easing.Linear.None)
        ])
      })
      .then(() => {
        currentlyZoomedCluster = nodeGroup
        currentlyTrackingNode = null

        return Promise.resolve()
      })
    }

    this.props.emitter.addListener('zoomToImage', (id, openSideBar) => {
      // Preload the image so it'll show instantly once the animation finishes
      preloadImage(getVisionJsonURL(id))

      cameraAnimationQueue = cameraAnimationQueue
        .then(() => trackNode(_.find(points, (p) => p.i === id)))
        .then(() => {
          if (openSideBar) {
            this.props.emitter.emit('showSidebar', id)
          }
        })
    })


    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    this._container.appendChild(renderer.domElement)

    this._container.addEventListener( 'mousemove', () => {
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    }, false)

    const clock = new THREE.Clock()

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



    const createSpriteFromArrayBuffer = (buffer) => {
      // Magic here! (ArrayBuffer to Base64String)
      const b64img = btoa([].reduce.call(new Uint8Array(buffer),(p,c) => {return p+String.fromCharCode(c)},'')) //eslint-disable-line

      const image = new Image()
      image.src = `data:image/jpeg;base64,${b64img}`

      const texture = new THREE.Texture()

      const canvas = document.createElement('canvas')

      image.onload = function() {
        canvas.width = image.width
        canvas.height = image.height

        const context = canvas.getContext('2d')

        // Create a hexagon shape
        context.beginPath()
        context.lineTo(canvas.width / 9 * 2, 0)
        context.lineTo(canvas.width / 9 * 7, 0)
        context.lineTo(canvas.width, canvas.height / 2)
        context.lineTo(canvas.width / 9 * 7, canvas.height)
        context.lineTo(canvas.width / 9 * 2, canvas.height)
        context.lineTo(0, canvas.height / 2)
        context.closePath()
        // Clip to the current path

        context.clip()
        context.drawImage(image, 0, 0)

        texture.image = canvas
        texture.needsUpdate = true
      }

      const spriteMaterial = new THREE.SpriteMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0,
        map: texture
      })

      return new THREE.Sprite(spriteMaterial)
    }

    const prefetchBookmarkIds = [...ZOOM_CLUSTER_BOOKMARK_IDS].map((o) => o.id)

    // Prefetch all thumbs we're likely to zoom into
    const listOfBookmarkVectors = []
    prefetchBookmarkIds.forEach((id) => {
      const node = _.find(points, (p) => p.i === id)
      points.forEach((n) => {
        if (n.vec.distanceToSquared(node.vec) < Math.pow(denseFactor * 0.05, 2)) {
          listOfBookmarkVectors.push(n)
        }
      })
    })

    const checkForImagesThatCanBeDownloaded = _.throttle(() => {
      // Keep track of particles that are within our range, and particles
      // that are outside our range. Add images for the ones that are near
      let listOfNearbyVectors = [...listOfBookmarkVectors]

      if (!currentlyTrackingNode) {
        points.forEach((n) => {
          if (n.vec.distanceToSquared(camera.position) < Math.pow(denseFactor * 0.05, 2)) {
            listOfNearbyVectors.push(n)
          }
        })
      }

      listOfNearbyVectors = _.uniq(listOfNearbyVectors)

      const listOfRemovedNearbyVectors = currentListOfNearbyVectors.filter((nearbyVector) => {
        return !_.includes(listOfNearbyVectors, nearbyVector)
      })

      listOfRemovedNearbyVectors.forEach((nearbyVector) => {
        console.log('remove', nearbyVector)
        nearbyVector._promise = nearbyVector._promise
        .then(() => {
          return tween({
            o: 1.0
          }, {
            o: 0.0
          }, tweenSpeed, function () {
            nearbyVector.plane.material.opacity = this.o
          })
        })
        .then(() => {

          nearbyVector.plane.material.map.dispose()
          nearbyVector.plane.material.dispose()

          group.remove(nearbyVector.plane)

          delete nearbyVector.plane

          return Promise.resolve()
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
          }, tweenSpeed, function () {
            updateNodeColor(this.r, this.g, this.b, nearbyVector.index)
          })
        })
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
          }, tweenSpeed, function () {
            updateNodeColor(this.r, this.g, this.b, nearbyVector.index)
          })
        })
      })

      const listOfNewNearbyVectorsIds = listOfNewNearbyVectors.map((v) => v.i)

      // Only request thumbs if there are any vectors nearby at all
      if (listOfNewNearbyVectorsIds.length) {
        const getAllImagesPromise = sendAndAwait('thumb128', listOfNewNearbyVectorsIds)

        listOfNewNearbyVectors.forEach((nearbyVector) => {
          nearbyVector._promise = nearbyVector._promise.then(() => {
            return getAllImagesPromise
          })
          .then((thumbs) => {

            const thumbObject = thumbs.find((t) => t.id === nearbyVector.i)

            return new Promise((resolve) => {

              nearbyVector.plane = createSpriteFromArrayBuffer(thumbObject.thumb)
              nearbyVector.plane.position.copy(nearbyVector.vec)
              nearbyVector.plane.scale.multiplyScalar(denseFactor / 500)

              group.add(nearbyVector.plane)

              // Adding a small timeout may help with the browser blocking CPU
              setTimeout(() => {
                resolve()
              }, 0)
            })
            .then(() => {
              return tween({
                o: 0
              }, {
                o: 1.0
              }, tweenSpeed, function () {
                nearbyVector.plane.material.opacity = this.o
              })
            })
          })
        })
      }

      currentListOfNearbyVectors = listOfNearbyVectors
    }, thumbCheckSpeed)

    let mousedownObject = null

    this._container.addEventListener( 'mousedown', (e) => {

      raycaster.setFromCamera( mouse, camera )
      const intersects = raycaster.intersectObject(particles)

      if ( intersects.length > 0 ) {
        mousedownObject = intersects[ 0 ].index
      }
      else {
        mousedownObject = null
      }
    }, false)

    this._container.addEventListener( 'mouseup', (e) => {

      raycaster.setFromCamera( mouse, camera )
      const intersects = raycaster.intersectObject(particles)

      if ( intersects.length > 0 ) {
        const index = intersects[ 0 ].index
        if ( mousedownObject === index ) {
          // Make sure the object has an actual image
          if (points[index].plane) {
            lastClickedNodeIndex = index
            this.props.emitter.emit('showSidebar', points[lastClickedNodeIndex].i)
          }
        }
      }
    }, false)

    const tick = (dt) => {

      const time = (new Date()).getTime()
      // TODO fix absolute coords for nodes
      // group.rotation.x = Math.sin(time * 0.0001) * 0.001
      // group.rotation.y = Math.cos(time * 0.0001) * 0.002

      raycaster.setFromCamera( mouse, camera )

      const intersects = raycaster.intersectObject(particles)

      // If our mouse hovers over something
      if ( intersects.length > 0 ) {
        // If the object we're hovering over is different from what we last hovered over
        if ( lastIntersectIndex != intersects[0].index ) {
          const node = points[intersects[0].index]
          if (node.plane) {
            node.plane.material.color.copy(new THREE.Color(0xffffff))
          }

          // If we have hovered over something before
          if (lastIntersectIndex) {
            const oldNode = points[lastIntersectIndex]
            if (oldNode.plane) {
              oldNode.plane.material.color.copy(new THREE.Color(0xcccccc))
            }
          }
          lastIntersectIndex = intersects[ 0 ].index
        }

      }
      // If we're not hovering over something
      else {
        // If we were hovering over an object before
        if ( lastIntersectIndex !== null ) {
          const oldNode = points[lastIntersectIndex]
          if (oldNode.plane) {
            oldNode.plane.material.color.copy(new THREE.Color(0xcccccc))
          }

          lastIntersectIndex = null
        }
      }

      checkForImagesThatCanBeDownloaded()

      if (!currentlyTrackingNode && !currentlyZoomedCluster) {
        clusters.forEach((c) => {
          let opac = c.center.distanceTo(camera.position) / 1000
          opac = Math.max(opac, 0.3)
          opac = Math.min(opac, 1.0)
          c.sprite.material.opacity = opac
        })
      }

      // When zooming out, clear the focused cluster and show back all groups
      if (camera.position.lengthSq() > 1000 * 1000
        && currentlyZoomedCluster
        && !currentlyTrackingNode) {
        const oldZoomedCluster = currentlyZoomedCluster
        currentlyZoomedCluster = null

        cameraAnimationQueue = cameraAnimationQueue.then(() => {
          return tween({
            f: 0.3
          }, {
            f: 1.0
          }, 1000, groupOpacFunction(oldZoomedCluster))
        })
      }

    }

    const animate = () => {

      if (!currentlyTrackingNode) {
        controls.update()
      }

      requestAnimationFrame(animate)

      TWEEN.update()

      const delta = clock.getDelta()

      tick(delta)

      renderer.render(scene, camera)

    }

    animate()

  }
})
