const jsforce = require('jsforce')

const config = require('../config/sf.config')
const creds = require('../config/sf.creds')
const ignoredTypes = require('./ignored.types')

const printer = require('./printer')

const startTime = Date.now()
const managedPackage = 'installed'

console.log('Starting...')

const conn = new jsforce.Connection(config)
conn.login(creds.username, creds.password, (err, userInfo) => {
  if (err) {
    console.error('Error logging in: ', err)
    return
  }

  const mdtapi = require('./describer')(conn, config.version)

  console.log('UserInfo: ', JSON.stringify(userInfo, null, 2))

  mdtapi.describeMetadata()
    .then(orgDescribe => {
      printer.writeMetadataTypes(orgDescribe)
      return mdtapi.describeMembers(orgDescribe)
    })
    .then(results => {

      //console.log('results', JSON.stringify(results, null, 2))
      const filtered = results
        .filter(r => !ignoredTypes.includes(r.type) && r.manageableState !== managedPackage)
        .filter(r => !!r.members)

      const doPackage = printer.buildPackage(filtered, config.version)

      const actions = filtered
        .map(printer.writeMember)

      actions.push(doPackage)

      return Promise.all(actions)
    })
    .then(() => {
      const doneTime = Date.now()
      const runTime = (doneTime - startTime) / 1000
      console.log(`Completed in ${runTime}s.`)
    })
})