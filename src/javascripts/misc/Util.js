
import _ from 'lodash'
import THREE from 'three'

module.exports = {
  generateMockData: (numberOfMockGroups = _.random(50, 500),
    numberOfNodes = 100000,
    groupLocationSpread = 1000.0) => {
    // Mock data
    const data = []
    for (let i = 0; i < numberOfMockGroups; i++) {

      const groupLocation = new THREE.Vector3(
        _.random(-groupLocationSpread, groupLocationSpread),
        _.random(-groupLocationSpread, groupLocationSpread),
        _.random(-groupLocationSpread, groupLocationSpread))

      const groupSize = _.random(10.0, 500.0)

      for (let j = 0; j < numberOfNodes/numberOfMockGroups; j++) {
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
}
