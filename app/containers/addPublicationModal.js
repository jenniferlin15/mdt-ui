import React, { Component } from 'react'
import is from 'prop-types'
import verifyIssn from 'issn-verify'
import {appendElm,appendAttribute} from '../utilities/helpers'
import { XMLSerializer, DOMParser } from 'xmldom'
import {isDOI, isURL, asyncCheckDupeDoi} from '../utilities/helpers'
const languages = require('../utilities/lists/language.json')


export default class AddPublicationCard extends Component {

  static propTypes = {
    mode: is.string.isRequired,
    crossmarkPrefixes: is.array.isRequired,

    Journal: is.shape({
      journal_metadata: is.object.isRequired
    }),

    searchResult: is.shape({
      doi: is.string.isRequired,
      issns: is.array.isRequired,
      prefix: is.string.isRequired,
      publicationId: is.node,
      title: is.string
    }),

    reduxCartUpdate: is.func.isRequired,
    reduxControlModal: is.func.isRequired,
    reduxAddDOIs: is.func,
    reduxStorePublications: is.func,

    asyncSubmitPublication: is.func.isRequired
  }

  constructor(props) {
    super()

    const defaultState = {
      mode: props.mode,
      menuOpen: false,
      timeOut: '',
      confirmationPayload: {
        status: '',
        message: ''
      },
      'mdt-version': '0',
      title: '',
      abbreviation: '',
      DOI: '',
      url: '',
      printISSN: '',
      electISSN: '',
      language: '',
      archivelocation: '',
      crossmarkDoi: '',
      errors: {
        showURLError: false,
        showURLEmptyError: false,
        showTitleEmptyError: false,
        showISSNInvalidError: false,
        showISSNEmptyError: false,
        showDOIError: false,
        showDOIEmptyError: false,
        showDOIInvalidError: false,
        showDOIPrefixError: false
      }
    }

    if(props.mode === 'edit') {
      const data = props.Journal.journal_metadata
      const archive = props.Journal.archive_locations ? props.Journal.archive_locations.archive : {}
      let version = props['mdt-version'] ? String(Number(props['mdt-version'])+1) : '0'
      const doi_data = data.doi_data || {}
      this.state = {
        ...defaultState,
        'mdt-version': version.toString(),
        title: data.full_title,
        abbreviation: data.abbrev_title,
        printISSN: (data.issn || {})['#text'],
        electISSN: ((data.issn || {})[1] || data.issn || {})['#text'],
        url: doi_data.resource,
        DOI: doi_data.doi,
        language: data['-language'],
        archivelocation: archive['-name'],
        crossmarkDoi: '',
      }
    }
    else if (props.mode === 'search') {
      const result = props.searchResult
      let pissn, eissn
      if(Array.isArray(result.issns)) {
        result.issns.forEach(issn => {
          if(issn.type === 'pissn') pissn = issn.issn
          if(issn.type === 'eissn') eissn = issn.issn
        })
      }
      this.state = {
        ...defaultState,
        'mdt-version': '1',
        title: result.title,
        abbreviation: '',
        DOI: result.doi || result['owner-prefix'] || result.prefix,
        url: '',
        printISSN: pissn,
        electISSN: eissn,
        language: '',
        archivelocation: '',
        crossmarkDoi: '',
      }
    }
    else if (props.mode === 'add') {
      this.state = defaultState
    }
  }


  getLanguages () {
    var lgOpt = [
      <option key='-1' />,
      ...languages.map((language, i) => (<option key={i} value={language.abbr}>{language.name}</option>))
    ]

    return (
      <select name='language' onChange={this.inputHandler} value={this.state.language}>
        {lgOpt}
      </select>
    )
  }


  validatePrefix () {
    return this.props.prefixes.indexOf(this.state.DOI.split('/')[0]) !== -1
  }

  validateISSN () {
    const issn = this.state.electISSN
    if(verifyIssn(issn)) {
      return true
    } else {
      return false
    }
  }

  validation = async () => {
    let valid = true

    const criticalErrors = {
      showTitleEmptyError: !this.state.title.length,
    }
    const warnings = {}

    criticalErrors.showISSNEmptyError = !this.state.electISSN.length
    criticalErrors.showISSNInvalidError = !criticalErrors.showISSNEmptyError ? !this.validateISSN(): false

    criticalErrors.showURLEmptyError = !this.state.url.length
    criticalErrors.showURLError = !criticalErrors.showURLEmptyError ? !isURL(this.state.url) : false

    criticalErrors.showDOIEmptyError = !this.state.DOI.length
    criticalErrors.showDOIInvalidError = !criticalErrors.showDOIEmptyError ? !isDOI(this.state.DOI) : false
    criticalErrors.showDOIPrefixError = !criticalErrors.showDOIEmptyError && !criticalErrors.showDOIInvalidError && this.props.mode !== 'edit' ? !this.validatePrefix() : false
    criticalErrors.showDOIError =
      !criticalErrors.showDOIEmptyError &&
      !criticalErrors.showDOIInvalidError &&
      !criticalErrors.showDOIPrefixError &&
      this.props.mode !== 'edit' ?
        await asyncCheckDupeDoi(this.state.DOI) : false


    const errorStates = {...criticalErrors, ...warnings}

    for (let key in errorStates) { // checking all the properties of errorStates to see if there is a true
      if (errorStates[key]) {
        valid = false
        break
      }
    }

    return {valid, errorStates, criticalErrors}
  }

  save = () => {

    this.validation().then(({valid, errorStates, criticalErrors}) => {
      if (valid) {
        const publication = {
          'title': {'title': this.state.title},
          'doi': this.state.DOI,
          'date': new Date(),
          'owner-prefix': this.state.DOI.split('/')[0],
          'type': 'Publication',
          'mdt-version': this.state['mdt-version'],
          'status': 'draft',
          'content': this.publicationXml(this.state),
          'contains': []
        }

        this.props.asyncSubmitPublication(publication)
          .then(() => {
            const { confirmationPayload, timeOut } = this.confirmSave(criticalErrors)
            this.setState({
              'mdt-version': String( Number(this.state['mdt-version']) + 1),
              errors: errorStates,
              confirmationPayload,
              timeOut
            })
          })

      } else if (!valid) {
        const { confirmationPayload, timeOut } = this.confirmSave(criticalErrors)
        this.setState({
          'mdt-version': String( Number(this.state['mdt-version']) + 1),
          errors: errorStates,
          confirmationPayload,
          timeOut
        })
      }
    })
  }

  publicationXml = (form = this.state) => {
    const doc = new DOMParser().parseFromString('<Journal xmlns="http://www.crossref.org/xschema/1.1"></Journal>','text/xml')
    const pubElm = doc.createElement("journal_metadata")
    doc.rootElement.appendChild(pubElm)
    appendAttribute("language",form.language,pubElm)

    appendElm("full_title",form.title,pubElm)
    appendElm("abbrev_title",form.abbreviation,pubElm)
    var el = appendElm("issn",electISSN,pubElm)
    appendAttribute("media_type","electronic",el)
    appendElm("archive_locations",form.archivelocation,pubElm)
    el = doc.createElement("doi_data")
    pubElm.appendChild(el)
    appendElm("doi",form.DOI,el)
    appendElm("resource",form.url,el)

    return new XMLSerializer().serializeToString(doc)
  }

  inputHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  closeModal = () => {
    this.props.reduxControlModal({showModal:false})
  }

  componentWillUnmount () {
    clearTimeout(this.state.timeOut)
  }

  confirmSave = (criticalErrors) => {
    clearTimeout(this.state.timeOut)
    const confirmationPayload = {
      status: 'saveSuccess',
      message: 'Save Complete'
    }

    const errorMessageArray = ['Required to save: ']

    const criticalErrorMsg = {
      showURLEmptyError: 'Valid URL.',
      showURLError: 'Valid URL.',
      showTitleEmptyError: 'Title.',
      showISSNEmptyError: 'Valid ISSN.',
      showISSNInvalidError: 'Valid ISSN.',
      showDOIError: 'Valid DOI.',
      showDOIEmptyError: 'Valid DOI.',
      showDOIInvalidError: 'Valid DOI.',
      showDOIPrefixError: 'Valid DOI.'
    }

    for (let error in criticalErrors) {
      if(criticalErrors[error] === true) {
        confirmationPayload.status = 'saveFailed'
        errorMessageArray.push(criticalErrorMsg[error])
      }
    }

    if(confirmationPayload.status === 'saveFailed') {
      confirmationPayload.message = errorMessageArray.join(' ')
    }

    const timeOut = setTimeout(()=>{
      this.setState({confirmationPayload: {status: '', message: ''}})
    }, 7000)

    return {confirmationPayload, timeOut}
  }

  render () {

    const isEdit = this.props.mode !== 'add'
    const disabledInput = isEdit ? {disabled: true, className: 'disabledDoi'} : {}

    const crossmark = this.props.crossmarkPrefixes ? this.props.crossmarkPrefixes.indexOf(this.state.DOI.substring(0,7)) !== -1 : false
    const errors = this.state.errors

    return (
      <div className='addPublicationCard'>
        <div className={`saveConfirmation publicationConfirmation ${this.state.confirmationPayload.status}`}><p>{this.state.confirmationPayload.message}</p></div>
        <form className='addPublications'>
          <div className='fieldRowHolder'>
            <div className={(errors.showTitleEmptyError ? 'fieldinput invalid' : 'fieldinput')}>
              <div className='left-indent-36'>Journal Title (Required)</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='required'><span>*</span></div>
                  <input
                    type='text'
                    name='title'
                    value={this.state.title}
                    onChange={this.inputHandler} />
                </div>
                {errors.showTitleEmptyError && <div className='inputinnerholder'><div className='invalid'>Required. Please provide required information.</div></div>}
              </div>
            </div>
            <div className={(errors.showURLError || errors.showURLEmptyError ? 'fieldinput invalid' : 'fieldinput')}>
              <div className='left-indent-36'>Journal URL (Required)</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='required'><span>*</span></div>
                  <input
                    type='text'
                    name='url'
                    value={!!this.state.url ? this.state.url : 'http://'}
                    onChange={this.inputHandler} />
                </div>
                {errors.showURLEmptyError && <div className='inputinnerholder'><div className='invalid'>Required. Please provide required information.</div></div>}
                {errors.showURLError && <div className='inputinnerholder'><div className='invalid'>Invalid URL. Please check your URL is correct.</div></div>}
              </div>
            </div>
          </div>
          <div className='fieldRowHolder'>
            <div className='fieldinput'>
              <div className='left-indent-36'>Journal Abbreviation</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='notrequired' />
                  <input
                    type='text'
                    name='abbreviation'
                    value={this.state.abbreviation}
                    onChange={this.inputHandler} />
                </div>
              </div>
            </div>
            <div className={(errors.showDOIError || errors.showDOIInvalidError || errors.showDOIEmptyError ? 'fieldinput invalid' : 'fieldinput')}>
              <div className='left-indent-36'>{`Journal DOI${ isEdit ? '' : ' (Required)'}`}</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className={ isEdit ? 'notrequired' : 'required'}>{!isEdit && <span>*</span>}</div>
                  <input
                    {...disabledInput}
                    type='text'
                    name='DOI'
                    value={this.state.DOI}
                    onChange={this.inputHandler} />
                </div>
                {errors.showDOIError && <div className='inputinnerholder'><div className='invalid'>Duplicate DOI. Registering a new DOI? This one already exists.</div></div>}
                {errors.showDOIInvalidError && <div className='inputinnerholder'><div className='invalid'>Invalid DOI. Please check your DOI (10.xxxx/xx...).</div></div>}
                {errors.showDOIPrefixError && <div className='inputinnerholder'><div className='invalid'>Invalid DOI Prefix (10.xxxx). Prefix is not registered to your account.</div></div>}
                {errors.showDOIEmptyError && <div className='inputinnerholder'><div className='invalid'>Required. Please provide required information.</div></div>}
              </div>
            </div>
          </div>
          <div className='fieldRowHolder'>
            <div className='fieldinput'>
              <div className='left-indent-36'>Language</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='notrequired' />
                  {this.getLanguages()}
                </div>
              </div>
            </div>
            <div className={(errors.showDuplicateISSN || errors.showISSNEmptyError ? 'fieldinput invalid' : 'fieldinput')}>
              <div className='left-indent-36'>ISSN (required)</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='required'><span>*</span></div>
                  <input
                    type='text'
                    name='electISSN'
                    value={this.state.electISSN}
                    onChange={this.inputHandler} />
                </div>
                {errors.showDuplicateISSN && <div className='inputinnerholder'><div className='invalid'>Duplicate ISSN. Registering a new ISSN? This one already exists.</div></div>}
                {errors.showISSNInvalidError && <div className='inputinnerholder'><div className='invalid'>Invalid ISSN. Please check your ISSN.</div></div>}
                {errors.showISSNEmptyError && <div className='inputinnerholder'><div className='invalid'>Required. Please provide required information.</div></div>}
              </div>
            </div>
          </div>
          <div className='fieldRowHolder'>
            <div className='fieldinput'>
              <div className='left-indent-36'>Archive Locations</div>
              <div className='inputholder'>
                <div className='inputinnerholder'>
                  <div className='notrequired' />
                  <select name='archivelocation' value={this.state.archivelocation}
                    onChange={this.inputHandler}
                  >
                    <option value='' />
                    <option value='CLOCKSS'>CLOCKSS</option>
                    <option value='LOCKSS'>LOCKSS</option>
                    <option value='Portico'>Portico</option>
                    <option value='Koninklijke Bibliotheek'>Koninklijke Bibliotheek</option>
                    <option value='Deep Web Technologies'>Deep Web Technologies</option>
                    <option value='Internet Archive'>Internet Archive</option>
                  </select>
                </div>
              </div>
            </div>
            {crossmark &&
              <div className='fieldinput'>
                <div className='left-indent-36'>Crossmark Policy Page DOI</div>
                <div className='inputholder'>
                  <div className='inputinnerholder'>
                    <div className='notrequired' />
                    <input
                      type='text'
                      name='crossmarkDoi'
                      value={this.state.crossmarkDoi}
                      onChange={this.inputHandler}/>
                  </div>
                </div>
              </div>}
          </div>
          <div className='fieldRowHolder buttonholder'>
            <div className='fieldinput' />
            <div className='fieldinput'>
              <button
                onClick={this.closeModal}
                className='button-anchor button-white-cancel'
              >Close</button>
              <div onClick={this.save} className='button-anchor actionTooltip'>
                Save
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
