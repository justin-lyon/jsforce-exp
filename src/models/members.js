/**
 * Salesforce metadata api `.list` returns 1 of 3 structures
 * 1. an obj if only one result
 * 2. an array if many
 * 3. `undefined` if nothing
 *
 * Some list members have manageableState prop, some do not.
 */

const managedPackage = 'installed'

const readUnmanaged = (describe) => {
  return read(describe)
   .filter(m => !m.manageableState || (m.manageableState && m.manageableState !== managedPackage))
}

const read = (describe) => {
  if (describe && !!describe.length) {
    return [...describe] // clone the array

  } else if (!describe) {
    return [] // if no describe, return empty array
  }
  return [describe] // array-ify a single object
}

module.exports = {
  read,
  readUnmanaged
}