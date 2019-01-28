const config = require('../config/sf.config')
const ignoredTypes = require('./ignored.types')
const printer = require('./printer')

const getFolderedMDTByType = (conn, apiVersion, folder, typeName) => {
  const type = { type: typeName, folder }
  return new Promise((resolve, reject) => {
    conn.metadata.list([type], apiVersion, (err, data) => {
      if (err) reject(err)

      resolve(data)
    })
  })
}

const getFolderedMDTByFolders = (conn, apiVersion, folders, subType) => {
  const actions = folders.map(f => f.fullName)
    .map(name => getFolderedMDTByType(conn, apiVersion, name, subType))

  return Promise.all(actions)
}

const getFoldersByType = (conn, apiVersion, type) => {
  const folder = { type: type, folder: null }
  return new Promise((resolve, reject) => {
    conn.metadata.list([folder], apiVersion, (err, data) => {
      if (err) reject(err)

      resolve(data)
    })
  })
}

const createPackageXml = (mdtapi, namespaces) => {
  return mdtapi.describeMetadata()
    .then(orgDescribe => {
      printer.writeMetadataTypes(orgDescribe)
      return mdtapi.describeMembers(orgDescribe, namespaces)
    })
    .then(membersDescribe => {

      const filtered = membersDescribe
        .filter(describe => !ignoredTypes.includes(describe.type))

      const doPackage = printer.buildPackage(filtered, config.version)

      const actions = filtered
        .map(printer.writeMember)

      actions.push(doPackage)

      return Promise.all(actions)
    })
}

const digestInstalledPackages = (apiVersion, conn) => {
  return conn.metadata.list([{ type: 'InstalledPackage', folder: null }], apiVersion, conn)
    .then(installedPackages => {
      const namespaces = installedPackages.map(pkg => pkg.namespacePrefix).sort()
      return [...(new Set(namespaces))]
    })
    .catch(err => {
      console.error('Error digesting installed packages: ', { message: err.message, stack: err.stack })
    })
}

module.exports = {
  createPackageXml,
  digestInstalledPackages,
  getFoldersByType,
  getFolderedMDTByFolders
}