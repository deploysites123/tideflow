import { Services } from '/imports/modules/services/both/collection'

/**
 * 
 * @param {*} _id 
 * @param {*} property 
 */
module.exports.property = (_id, property) => {
  return (Services.findOne({_id}) || {})[property] || null
}