
import _ from 'lodash'
import THREE from 'three'

import { gcsBucketName } from '../config.js' 

module.exports = {
  getVisionJsonURL: (id) => {
    return `https://storage.googleapis.com/${gcsBucketName}/vision/result/${id}.json`
  },
  preloadImage: (url) => {
    const img = new Image()
    img.src = url
  },
  generateMockData: (numberOfMockGroups = _.random(50, 500),
    numberOfNodes = 100000,
    groupLocationSpread = 1000.0) => {
    // Mock data
    const points = []
    const clusters = []
    for (let i = 0; i < numberOfMockGroups; i++) {

      clusters.push({
        x: 0,
        y: 0,
        z: 0,
        label: ''
      })

      const groupLocation = new THREE.Vector3(
        _.random(-groupLocationSpread, groupLocationSpread),
        _.random(-groupLocationSpread, groupLocationSpread),
        _.random(-groupLocationSpread, groupLocationSpread))

      const groupSize = _.random(10.0, 500.0)

      for (let j = 0; j < numberOfNodes/numberOfMockGroups; j++) {
        points.push({
          id: i,
          x: groupLocation.x + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
          y: groupLocation.y + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
          z: groupLocation.z + Math.pow(_.random(-groupSize, groupSize), _.random(1, 1)),
          g: i
        })
      }
    }

    return {
      points: points,
      clusters: clusters
    }
  }
}
