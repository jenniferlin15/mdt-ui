import React from 'react'
import $ from 'jquery'
var ObjTree = require('xml-objtree')

import {exposedStore} from '../store'
import {controlModal} from '../actions/application'
import * as api from '../actions/api'







export function appendElm(elmName, val, appendToElm) {
  var el = null
  if (appendToElm && val && (val.trim().length )) {
    el = appendToElm.ownerDocument.createElement(elmName)
    el.textContent = val.trim()
    appendToElm.appendChild(el)
  }
  return el
}


export function appendAttribute(attrName, val, appendToElm) {
  if (appendToElm && val && val.trim().length ) appendToElm.setAttribute(attrName, val.trim())
}








export function recordTitle (type, title) {
  if(type === 'issue') {
    return `${title.volume ? `Volume ${title.volume}` : ''}${title.volume && title.issue ? ', ' : ''}${title.issue ? `Issue ${title.issue}` : ''}`
  } else {
    return title.title
  }
}




export function doiEntered (doi, ownerPrefix) {
  return doi.length > `${ownerPrefix}/`.length
}

export function urlEntered (url) {
  return url.length > 'http://'.length
}

export function isDOI (doi) {
  var re = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i
  return re.test(doi)
}

export function isURL (url) {
  var re = /^(?:(ftp|http|https)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
  return re.test(url)
}







export async function asyncCheckDupeDoi (doi) {
  try {
    await api.getItem(doi)
    return true
  } catch (e) {
    return false
  }
}






export function compareDois (doi1, doi2) {
  if(typeof doi1 !== 'string' || typeof doi2 !== 'string') {
    return false
  } else {
    return doi1.toLowerCase() === doi2.toLowerCase()
  }
}




export function pascaleCase (name) {
  if (name) {
    var arr, i, l;
    arr = String(name).split(/\s|_/);

    i = 0;
    l = arr.length;

    while (i < l) {
      arr[i] = arr[i].substr(0, 1).toUpperCase() + (arr[i].length > 1 ? arr[i].substr(1).toLowerCase() : '');
      i++;
    }

    return arr.join(' ');
  } else {
    return name;
  }
}






export function lowerCaseFirst (string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}







export function xmldoc (content) {
  const objTree = new ObjTree();
  const json = objTree.parseXML(content)
  return json
}







export class DeferredTask {
  constructor () {
    this.promise = new Promise((resolve, reject) => {

      this._resolve = resolve
      this._reject = reject

      this.reject = (x) => {
        this._reject(x)
        this.rejected = true
      }

      this.resolve = (x) => {
        this._resolve(x)
        this.resolved = true
      }

      this.resolved = false
      this.rejected = false

      this.reset = function () {
        this.promise = new Promise((resolve, reject) => {

          this._resolve = resolve
          this._reject = reject

          this.resolved = false
          this.rejected = false
        })
      }
    })
  }
}







export function cleanObj(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || (typeof obj[propName] === undefined)) {
      delete obj[propName];
    }
  }

  return obj
}







export function objectSearch (object, search, returnVal) {
  var r = undefined
  if ((returnVal) || (returnVal === '')){
    r = returnVal
  }
  Object.keys(object).some(function (k) {
    if (object[k]) {
      if (k === search) {
        r = object[k]
        return true
      }
      if (typeof object[k] === 'object') {
        r = objectSearch(object[k], search)
        return !!r
      }
    }
  });
  return r;
}


export function objectDelete (object, search) {
  return Object.keys(object).some(function (k) {
    if (object[k]) {
      if (k === search) {
        delete object[k]
        return true
      } else if (typeof object[k] === 'object') {
        return objectDelete(object[k], search)
      } else return false
    }
  });
}



export function objectFind (object, finder) {
  let result = undefined
  for (let key in object) {
    if(finder(object[key])) {
      return object[key]
    }
    if(typeof object[key] === 'object') {
      result = objectFind(object[key], finder)
      if(result !== undefined) return result
    }
  }

  return result
}






export class SearchableRecords {
  constructor (records) {
    Object.assign(this, records)

    this.find = (finder) => {
      return objectFind(this, finder)
    }

    this.searchKey = (key) => {
      return objectSearch(this, key)
    }
  }
}







export function ClassWrapper ({classNames, children}) {
  const Reducer = () => classNames.reduceRight((previousValue, currentValue, index, array) => {
    if (index == array.length - 2) {

      const LastChild = Array.isArray(previousValue) ? (lastChildProps) => React.createElement(previousValue[0], {className: previousValue[1]}, lastChildProps.children)
        : (lastChildProps) => <div className={previousValue}>{lastChildProps.children}</div>

      const NextChild = Array.isArray(currentValue) ? (nextChildProps) => React.createElement(currentValue[0], {className: currentValue[1]}, nextChildProps.children)
        : (nextChildProps) => <div className={currentValue}>{nextChildProps.children}</div>

      return <NextChild><LastChild>{children}</LastChild></NextChild>

    } else {

      const ThisChild = Array.isArray(currentValue) ? (thisChildProps) => React.createElement(currentValue[0], {className: currentValue[1]}, thisChildProps.children)
        : (thisChildProps) => <div className={currentValue}>{thisChildProps.children}</div>

      return <ThisChild>{previousValue}</ThisChild>
    }
  });
  return <Reducer />
}





export function removeDuplicates(a) {
  var seen = {}
  var out = []
  var j = 0
  for(let i in a) {
    var item = a[i]
    if(seen[item] !== 1) {
      seen[item] = 1
      out[j++] = item
    }
  }
  return out
}







export const errorHandler = (error, action = ()=>{}) => {
  console.error('Error Handler: ', error)
  action()
  if(!exposedStore.getState().modal.showModal) {
    exposedStore.dispatch(controlModal({
      showModal: true,
      title: error,
      style: 'errorModal',
      Component: ()=>null
    }))
  }

}







export function getErrorPosition () {
  const firstError = $('.fieldError').first()
  const switchLicense = $('.switchLicense').first()
  let errorBubblePosition
  try {
    errorBubblePosition =
      ((firstError.offset().top + (firstError.position().top - (firstError.position().top * .9))
      - (switchLicense.position().top + 15) - (switchLicense.offset().top + 15))) + 25

  } catch (e) {
    errorBubblePosition = false
  }
  return errorBubblePosition
}


export function getTooltipPosition () {
  const infoFlag = $('.infoFlag')
  const isDate = $('.infoFlagDate').length
  const switchLicense = $('.switchLicense').first()

  let bubblePosition
  try {
    bubblePosition =
      ((infoFlag.offset().top + (infoFlag.position().top - (infoFlag.position().top * .9))
      - (switchLicense.position().top + 15) - (switchLicense.offset().top + 15))) + 40
  } catch (e) {
    bubblePosition = false
  }

  if(isDate) bubblePosition -= 35

  return bubblePosition
}




