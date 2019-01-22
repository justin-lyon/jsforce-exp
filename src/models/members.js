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
  // console.log(type, describe)
  return read(describe)
   .filter(m => !m.manageableState || (m.manageableState && m.manageableState !== managedPackage))
    // .filter(m => !m.manageableState || (m.manageableState && m.manageableState !== 'unmanaged' && m.manageableState !== managedPackage))
}

const read = (describe) => {
  // console.log((describe && !!describe.length))
  // console.log((!describe))

  if (describe && !!describe.length) {
    return [...describe] // clone the array

  } else if (!describe) {
    //console.log('else if :: ' + type, describe)
    return [] // if no describe, return empty array
  }
  // console.log('else :: ' + type, JSON.stringify(describe, null, 2))
  // console.log('arrayed desc obj', JSON.stringify([describe], null, 2))
  return [describe] // array-ify a single object
}

module.exports = {
  read,
  readUnmanaged
}