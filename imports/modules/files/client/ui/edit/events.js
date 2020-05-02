import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Router } from 'meteor/iron:router'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import i18n from 'meteor/universe:i18n'

const slugify = require('slugify')

const fileTypes = require('../../fileTypes')

const guessAceMethod = (fileName) => {
  const ext = fileName.split('.').pop()
  const compatibleMode = fileTypes.aceSupportedMethods.find(sm => sm.extensions.includes(ext))
  return `ace/mode/${compatibleMode ? compatibleMode.method : 'text'}`
}

const aceSupportedByType = (type) => {
  return fileTypes.aceSupportedMethods.find(sm => sm.mimes.includes(type))
}

const setMode = fileName => {
  let newAceMethod = guessAceMethod(fileName)
  ace.edit('editor').session.setMode(newAceMethod)
}

Template['files.one.edit'].onRendered(function() {
  // eslint-disable-next-line no-undef
  var editor = ace.edit('editor', {
    selectionStyle: 'text'
  })

  editor.setOptions({
    tabSize: 2,
    useSoftTabs: true,
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
  })
  // use setOptions method
  editor.setOption('mergeUndoDeltas', 'always')
  editor.resize()

  editor.setTheme('ace/theme/solarized_dark')
  editor.setFontSize('14px')
  editor.session.setMode('ace/mode/javascript')

  editor.getSession().on('change', function() {
    // eslint-disable-next-line no-undef
    let c = ace.edit('editor').getValue()
    $('[name="content"]').val(c)
  })
  
  const { _id, type, userCreated, name } = this.data.file
  
  if (userCreated || aceSupportedByType(type)) {
    HTTP.call('GET', `/file?_id=${_id}&force=true`, {
      headers: {
        t: localStorage.getItem('Meteor.loginToken'),
        u: Meteor.userId()
      }
    }, (error, result) => {
      if (!error) editor.setValue(result.content)
      editor.clearSelection()
      editor.focus()
      setMode(name)
    })
  }
  else {
    alert('File can not be edited')
    Router.go('files.index', {
      teamId: Router.current().params.teamId
    })
  }
})

Template['files.one.edit'].events({
  'blur #filename': (event, template) => {
    event.target.value = slugify(event.target.value).toLowerCase()
    setMode(event.target.value)
  },
  'keyup #filename': (event, template) => {
    const ext = slugify(event.target.value).toLowerCase()
    setMode(event.target.value)
  },
  'click #make-public': (event, template) => {
    Meteor.call(
      'files.updatePublic',
      template.data.file._id,
      !!event.target.checked,
      error => {
        if (error) return sAlert.error(i18n.__('files.edit.makePublic.error'))
        sAlert.success(i18n.__('files.edit.makePublic.success'))
      })
  },
  'click .delete-file': (event, template) => {
    event.stopPropagation()
    event.preventDefault()
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
            _id: template.data.file._id
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
