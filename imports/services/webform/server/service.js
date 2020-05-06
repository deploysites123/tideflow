import i18n from 'meteor/universe:i18n'

import { servicesAvailable } from '/imports/services/_root/server'

const uuidv4 = require('uuid/v4')

const service = {
  name: 'webform',
  humanName: i18n.__('s-webform.name'),
  inputable: true,
  stepable: false,
  ownable: true,
  hooks: {
    service: {
      create: {
        pre: (service) => {
          const config = Object.assign(service.config || {}, {endpoint: uuidv4()})
          return Object.assign(service, { config }) 
        }
      },
      update: {
        pre: (existing, update) => {
          const { endpoint } = existing.config
          const config = Object.assign(update.config || {}, { endpoint })
          return Object.assign(update, { config }) 
        }
      }
    }
  },
  events: [
    {
      name: 'submitted',
      visibe: true,
      capabilities: {
        runInOneGo: true
      },
      callback: (user, currentStep, executionLogs, execution, logId, cb) => {
        const lastData = ([].concat(executionLogs).pop() || {}).stepResult
        
        cb(null, {
          result: lastData,
          next: true,
          msgs: [
            {
              m: 's-webform.log.submitted_input_parsed',
              p: null,
              d: new Date()
            }
          ]
        })
      }
    }
  ]
}

module.exports.service = service

servicesAvailable.push(service)