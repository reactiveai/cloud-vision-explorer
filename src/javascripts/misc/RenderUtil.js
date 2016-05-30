import _ from 'lodash'
import THREE from 'three'

const updateNodeColor = (geometry, r, g, b, index) => {
  const attributes = geometry.attributes

  const color = new THREE.Color(r, g, b)
  color.toArray(attributes.customColor.array, index * 3)
  attributes.customColor.needsUpdate = true
}

const updateGroupColor = _.throttle((points, geometry, r, g, b, group) => {
  points.forEach((p, i) => {
    if (p.g === group) {
      if (!points[i].plane) {
        updateNodeColor(geometry, r, g, b, i)
      }
    }
  })
}, 100)

module.exports = {
  updateNodeColor,
  updateGroupColor,
  groupOpacFunction: (points, geometry, clusters, cluster) => {
    return function () { // can't be an arrow function!
      _.each(clusters, (value, key) => {
        if (value !== cluster) {
          const gc = value.color
          updateGroupColor(points, geometry, gc.r * this.f, gc.g * this.f, gc.b * this.f, parseInt(key, 10))
          value.lineMaterial.opacity = 0.3 * this.f
          clusters[key].sprite.material.opacity = 1.0 * this.f
        }
      })
    }
  },
  createTextSprite: (text) => {
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

    return sprite
  },

  createHexagonSpriteFromUrl: (url) => new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = url

    const texture = new THREE.Texture()

    const canvas = document.createElement('canvas')

    const spriteMaterial = new THREE.SpriteMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0,
      map: texture
    })

    const sprite = new THREE.Sprite(spriteMaterial)

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

      resolve(sprite)
    }
  })
}
