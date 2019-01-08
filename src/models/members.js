const managedPackage = 'installed'

const readUnmanaged = (type, describe) => {
  // console.log(type, describe)
  return read(type, describe)
    .filter(m => m.manageableState && m.manageableState !== managedPackage)
}

const read = (type, describe) => {
  if (Array.isArray(describe)) {
    return describe
  } else if (!describe) {
    console.log('else if :: ' + type, describe)
    return []
  }
  console.log('else :: ' + type, describe)
  return [describe]
}

module.exports = {
  read,
  readUnmanaged
}