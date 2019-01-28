const fs = require('fs')
const path = require('path')
const jsforce = require('jsforce')

const config = require('../config/sf.config')
const creds = require('../config/sf.creds')
const app = require('./app')

const startTime = Date.now()

const getStandardValueSets = (conn, apiVersion) => {
  return new Promise((resolve, reject) => {
    const type = { type: 'StandardValueSet', folder: null }
    conn.metadata.list([type], apiVersion, (err, metadata) => {
      if (err) reject(err)

      resolve(metadata)
    })
  })
}

const normalize = describe => {
  return describe.reduce((acc, desc) => {
    if (desc && desc.fullName) {
      return acc.concat([desc.fullName])

    } else if (desc && desc.length) {
      return acc.concat(desc.map(d => d.fullName))
    }

    return acc
  }, [])
}

const writeToJson = (filePath, data) => {
  return new Promise((resolve, reject) => {
    try {
      const writer = fs.createWriteStream(filePath)
      writer.write(JSON.stringify(data, null, 2))
      writer.end()
      resolve()
    } catch(e) {
      reject(e)
    }
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

  getStandardValueSets(conn, config.version)
    .then(data => {
      console.log('data', data)
    })
    // .then(data => {
    //   return writeToJson(path.join(__dirname, '..', 'metadata', 'standardValueSets.json'), data)
    // })
    .catch(err => {
      console.error('Error in main: ' + err.message, err.stack)
    })

  // app.getFoldersByType(conn, config.version, 'DashboardFolder')
  //   .then(folders => {
  //     return app.getFolderedMDTByFolders(conn, config.version, folders, 'Dashboard')
  //   })
  //   .then(normalize)
  //   .then(data => {
  //     return writeToJson(path.join(__dirname, '..', 'metadata', 'dashboards.json'), data)
  //   })
  //   .catch(err => {
  //     console.error('Error in main: ' + err.message, err.stack)
  //   })

  // app.getFoldersByType(conn, config.version, 'EmailFolder')
  //   .then(folders => {
  //     return app.getFolderedMDTByFolders(conn, config.version, folders, 'EmailTemplate')
  //   })
  //   .then(normalize)
  //   .then(data => {
  //     return writeToJson(path.join(__dirname, '..', 'metadata', 'emailTemplates.json'), data)
  //   })
  //   .catch(err => {
  //     console.error('Error in main: ' + err.message, err.stack)
  //   })

  // app.getFoldersByType(conn, config.version, 'ReportFolder')
  //   .then(folders => {
  //     return app.getFolderedMDTByFolders(conn, config.version, folders, 'Report')
  //   })
  //   .then(normalize)
  //   .then(data => {
  //     return writeToJson(path.join(__dirname, '..', 'metadata', 'reports.json'), data)
  //   })
  //   .catch(err => {
  //     console.error('Error in main: ' + err.message, err.stack)
  //   })

  // app.digestInstalledPackages(config.version, conn)
  //   .then(namespaces => {
  //       const mdtapi = require('./describer')(conn, config.version, namespaces)
  //       return app.createPackageXml(mdtapi)
  //     })
  //   .then(end)
  //   .catch(err => {
  //     console.error('Error in main: ' + err.message, err.stack)
  //   })
})

/**
 * CustomObjectTranslation
 * CustomTab
 * TopicsForObjects
 */

/**
 * Layout
 */