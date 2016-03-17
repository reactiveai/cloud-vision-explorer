
// Calculating nice lines to display on the client is very heavy
// so we need to do this beforehand, save the lines to a file
// and then load the file on the client

const request = require('request')
const THREE = require('three')
const _ = require('lodash')
const fs = require('fs')

const outputJson = require('./output.json')

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

_.forEach(groupedData, (value, key) => {
  const vertices = value.nodes.map((p) => p.vec)

  console.log(vertices.length, 'vertices')

  const findClosestVertex = (list, other) => {
    const clonedArr = _.without(_.clone(list), other)
    clonedArr.sort((a, b) => a.distanceToSquared(other) - b.distanceToSquared(other))
    return clonedArr[0]
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

  const serializedVectors = sortedVertices.map((v) => v.toArray())

  // Round the numbers a bit so they don't take too much space
  _.forEach(serializedVectors, (v) => {
    _.forEach(v, (n, k, a) => {
      a[k] = Math.round(n * 10000) / 10000
    })
  })

  outputJson.clusters[key].lines = serializedVectors
})

fs.writeFile('./public/output.json', JSON.stringify(outputJson), (err) => {
  if (err) {
    return console.log(err)
  }

  console.log('The file was saved!')
})
