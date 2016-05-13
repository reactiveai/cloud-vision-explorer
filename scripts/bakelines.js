// Calculating nice lines to display on the client is very heavy
// so we need to do this beforehand, save the lines to a file
// and then load the file on the client

const request = require('request')
const THREE = require('three')
const _ = require('lodash')
const fs = require('fs')

const args = process.argv.slice(2)

if (!args[0]) {
  console.error('No input file given')
  process.exit()
}

console.log(args[0])
const outputJson = JSON.parse(fs.readFileSync(args[0], 'utf8'))
console.log(outputJson)

const data = outputJson.points

// Do some post-processing
data.forEach((n) => {
  // Add a real THREE vector for easy access later
  n.vec = new THREE.Vector3(n.x, n.y, n.z)
})

// First sort by the group ID ascending
const sortedData = _.orderBy(data, ['g'], ['asc'])

// Generate an object consisting out of groups of cluster IDs
const groupedData = _.groupBy(sortedData, (element) => element.g)

// Add metadata to each group
_.each(groupedData, (value, key, coll) => {
  coll[key] = {
    nodes: value
  }
})

outputJson.points = []

_.forEach(groupedData, (value, key) => {
  console.log(value.nodes.length, 'vertices')

  const findClosestVertex = (list, other) => {
    const clonedArr = _.without(_.clone(list), other)
    clonedArr.sort((a, b) => a.vec.distanceToSquared(other.vec) - b.vec.distanceToSquared(other.vec))
    return clonedArr[0]
  }

  const allowedVerticesToSearch = _.clone(value.nodes)

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

  doSearch(allowedVerticesToSearch, value.nodes[0])

  const serializedVectors = sortedVertices.map((v) => {
    return {
      x: v.x,
      y: v.y,
      z: v.z,
      g: v.g,
      i: v.i
    }
  })

  outputJson.points = [...outputJson.points, ...serializedVectors]
})

fs.writeFile(args[0], JSON.stringify(outputJson), (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log('The file was saved!')
})
