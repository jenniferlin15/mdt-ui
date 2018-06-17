import withQuery from 'with-query'

import authorizedFetch, {regularFetch} from '../utilities/fetch'
const apiBaseUrl = require('../../deployConfig').apiBaseUrl




export function getCRState () {
  return authorizedFetch(`${apiBaseUrl}/state`, {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then((response)=> {
      return response.text()
    })
}


export function syncState (postingState) {
  authorizedFetch(`${apiBaseUrl}/state`, {
    method: 'post',
    headers: {Authorization: localStorage.getItem('auth')},
    body: JSON.stringify(postingState)
  })
}



export function login (usr, pwd) {
  return authorizedFetch(`${apiBaseUrl}/login`, {
    method: 'post',
    body: JSON.stringify({usr, pwd})
  })
}


export function searchTitle (query) {
  return authorizedFetch(`${apiBaseUrl}/search?q=${query}`, {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then((response)=> response.json() )
}



export function searchRecords (query, pubTitle, type) {
  return authorizedFetch(`${apiBaseUrl}/search/works?q=${query}&title=${pubTitle}&type=${type.toLowerCase()}`, {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then((response)=> response.json() )
}



export function getItem (id, forced) {
  let doi, pubDoi, title
  if(typeof id === 'object') {
    doi = id.doi
    title = id.title
    pubDoi = id.pubDoi
  } else if(typeof id === 'string') {
    doi = id
  }

  const queryParams = doi ? `doi=${doi}` : `pubdoi=${pubDoi}&title=${typeof title === 'object' ? JSON.stringify(title) : title}`

  return authorizedFetch(`${apiBaseUrl}/work?${queryParams}${forced ? `&forced=true` : ''}`, {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then(response => {
      if(response.status !== 200) {
        const error = new Error(`${response.status}: ${response.statusText}`)
        error.status = response.status
        throw error
      }
      return response.json()
    })
}



export function getDraftWorks () {
  return authorizedFetch(`${apiBaseUrl}/work?publication=true`, {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then(response => {
      return response.json()
    })
}



export function submitItem (publication) {
  return authorizedFetch(`${apiBaseUrl}/work`, {
    method:'post',
    headers: {Authorization: localStorage.getItem('auth')},
    body: JSON.stringify(publication)
  })
    .then((response) => {
      if(response.status !== 202) {
        throw `${response.status}: ${response.statusText}`
      }
    })
}




export function deleteItem (id) {
  let doi, pubDoi, title
  if(typeof id === 'object') {
    doi = id.doi
    title = id.title
    pubDoi = id.pubDoi
  } else if(typeof id === 'string') {
    doi = id
  }

  const queryParams = doi ? `doi=${doi}` : `pubdoi=${pubDoi}&title=${typeof title === 'object' ? JSON.stringify(title) : title}`

  return authorizedFetch(`${apiBaseUrl}/work?${queryParams}`, {
    method: 'delete',
    headers: {Authorization: localStorage.getItem('auth')}
  })
}



export function deposit (cartArray) {
  return authorizedFetch(`${apiBaseUrl}/deposit`, {
    method:'post',
    headers: {Authorization: localStorage.getItem('auth')},
    body: JSON.stringify({
      message: cartArray
    })
  })
    .then(result => {
      if(result.status > 202) throw `Server Error ${result.status}: ${result.statusText}`
      return result.json()
    })
}




export function getDepositHistory (params) {
  return authorizedFetch(withQuery(`${apiBaseUrl}/history`, params), {
    method: 'get',
    headers: {Authorization: localStorage.getItem('auth')}
  })
    .then(depositHistory => depositHistory.json())
}




export function getReference (referencesArray) {
  return Promise.all(referencesArray.map( referenceText =>
    new Promise ((resolve, reject) =>
      authorizedFetch(`${apiBaseUrl}/search/references?q=${encodeURIComponent(referenceText)}`, {
        method: 'get',
        headers: {Authorization: localStorage.getItem('auth')}
      })
        .then( result => result.json()).then( result => resolve(result))
        .catch( e => resolve({ message: [{reference: referenceText}]}))
    )
  ))
}



export function getFormattedReference (doi) {
    return authorizedFetch(`${apiBaseUrl}/search/references?q=${encodeURIComponent(doi)}`, {
      method: 'get',
      headers: {Authorization: localStorage.getItem('auth')}
    })
      .then( result => result.json())
}



export function getPublishers () {
  //This is how the request would look
  /*return authorizedFetch(`${apiBaseUrl}/.....`)
      .then(result => result.json())*/

  //This is dummy data in the meantime
  return Promise.resolve({
    message: [
      {publisher: 'publisher 1', prefixes: ['10.1221', '10.2345', '10.1512']},
      {publisher: 'publisher 2', prefixes: ['10.1361', '10.2456', '10.3473']},
      {publisher: 'publisher 3', prefixes: ['10.2362', '10.5656', '10.3512']},
      {publisher: 'publisher 4', prefixes: ['10.4564', '10.5453', '10.3236']},
      {publisher: 'publisher 5', prefixes: ['10.2346', '10.3467', '10.1266']},
      {publisher: 'publisher 6', prefixes: ['10.2345', '10.4678', '10.2355']},
      {publisher: 'publisher 7', prefixes: ['10.1236', '10.2252', '10.1512']},
    ]
  })
}
