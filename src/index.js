const jsforce = require('jsforce')

const config = require('../config/sf.config')
const creds = require('../config/sf.creds')
const ignoredTypes = require('./ignored.types')

const printer = require('./printer')

const startTime = Date.now()

const createPackageXml = mdtapi => {
  mdtapi.describeMetadata()
    .then(orgDescribe => {
      printer.writeMetadataTypes(orgDescribe)
      return mdtapi.describeMembers(orgDescribe)
    })
    .then(res => {
      console.log(JSON.stringify(res, null, 2))
      return res
    })
    .then(membersDescribe => {

      // console.log('membersDescribe', JSON.stringify(membersDescribe, null, 2))
      const filtered = membersDescribe
        .filter(describe => !ignoredTypes.includes(describe.type))
      //.filter(describe => !!describe.members)

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
    .catch(err => {
      console.error('Error in main: ', err.message)
    })
}

console.log('Starting...')

const conn = new jsforce.Connection(config)
conn.login(creds.username, creds.password, (err, userInfo) => {
  if (err) {
    console.error('Error logging in: ', err)
    return
  }

  const mdtapi = require('./describer')(conn, config.version)

  console.log('UserInfo: ', JSON.stringify(userInfo, null, 2))

  createPackageXml(mdtapi)

})

/**
 * CustomObjectTranslation
 * CustomTab
 * TopicsForObjects
 */