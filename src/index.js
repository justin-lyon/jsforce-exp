const jsforce = require('jsforce')

const config = require('../config/sf.config')
const creds = require('../config/sf.creds')
const ignoredTypes = require('./ignored.types')

const printer = require('./printer')

const startTime = Date.now()

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

const end = () => {
  const doneTime = Date.now()
  const runTime = (doneTime - startTime) / 1000
  console.log(`Completed in ${runTime}s.`)
  return Promise.resolve()
}

console.log('Starting...')

const conn = new jsforce.Connection(config)
conn.login(creds.username, creds.password, (err, userInfo) => {
  if (err) {
    console.error('Error logging in: ', err)
    return
  }

  console.log('UserInfo: ', JSON.stringify(userInfo, null, 2))

  digestInstalledPackages(config.version, conn)
    .then(namespaces => {
        const mdtapi = require('./describer')(conn, config.version, namespaces)
        return createPackageXml(mdtapi)
      })
    .then(end)
    .catch(err => {
      console.error('Error in main: ' + err.message, err.stack)
    })
})

/**
 * CustomObjectTranslation
 * CustomTab
 * TopicsForObjects
 */

/**
 * Layout
 */