import React    from 'react'
import THREE    from 'three'
import TWEEN    from 'tween.js'
import _        from 'lodash'
import Shaders  from '../misc/Shaders.js'
import io       from 'socket.io-client'
import Random   from 'random-js'

import { getVisionJsonURL,
         preloadImage }               from '../misc/Util.js'
import { createSpriteFromArrayBuffer,
         createClusterNameSprite,
         groupOpacFunction,
         updateNodeColor  }           from '../misc/RenderUtil.js'
import { ZOOM_CLUSTER_BOOKMARK_IDS }  from '../misc/Constants.js'

// Load some webpack-incompatible modules
require('../misc/TrackballControls.js')(THREE)

// Styles
import 'stylesheets/RenderView'

const seededRandom = new Random(Random.engines.mt19937().seed(0))

const DATAPOINT_URL = `https://storage.googleapis.com/${window.gcsBucketName}/datapoint/output_100k.json`

const tweenSpeed = 200
const thumbCheckSpeed = 100

// denseFactor determines how big our 3D universe is.
// Every coordinate/setting is scaled by this factor
const denseFactor = 1000.0

let currentlyTrackingNode = null
let currentlyZoomedCluster = null

// When we request an animation, attach it to a promise
// so it runs after whatever we're doing now
let cameraAnimationQueue = Promise.resolve()

// Promise version of TWEEN.js
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

// Simple promise version of setTimeout()
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))

export default React.createClass({
  render() {
    return (
      <div ref={(c) => this._container = c} className="render-view"></div>
    )
  },

  propTypes: {
    emitter: React.PropTypes.object.isRequired
  },

  // Perhaps this is added for performance reasons?
  shouldComponentUpdate() {
    return false
  },

  componentDidMount() {
    fetch(DATAPOINT_URL).then((res) => {
      return res.json()
    }).then((data) => {
      this._setupScene(data)
    })
  },

  _setupScene({points, clusters}) {
    this.props.emitter.emit('imageCount', points.length)

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, denseFactor * 10)
    camera.position.z = denseFactor * 1.2

    const scene = new THREE.Scene()

    const raycaster = new THREE.Raycaster()

    // Increase the default mouseover detection radius of points
    raycaster.params.Points.threshold = denseFactor / 1000

    // Used for mousepicking
    const mouse = new THREE.Vector2()

    // Do some post-processing for points
    points.forEach((n, i) => {
      // Add a real THREE vector for easy access later
      n.vec = new THREE.Vector3(n.x, n.y, n.z)

      // Cleanup
      delete n.x
      delete n.y
      delete n.z

      // Normalize it
      n.vec.multiplyScalar(denseFactor)

      // Add a real THREE color
      n.color = new THREE.Color()

      // Add the index too for easy post-processing
      n.index = i

      // Add a resolved promised so we can chain events to it
      n._promise = Promise.resolve()

      // If there are points without an existing cluster
      // create one for them
      if (!clusters[n.g]) {
        clusters[n.g] = {
          x: 0,
          y: 0,
          z: 0,
          label: ''
        }
      }
    })

    // Monkey-patch the dataset for the demo
    points.forEach((p) => {
      // There's an ugly cat in the way of the first node, move it to the back
      if (p.i === '9881051092d70afabf5e3fdab465547a') {
        p.vec.add(new THREE.Vector3(10, 0, 0))
      }
    })

    // Do some post-processing for clusters
    clusters.forEach((cluster) => {
      // Add a real THREE vector for easy access later
      cluster.center = new THREE.Vector3(cluster.x, cluster.y, cluster.z)
      cluster.center.multiplyScalar(denseFactor)

      // Cleanup
      delete cluster.x
      delete cluster.y
      delete cluster.z
    })

    {
      // First sort by the group ID ascending
      const sortedData = _.orderBy(points, ['g'], ['asc'])

      // Generate an object consisting out of groups of cluster IDs
      const groupedData = _.groupBy(sortedData, (element) => element.g)

      // Add metadata to each group
      _.each(groupedData, (value, key) => {
        const intKey = parseInt(key)

        // Access all points for this cluster easily
        clusters[intKey].points = value

        // Assign a random color to this cluster
        clusters[intKey].color = new THREE.Color(0xffffff * seededRandom.real(0.0, 1.0))
      })
    }

    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)
    const sizes = new Float32Array(points.length)

    const PARTICLE_SIZE = denseFactor / 100

    const group = new THREE.Group()

    for (let i = 0, l = points.length; i < l; i++) {

      const vertex = points[ i ].vec
      vertex.toArray(positions, i * 3)

      points[i].color.set(clusters[points[i].g].color)
      points[i].color.toArray(colors, i * 3)

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
      transparent: true,
      depthTest: false
    })

    const particles = new THREE.Points(geometry, material)
    group.add(particles)

    // To achieve an effect similar to the mocks, we need to shoot a line
    // at another node that is most near, except if node that was already drawn to
    _.forEach(clusters, (value, key) => {
      const geometry = new THREE.Geometry()

      const lineMaterial = new THREE.LineBasicMaterial({
        color: value.color,
        blending:     THREE.AdditiveBlending,
        depthTest:    false,
        transparent:  true,
        opacity: 0.3
      })

      const vertices = clusters[key].points.map((p) => p.vec)

      geometry.vertices = vertices

      const line = new THREE.Line( geometry, lineMaterial )

      value.lineMaterial = lineMaterial

      group.add(line)
    })

    // Add cluster names
    clusters.forEach((cluster) => {
      const sprite = createClusterNameSprite(cluster)

      sprite.position.copy(cluster.center)
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

    const trackNode = (node) => {
      const nodeGroup = clusters[node.g]

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
            }, otherGroupsFadeInTime, groupOpacFunction(points, geometry, clusters, currentlyZoomedCluster)) : wait(otherGroupsFadeInTime))
          })
          .then(() => wait((waitTime/3)*0.5))
          .then(() => {
            return tween({
              f: 1.0
            }, {
              f: 0.3
            }, groupFocusTime, groupOpacFunction(points, geometry, clusters, nodeGroup))
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

    const prefetchBookmarkIds = [...ZOOM_CLUSTER_BOOKMARK_IDS].map((o) => o.id)

    let bookmarkVectorIncludeDistanceFactor = 0

    tween({
      o: 0
    }, {
      o: 0.05
    }, 5000, function () {
      bookmarkVectorIncludeDistanceFactor = this.o
    })

    const checkForImagesThatCanBeDownloaded = _.throttle(() => {
      // Prefetch all thumbs we're likely to zoom into
      const listOfBookmarkVectors = []
      prefetchBookmarkIds.forEach((id) => {
        const node = _.find(points, (p) => p.i === id)
        points.forEach((n) => {
          if (n.vec.distanceToSquared(node.vec) < Math.pow(denseFactor * bookmarkVectorIncludeDistanceFactor, 2)) {
            listOfBookmarkVectors.push(n)
          }
        })
      })

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
            updateNodeColor(geometry, this.r, this.g, this.b, nearbyVector.index)
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
            updateNodeColor(geometry, this.r, this.g, this.b, nearbyVector.index)
          })
        })
      })

      const listOfNewNearbyVectorsIds = listOfNewNearbyVectors.map((v) => v.i)

      // Only request thumbs if there are any vectors nearby at all
      if (listOfNewNearbyVectorsIds.length) {
        listOfNewNearbyVectors.forEach((nearbyVector) => {
          nearbyVector._promise = nearbyVector._promise.then(() => {
            return sendAndAwait('thumb128', nearbyVector.i)
          })
          .then((thumb) => {
            return new Promise((resolve) => {
              nearbyVector.plane = createSpriteFromArrayBuffer(thumb)
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

    this._container.addEventListener( 'mousedown', () => {

      raycaster.setFromCamera( mouse, camera )
      const intersects = raycaster.intersectObject(particles)

      if ( intersects.length > 0 ) {
        mousedownObject = intersects[ 0 ].index
      }
      else {
        mousedownObject = null
      }
    }, false)

    this._container.addEventListener( 'mouseup', () => {
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

    const tick = () => {
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
          }, 1000, groupOpacFunction(points, geometry, clusters, oldZoomedCluster))
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
