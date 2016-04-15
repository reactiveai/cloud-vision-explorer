'use strict'

const _       = require('lodash')
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

cluster.isMaster ? _.times(numCPUs, () => { cluster.fork() }) : require('./server')
