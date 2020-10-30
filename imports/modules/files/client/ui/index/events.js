import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'

import i18n from 'meteor/universe:i18n'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'

import { copyTextToClipboard } from '../../../../../helpers/client/clipboard/helper'

Template.filesIndexElement.events({
  'click .copy-url': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    copyTextToClipboard(`${Meteor.absoluteUrl()}publicFile/${template.data.uniqueId}`)
  },
  'click .make-private': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    Meteor.call(
      'files.updatePublic',
      template.data._id,
      false,
      error => {
        if (error) return sAlert.error(i18n.__('files.edit.makePublic.error'))
        sAlert.success(i18n.__('files.edit.makePublic.success'))
      })
  },
  'click .make-public': (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    Meteor.call(
      'files.updatePublic',
      template.data._id,
      true,
      error => {
        if (error) return sAlert.error(i18n.__('files.edit.makePublic.error'))
        sAlert.success(i18n.__('files.edit.makePublic.success'))
      })
  },
  'click .download-file': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    HTTP.call('GET', `/file?_id=${template.data._id}`, {
      headers: {
        t: localStorage.getItem('Meteor.loginToken'),
        u: Meteor.userId()
      },
      json: true
    }, (error, result) => {
      if (error) {
        sAlert.error(i18n.__('files.download.error'))
        return
      }
      const response = JSON.parse(result.content)
      window.open(response.url, '_self');
    })
  },
  'click .card': (event, template) => {
    event.stopPropagation()
    Router.go('files.one.edit', {
      teamId: Router.current().params.teamId,
      _id: template.data._id
    })
  },
  'click .card .dropdown-toggle': (event, template) => {
    event.stopPropagation()
    $(event.target).dropdown('toggle')
  },
  'click .card .files-one-delete': (event, template) => {
    event.preventDefault()
    event.stopPropagation()

    swal({
      title: i18n.__('files.delete.title'),
      text: i18n.__('files.delete.text'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      animation: false
    })
      .then(accepted => {
        if (accepted) {
          Meteor.call('files.delete', {
            _id: template.data._id
          }, (error) => {
            if (error) {
              sAlert.error(i18n.__('files.delete.error'))
              return
            }
            sAlert.success(i18n.__('files.delete.success'))
            Router.go('files.index', {
              teamId: Router.current().params.teamId
            })
          })
        }
      })
  }
})