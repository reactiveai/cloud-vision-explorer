

module.exports = {
  OPEN_IMAGE_BOOKMARK_IDS: `
124f2fde76907e123e1655ef4b647fde
61140fbd59e1391a0e77a7f7a289d2be
ca3f3dc5ad5a37ededb061e57535ee4c
5c56534d1b6f926f574ad11eff5d5e29
22ad73a861ffa9409598ca361c0cfed0
`.split('\n').filter((i) => i).map((o) => {return {id: o}}),


  // These are actually also image IDs, because it's easy to reference them
  // even though we're just using them to zoom to a particular part of a cluster
  ZOOM_CLUSTER_BOOKMARK_IDS: [
  ]
}
