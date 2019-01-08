const readMembers = (mdt) => {
  if (Array.isArray(mdt.members)) {
    return mdt.members
  }
  return [mdt.members]
}

module.exports = {
  readMembers
}