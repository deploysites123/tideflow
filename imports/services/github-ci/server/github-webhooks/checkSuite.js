import { Meteor } from 'meteor/meteor'
import { Flows } from '/imports/modules/flows/both/collection'

import { triggerFlows } from '/imports/queue/server'

const requested = (service, body) => {
  const ghBranch = body.check_suite.head_branch

  const flows = Flows.find({
    'trigger.type': 'gh-ci',
    'trigger.event': 'checksuite',
    'trigger.config.branch': { $in: ['*', '', ghBranch] },
    'trigger.config.repository': body.repository.id.toString(),
    status: 'enabled'
  })

  if (!flows || !flows.count()) {
    return
  }

  flows.fetch().map(flow => {
    let user = Meteor.users.findOne({_id: service.user}, {
      fields: { services: false }
    })
  
    // Ignore the execution if for some reason the owner is not found
    if (!user) {
      return null
    }

    triggerFlows(
      service,
      user,
      null,
      {
        data: body
      },
      [flow]
    )
  })
}

const run = (service, body) => {
  if (body.action === 'requested') {
    requested(service, body)
  }
}

module.exports.run = run