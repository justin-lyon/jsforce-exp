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
          const members = memberModel.readUnmanaged(membersDescribe)
          if (members.length === 0 && membersDescribe && !membersDescribe.length) {
            // console.log('MEMBER :: ' + type.type, JSON.stringify(members, null, 2))
            // console.log('TYPEOF ' + typeof membersDescribe, Array.isArray(membersDescribe))
            // console.log('DESCRIBE :: ' + type.type, JSON.stringify(membersDescribe, null, 2))

          }
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

  const readMember = (typeName, fullnames, conn) => {
    return new Promise((resolve, reject) => {
      console.log('Retrieving...')
      conn.metadata.read(typeName, fullnames, (err, data) => {
        if (err) reject(err)

        console.log('Success...')
        resolve(data)
      })
    })
  }

  const chunk = (arr, n) => {
    return arr.reduce((p, cur, i) => {
      (p[i / n | 0] = p[i / n | 0] || []).push(cur)
      return p
    }, [])
  }

  const readMembers = (typeName, fullNames, conn) => {
    const chunks = chunk(fullNames, 10)

    const actions = chunks.map(names => {
      return readMember(typeName, names, conn)
    })

    return Promise.all(actions)
  }

  return {
    describeMetadata,
    describeMembers,
    readMembers
  }
}