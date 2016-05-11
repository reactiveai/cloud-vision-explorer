
import THREE    from 'three'

const FACE_RENDER_WIDTH = 80
const FACE_RENDER_HEIGHT = 80

const camera = new THREE.PerspectiveCamera(70, FACE_RENDER_WIDTH / FACE_RENDER_HEIGHT, 1, 1000)
camera.position.z = 3.2

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(FACE_RENDER_WIDTH, FACE_RENDER_HEIGHT)

const ambient_light = new THREE.AmbientLight(0x333333)
scene.add(ambient_light)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(0, -1, 0)
scene.add(directionalLight)

const point_light = new THREE.PointLight(0xffffff)
point_light.position.x = 2
point_light.position.y = 5
point_light.position.z = 10
scene.add(point_light)

const group = new THREE.Object3D()
scene.add(group)

const headGeometry = new THREE.SphereGeometry(1,32,32)
const headMaterial = new THREE.MeshBasicMaterial({

})

const eyeGeometry = new THREE.SphereGeometry(0.2,16,16)
const eyeMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000
})

const mouthGeometry = new THREE.CylinderGeometry(0.76, 0.9, 0.5, 32)

const head = new THREE.Mesh(headGeometry, headMaterial)
group.add(head)

let eye = new THREE.Mesh(eyeGeometry, eyeMaterial)
eye.position.z = 0.8
eye.position.x = 0.3
group.add(eye)

eye = new THREE.Mesh(eyeGeometry, eyeMaterial)
eye.position.z = 0.8
eye.position.x = -0.3
group.add(eye)

const mouth = new THREE.Mesh(mouthGeometry, eyeMaterial)
mouth.position.z = 0.35
mouth.rotation.x = 1.3
group.add(mouth)


export default (tiltAngle, panAngle, rollAngle, color) => {
  headMaterial.color = new THREE.Color(color)

  group.rotation.x = THREE.Math.degToRad(-tiltAngle)
  group.rotation.y = THREE.Math.degToRad(panAngle)
  group.rotation.z = THREE.Math.degToRad(-rollAngle)

  renderer.render(scene, camera)

  return renderer.domElement.toDataURL()
}
