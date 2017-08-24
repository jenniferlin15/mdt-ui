import React, { Component } from 'react'
import _ from 'lodash'

const Languages = require('../utilities/language.json')
import { ArchiveLocations } from '../utilities/archiveLocations'
const PublicationTypes = require('../utilities/publicationTypes.json')
const AppliesTo = require('../utilities/appliesTo.json')
const IdentifierTypes = require('../utilities/identifierTypes.json')
import objectSearch from '../utilities/objectSearch'
import parseXMLArticle from '../utilities/parseXMLArticle'
import { getSubmitSubItems } from '../utilities/getSubItems'
import xmldoc from '../utilities/xmldoc'

const articleReviewGenerator = (publication, article, parentIssue, parsedAlready, func) => {
    var publicationMetaData = publication
    if (publication.content) {
        publicationMetaData = xmldoc(publication.content)
    }

    var reviewData = article
    if (!parsedAlready) {
        reviewData = parseXMLArticle(article)
    }

    const getFunding = () => {
        var funders = getSubmitSubItems(reviewData.funding).map((funder, i) => {
            var funderName = undefined
            if (funder.fundername) {
                funderName = funder.fundername.trim().length > 0 ? funder.fundername : undefined
            }

            var funder_identifier = undefined
            if (funder.funder_identifier) {
                funder_identifier = funder.funder_identifier.trim().length > 0 ? funder.funder_identifier : undefined
            }

            var attributes = ``
            if (funderName || funder_identifier) { //if an of these exist
                attributes = `${funderName}${funder_identifier ? `: ${funder_identifier}` : ``}`
                var grants = funder.grantNumbers.map((awardNumber, i) => {
                return awardNumber
                });

                var fundgroup = <p key={i}>{attributes}<br />{(grants.length > 0) ? 'Grant Numbers: ' + grants.join(', '): ''}</p>

                return fundgroup
            }
        })

        return funders.join('').length > 0 ? funders : ''
    }

    const getLicense = () => {
        const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
        var licenses = getSubmitSubItems(reviewData.license).map((license, i) => {

            const appliesto = _.find(AppliesTo, (applyto) => {
                if (applyto.value.trim().toLowerCase() === license.appliesto.trim().toLowerCase()){
                return applyto
                }
            })
            var attributes = <span key={i}>{license.appliesto ? appliesto.name : ''}: {license.licenseurl} ({license.acceptedDateDay}, {months[parseInt(license.acceptedDateMonth)-1]} {license.acceptedDateYear}) {
                    reviewData.addInfo.freetolicense ? ', Free to Read: Yes' : ', Free to Read: No'
                }<br /></span>
            return attributes
        })
        return licenses.length > 0 ? licenses : ``
    }

    const getRelatedItems = () => {
        var relatedItems = getSubmitSubItems(reviewData.relatedItems).map((relatedItem, i) => {
            var identifiertype = _.find(IdentifierTypes, (identtype) => {
                if (identtype.name.trim().toLowerCase() === relatedItem.identifierType.trim().toLowerCase()){
                return identtype
                }
            })

            var attributes = <span key={i}>{relatedItem.relationType}: {identifiertype ? identifiertype.value: ''} {relatedItem.relatedItemIdentifier} {(relatedItem.description.length > 0) ? relatedItem.description : ''}<br /></span>

            if (relatedItem.description.length > 0 && relatedItem.relationType.length > 0 && relatedItem.relationType.length > 0 && relatedItem.relationType.length > 0 ) {
                return attributes
            }
        })
        return relatedItems.length > 0 ? relatedItems : ``
    }

    const getAddInfo = () => {
        var retInfo = []
        if (reviewData.addInfo.similarityCheckURL.length > 0) {
            retInfo.push(<span>Similarity Check URL: {reviewData.addInfo.similarityCheckURL}<br /></span>)
        }
        if (reviewData.addInfo.archiveLocation.length > 0) {
            const arLoc= _.find(ArchiveLocations, (archiveLocation) => {
            if(archiveLocation.value.trim().toLowerCase() === reviewData.addInfo.archiveLocation.trim().toLowerCase()){
                return archiveLocation
            }
            })
            retInfo.push(<span>Archive Location: {arLoc.name}<br /></span>)
        }
        if (reviewData.addInfo.language.length > 0) {
            const lang= _.find(Languages, (language) => {
            if (language.abbr.trim().toLowerCase() === reviewData.addInfo.language.trim().toLowerCase()){
                return language
            }
            })
            retInfo.push(<span>Language: {lang.name}<br /></span>)
        }

        if (reviewData.addInfo.publicationType.length > 0) {
            const pt= _.find(PublicationTypes, (pubType) => {
            if (pubType.value.trim().toLowerCase() === reviewData.addInfo.publicationType.trim().toLowerCase()) {
                return pubType
            }
            })
            retInfo.push(<span>Publication Type: {pt.name}</span>)
        }
        return retInfo.length > 0 ? retInfo : ``
    }

    const getPages = () => {
        var retStr = ''
        if ((reviewData.article.firstPage.trim().length > 0) || (reviewData.article.lastPage.trim().length > 0)) {
        retStr = retStr + ', '
        if (reviewData.article.firstPage.trim().length > 0){
            retStr = retStr + reviewData.article.firstPage
        }
        if ((reviewData.article.firstPage.trim().length > 0) && (reviewData.article.lastPage.trim().length > 0)) {
            retStr = retStr + '-'
        }
        if (reviewData.article.lastPage.trim().length > 0){
            retStr = retStr + reviewData.article.lastPage
        }
        retStr = retStr + '. '
        }
        return retStr

    }


        const publicationAbbrevTitle = objectSearch(publicationMetaData, 'abrev_title')
        var pubAbbrTitle = ''
        if (publicationAbbrevTitle) {
        if (publicationAbbrevTitle.trim().length > 0) {
            pubAbbrTitle = ' '+publicationAbbrevTitle.trim()
        }
        }

        var contributors = getSubmitSubItems(reviewData.contributors).map((contributor) => {
        const contributorName = contributor.firstName + ' ' + contributor.lastName
        const contributorGroupName = contributor.groupAuthorName
        if (contributorName.trim().length > 0 || contributorGroupName.trim().length) {
            if (contributorName.trim().length > 0) {
            return contributorName
            } else if (contributorGroupName.trim().length > 0) {
            return contributorGroupName
            }
        }
        }).join(', ')

        contributors = contributors.length > 0 ? contributors + ', et al.' : ''

        const onlineDate = reviewData.article.onlineDateYear.length > 0 ? ' (' + reviewData.article.onlineDateYear + '), ' : ''
        const title = reviewData.article.title.length > 0 ? reviewData.article.title + '.' : ''

        const doi = reviewData.article.doi.length > 0 ? ' DOI: ' + reviewData.article.doi + '. ' : ''
        const url = reviewData.article.url ? ' ' + reviewData.article.url + ' ' : ''
        const locationId = reviewData.article.locationId.length > 0 ? ' ' + reviewData.article.locationId  : ''

        var vol = ''
        var issue = ''
        if ((parentIssue) && (parentIssue.content)) {
            // if there is a content property, we will rely on content,
            // it has more complete data, the API returns either a title,
            // or volume or issue, data is not reliable
            const IssueMetaData = xmldoc(parentIssue.content)
            parentIssue = {
                volume: objectSearch(IssueMetaData,'volume'),
                issue: objectSearch(IssueMetaData,'issue')
            }
        }

        if (parentIssue) {
            if ((parentIssue.title) && ((!parentIssue.volume) && (!parentIssue.issue))) {
                vol = parentIssue.title.volume ? ' ' + parentIssue.title.volume : ''
                issue = parentIssue.title.issue ? '(' + parentIssue.title.issue + ')' : ''
            } else {
                vol = parentIssue.volume ? ' ' + parentIssue.volume : ''
                issue = parentIssue.issue ? '(' + parentIssue.issue + ')' : ''
            }
        }

        const generalHeading = contributors + onlineDate + title + pubAbbrTitle + vol + issue + locationId + getPages() + doi + url

        const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]


        return (
            <div className='ReviewArticleCard'>
                <div>
                {
                    (func) ?
                    <div>
                        <button className='addToCart' onClick={func} >Add To Cart</button>
                    </div>
                    : ''
                }
                <div className='reviewArticle'>
                    <div className='firstBorder'>
                    <div className='innerBorder'></div>
                    </div>
                    <div className='secondBorder'>
                    <div className='innerBorder'></div>
                    </div>
                    <div className='reviewContent'>
                    <h4>General</h4>
                    <p>{generalHeading}</p>
                    {
                        (reviewData.article.onlineDateYear.length > 0 || reviewData.article.onlineDateMonth.length > 0  || reviewData.article.onlineDateDay.length > 0) ||
                        (reviewData.article.printDateYear.length > 0 || reviewData.article.printDateMonth.length > 0  || reviewData.article.printDateDay.length > 0) ||
                        (reviewData.article.acceptedDateYear.length > 0 || reviewData.article.acceptedDateMonth.length > 0  || reviewData.article.acceptedDateDay.length > 0) ?
                        <p>
                        {
                            (reviewData.article.printDateYear.length > 0 || reviewData.article.printDateMonth.length > 0  || reviewData.article.printDateDay.length > 0) ?
                            `Print: ${
                                (reviewData.article.printDateDay.length > 0) ? reviewData.article.printDateDay : ''
                            }${
                                ((reviewData.article.printDateMonth.length > 0) && (reviewData.article.printDateYear.length > 0)) ? ', ' : ''
                            }${
                                (reviewData.article.printDateMonth.length > 0) ? ' ' + months[parseInt(reviewData.article.printDateMonth) - 1] : ''
                            }${
                                (reviewData.article.printDateYear.length > 0) ? ' ' + reviewData.article.printDateYear : ''
                            }` : ``
                        }
                        {(reviewData.article.onlineDateYear.length > 0 || reviewData.article.onlineDateMonth.length > 0  || reviewData.article.onlineDateDay.length > 0) && <br />}
                        {
                            (reviewData.article.onlineDateYear.length > 0 || reviewData.article.onlineDateMonth.length > 0  || reviewData.article.onlineDateDay.length > 0) ?
                            `Online: ${
                                (reviewData.article.onlineDateDay.length > 0) ? reviewData.article.onlineDateDay : ''
                            }${
                                ((reviewData.article.onlineDateMonth.length > 0) && (reviewData.article.onlineDateYear.length > 0)) ? ', ' : ''
                            }${
                                (reviewData.article.onlineDateMonth.length > 0) ? ' ' + months[parseInt(reviewData.article.onlineDateMonth) - 1] : ''
                            }${
                                (reviewData.article.onlineDateYear.length > 0) ? ' ' + reviewData.article.onlineDateYear : ''
                            }` : ``
                        }
                        {(reviewData.article.acceptedDateYear.length > 0 || reviewData.article.acceptedDateMonth.length > 0  || reviewData.article.acceptedDateDay.length > 0) && <br />}
                        {
                            (reviewData.article.acceptedDateYear.length > 0 || reviewData.article.acceptedDateMonth.length > 0  || reviewData.article.acceptedDateDay.length > 0) ?
                            `Accepted: ${
                                (reviewData.article.acceptedDateDay.length > 0) ? reviewData.article.acceptedDateDay : ''
                            }${
                                ((reviewData.article.acceptedDateMonth.length > 0) && (reviewData.article.acceptedDateYear.length > 0)) ? ', ' : ''
                            }${
                                (reviewData.article.acceptedDateMonth.length > 0) ? ' ' + months[parseInt(reviewData.article.acceptedDateMonth) - 1] : ''
                            }${
                                (reviewData.article.acceptedDateYear.length > 0) ? ' ' + reviewData.article.acceptedDateYear : ''
                            }` : ``
                        }
                        </p>
                        :
                        ''
                    }
                    {
                        (reviewData.article.abstract.length > 0) ? <p>Abstract<br />{reviewData.article.abstract}</p> : ''
                    }
                    {(getFunding().length > 0) ?
                    <p>
                        <h4>Funding</h4>
                        {getFunding()}
                    </p>
                    : ''
                    }
                    {(getLicense().length > 0) ?
                    <p>
                        <h4>License</h4>
                        {getLicense()}
                    </p>
                    : ''
                    }
                    {(getRelatedItems().length > 0) ?
                    <p>
                        <h4>Related Items</h4>
                        {getRelatedItems()}
                    </p>
                    : ''
                    }
                    {(getAddInfo().length > 0) ?
                    <p>
                        <h4>Additional Information</h4>
                        {getAddInfo()}
                    </p>
                    : ''
                    }

                    </div>
                </div>
                </div>
            </div>
        )
}
export default articleReviewGenerator