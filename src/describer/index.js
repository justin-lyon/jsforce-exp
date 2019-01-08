const memberModel = require('../models/members')

module.exports = (conn, apiVersion) => {
  const describeMetadata = () => {
    return new Promise((resolve, reject) => {
      conn.metadata.describe(apiVersion, (err, result) => {
        if (err) reject(err)

        resolve(result)
      })
    })
  }

  const describeOneMember = type => {
    return new Promise((resolve, reject) => {
      conn.metadata.list([type], apiVersion, (err, membersDescribe) => {
        if (err) reject(err)

        try {
          const members = memberModel.readUnmanaged(type.type, membersDescribe)
          resolve({
            type: type.type,
            members
          })

        } catch(e) {
          console.error(`Error for type: ${type.type}`, e)
          console.error(type.type, membersDescribe)
          reject(e)
        }
      })
    })
  }

  const describeMembers = orgDescribe => {
    return Promise.all(orgDescribe.metadataObjects
      .filter(mdt => !mdt.inFolder)
      .map(mdt => ({
        type: mdt.xmlName,
        folder: null
      }))
      .map(type => {
        return describeOneMember(type)
      }))
  }

  return {
    describeMetadata,
    describeMembers
  }
}