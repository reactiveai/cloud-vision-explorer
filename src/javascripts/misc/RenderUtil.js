
import _ from 'lodash'
import THREE from 'three'

module.exports = {
  createClusterNameSprite: (cluster) => {
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

    return sprite
  },
  createSpriteFromArrayBuffer: (buffer) => {
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
}
