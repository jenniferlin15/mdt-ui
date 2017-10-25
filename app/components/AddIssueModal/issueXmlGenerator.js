import {
  doiEntered,
  urlEntered
} from '../../utilities/helpers'
import {
  appendElm,
  appendAttribute
} from '../../utilities/helpers'


export default function (issueObj) {
  var doc = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><crossref xmlns="http://www.crossref.org/xschema/1.1"></crossref>')
  var issueElm = doc.createElement("journal_issue")
  doc.documentElement.appendChild(issueElm)

  const {
    issue,
    optionalIssueInfo,
    ownerPrefix
  } = issueObj
  appendContributorElm(issueElm, optionalIssueInfo)
  var el = doc.createElement("titles")
  if (issue.issueTitle.trim().length) {
    appendElm("title", issue.issueTitle, el)
    doc.rootElement.appendChild(issueElm)
  }

  const onlineYear = issue.onlineDateYear,
    onlineMonth = issue.onlineDateMonth,
    onlineDay = issue.onlineDateDay,
    printYear = issue.printDateYear,
    printMonth = issue.printDateMonth,
    printDay = issue.printDateDay
  if (onlineYear || onlineMonth || onlineDay) {
    el = doc.createElement('publication_date')
    el.setAttribute('media_type', 'online')
    appendElm("month", onlineMonth, el)
    appendElm("day", onlineDay, el)
    appendElm("year", onlineYear, el)
    issueElm.appendChild(el)
  }
  if (printYear || printMonth || printDay) {
    el = doc.createElement('publication_date')
    el.setAttribute('media_type', 'print')
    appendElm("month", printMonth, el)
    appendElm("day", printDay, el)
    appendElm("year", printYear, el)
    issueElm.appendChild(el)
  }

  // volume
  if (issue.volume && issue.volume.length) {
    el = doc.createElement("journal_volume")
    const volumeDoiEntered = doiEntered(issue.volumeDoi, ownerPrefix)
    const volumeUrlEntered = urlEntered(issue.volumeUrl)
    if (volumeUrlEntered || volumeDoiEntered) {
      el = doc.createElement("doi_data")
      if (volumeDoiEntered) appendElm("doi", issue.volumeDoi, el)
      if (volumeUrlEntered) appendElm("resource", issue.volumeUrl, el)
    }
    issueElm.appendChild(el)
  }

  appendElm("issue", issue.issue, issueElm)

  appendElm("special_numbering", issue.specialIssueNumber, issueElm)
  if (issue.archiveLocation.trim().length ){
      el = doc.createElement("archive_locations")
      var el2 = doc.createElement("archive")
      appendAttribute("name", issue.archiveLocation, el2)
      el.appendChild(el2)
      issueElm.appendChild(el)
    }
    appendElm("issue", issue.issue, issueElm)
    //doi_data
    var doiData = ''
    const issueDoiEntered = doiEntered(issue.issueDoi, ownerPrefix)
    const issueUrlEntered = urlEntered(issue.issueUrl)
    if (issueUrlEntered || issueDoiEntered) {
      el = doc.createElement("doi_data")
      if (issueDoiEntered) appendElm("doi", issue.issueDoi, el)
      if (issueUrlEntered) appendElm("resource", issue.issueUrl, el)
      issueElm.appendChild(el)
    }
    return doc
  }

  function appendContributorElm(root, contributors) {
    var contributors = getSubItems(state.contributors)
    if (contributors.length == 0) return
    const contElm = root.ownerDocument.createElement("contributors")

    for (var i in contributors) {
      const contributor = contributors[i]

      const personElm = root.ownerDocument.createElement("person_name")
      personElm.setAttribute("sequence", i == 0 ? "first" : "additional")
      appendAttribute("contributor_role", contributor.role, personElm)
      appendElm("given_name", contributor.firstName, personElm)
      appendElm("surname", contributor.lastName, personElm)
      appendElm("suffix", contributor.suffix, personElm)
      appendElm("affiliation", contributor.affiliation, personElm)
      appendElm("ORCID", contributor.orcid, personElm)
      appendElm("alt-name", contributor.alternativeName, personElm)
      contElm.appendChild(personElm)
    }

    root.appendChild(contElm)
  }