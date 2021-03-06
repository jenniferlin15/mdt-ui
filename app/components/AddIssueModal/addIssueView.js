import React from 'react'
import is from 'prop-types'
import Switch from 'react-toggle-switch'

import { ArchiveLocations } from '../../utilities/lists/archiveLocations'
import SubItem from '../Common/subItem'
import OptionalIssueInfo from './optionalIssueInfo'
import {urlEntered, doiEntered} from  '../../utilities/helpers'
import TooltipBubble from '../Common/tooltipBubble'
import FormInput from '../Common/formInput'
import FormSelect from '../Common/formSelect'
import FormDate from '../Common/formDate'
import ErrorIndicator from '../Common/errorIndicator'
import {issueTooltips as tooltips} from '../../utilities/lists/tooltipMessages'




AddIssueView.propTypes = {
  save: is.func.isRequired,
  handler: is.func.isRequired,
  closeModal: is.func.isRequired,
  helperSwitch: is.func.isRequired,
  errorUtility: is.object.isRequired,
  boundSetState: is.func.isRequired,
  tooltipUtility: is.object.isRequired,
  calendarHandler: is.object.isRequired
}


export default function AddIssueView (props) {

  const { errors } = props;
  const volumeSectionRequired =  !!(doiEntered(props.issue.volumeDoi, props.ownerPrefix) || urlEntered(props.issue.volumeUrl));
  const issueDoiDataRequired = !!(doiEntered(props.issue.issueDoi, props.ownerPrefix) || urlEntered(props.issue.issueUrl))
  return (
    <div className='addIssueCard'>
      <div>
        <form className='addIssues'>
          <div className='articleInnerForm'>
            <div className='body'>


              <div className='row infohelper'>
                <div className={`saveConfirmation ${props.confirmationPayload.status}`}>{props.confirmationPayload.message}&nbsp;</div>
                <div className='errorHolder'>
                  <div className='switchOuterHolder'>
                    <div className='switchInnerHolder'>
                      <div className='switchLicense'>
                        <div className='switchLabel'><span>Show help</span></div>
                        <Switch
                          onClick={props.helperSwitch}
                          on={props.showHelper}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className='row'>
                <div className='fieldHolder'>
                  <FormInput
                    label="Issue number"
                    name="issue"
                    value={props.issue.issue}
                    changeHandler={props.handler}
                    error={errors.issueVolume || (!!props.issue.issue && errors.dupTitleIdIssue) || errors.issueNumberLimit}
                    indicatorErrors={['issueVolume', props.issue.issue ? 'dupTitleIdIssue' : '', 'issueNumberLimit']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.issueNumber}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={!props.issue.volume}/>

                  <FormInput
                    label="Issue title"
                    name="issueTitle"
                    value={props.issue.issueTitle}
                    changeHandler={props.handler}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.issueTitle}
                    tooltipUtility={props.tooltipUtility}/>
                </div>

                <ErrorIndicator
                  issue
                  indicatorErrors={['issueVolume', props.issue.issue ? 'dupTitleIdIssue' : '', 'issueNumberLimit']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>

                {props.showHelper && <TooltipBubble issue tooltipUtility={props.tooltipUtility} errorUtility={props.errorUtility}/>}

              </div>


              <div className='row'>
                <div className='fieldHolder'>
                  <FormInput
                    label="Issue DOI"
                    name="issueDoi"
                    value={props.issue.issueDoi}
                    changeHandler={props.handler}
                    disabled={props.issueDoiDisabled}
                    error={errors.issuedoi || errors.dupeissuedoi || errors.invalidissuedoi || errors.invalidIssueDoiPrefix}
                    indicatorErrors={['issuedoi', 'dupeissuedoi', 'invalidissuedoi', 'invalidIssueDoiPrefix']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.issueDoi}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={issueDoiDataRequired}/>

                  <FormInput
                    label="Issue URL"
                    name="issueUrl"
                    value={props.issue.issueUrl}
                    changeHandler={props.handler}
                    error={errors.issueUrl || errors.invalidissueurl}
                    indicatorErrors={['issueUrl', 'invalidissueurl']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.issueUrl}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={issueDoiDataRequired}/>
                </div>

                <ErrorIndicator
                  issue
                  indicatorErrors={['issuedoi', 'dupeissuedoi', 'invalidissuedoi', 'invalidIssueDoiPrefix', 'issueUrl', 'invalidissueurl']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>
              </div>


              <div className='row'>
                <div className='fieldHolder'>
                  <FormDate issue
                    label="Print date"
                    name="printDate"
                    required={!props.issue.onlineDateYear || errors.printDateIncomplete}
                    changeHandler={props.handler}
                    onSelect={props.validate}
                    tooltip={props.showHelper && tooltips.printDate}
                    tooltipUtility={props.tooltipUtility}
                    error={errors.printDateInvalid}
                    indicatorErrors={['printDateInvalid', 'printDateYear', 'printDateIncomplete']}
                    errorUtility={props.errorUtility}
                    activeCalendar={props.activeCalendar}
                    calendarHandler={props.calendarHandler}
                    fields={{
                      year: {
                        value: props.issue.printDateYear,
                        error: errors.printDateYear || errors.printDateIncomplete,
                        required: !props.issue.onlineDateYear || errors.printDateIncomplete
                      },
                      month: {
                        value: props.issue.printDateMonth
                      },
                      day: {
                        value: props.issue.printDateDay
                      }
                    }}/>

                  <FormDate issue
                    label="Online date"
                    name="onlineDate"
                    required={!props.issue.printDateYear || errors.onlineDateIncomplete}
                    changeHandler={props.handler}
                    onSelect={props.validate}
                    tooltip={props.showHelper && tooltips.onlineDate}
                    tooltipUtility={props.tooltipUtility}
                    error={errors.onlineDateInvalid}
                    indicatorErrors={['onlineDateInvalid', 'onlineDateYear', 'onlineDateIncomplete']}
                    errorUtility={props.errorUtility}
                    activeCalendar={props.activeCalendar}
                    calendarHandler={props.calendarHandler}
                    fields={{
                      year: {
                        value: props.issue.onlineDateYear,
                        error: errors.onlineDateYear || errors.onlineDateIncomplete,
                        required: !props.issue.onlineDateYear || errors.onlineDateIncomplete
                      },
                      month: {
                        value: props.issue.onlineDateMonth
                      },
                      day: {
                        value: props.issue.onlineDateDay
                      }
                    }}/>
                </div>

                <ErrorIndicator
                  issue
                  style="dateErrorHolder"
                  indicatorErrors={['printDateInvalid', 'printDateYear', 'printDateIncomplete', 'onlineDateInvalid', 'onlineDateYear', 'onlineDateIncomplete']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>
              </div>


              <div className='row'>
                <div className='fieldHolder'>
                  <FormSelect
                    label="Archive location"
                    name="archiveLocation"
                    value={props.issue.archiveLocation}
                    options={ArchiveLocations}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.archiveLocation}
                    tooltipUtility={props.tooltipUtility}
                    changeHandler={props.handler}
                    onSelect={props.validate}/>

                  <FormInput
                    label="Special issue number"
                    name="specialIssueNumber"
                    value={props.issue.specialIssueNumber}
                    error={errors.specialNumberLimit}
                    indicatorErrors={['specialNumberLimit']}
                    onBlur={props.validate}
                    errorUtility={props.errorUtility}
                    changeHandler={props.handler}
                    tooltip={props.showHelper && tooltips.specialNumber}
                    tooltipUtility={props.tooltipUtility}/>
                </div>

                <ErrorIndicator
                  issue
                  indicatorErrors={['specialNumberLimit']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>
              </div>


              <hr />

              <div className='row'>
                <div className='fieldHolder'>
                  <FormInput
                    label="Volume number"
                    name="volume"
                    value={props.issue.volume}
                    changeHandler={props.handler}
                    error={errors.volumeIssue || (!!props.issue.volume && errors.dupTitleIdVolume) || errors.volumeNumberLimit}
                    indicatorErrors={['volumeIssue', props.issue.volume ? 'dupTitleIdVolume' : '', 'volumeNumberLimit']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.volumeNumber}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={!props.issue.issue || volumeSectionRequired}/>
                </div>

                <ErrorIndicator
                  issue
                  indicatorErrors={['volumeIssue', props.issue.volume ? 'dupTitleIdVolume' : '', 'volumeNumberLimit']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>
              </div>


              <div className='row'>
                <div className='fieldHolder'>
                  <FormInput
                    label="Volume DOI"
                    name="volumeDoi"
                    value={props.issue.volumeDoi}
                    changeHandler={props.handler}
                    disabled={props.volumeDoiDisabled}
                    error={errors.volumedoi || errors.dupevolumedoi || errors.invalidvolumedoi || errors.dupeDois || errors.invalidVolumeDoiPrefix}
                    indicatorErrors={['volumedoi', 'dupevolumedoi', 'invalidvolumedoi', 'dupeDois', 'invalidVolumeDoiPrefix']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.volumeDoi}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={volumeSectionRequired}/>

                  <FormInput
                    label="Volume URL"
                    name="volumeUrl"
                    value={props.issue.volumeUrl}
                    changeHandler={props.handler}
                    error={errors.volumeUrl || errors.invalidvolumeurl}
                    indicatorErrors={['volumeUrl', 'invalidvolumeurl']}
                    errorUtility={props.errorUtility}
                    tooltip={props.showHelper && tooltips.volumeUrl}
                    tooltipUtility={props.tooltipUtility}
                    onBlur={props.validate}
                    required={volumeSectionRequired}/>
                </div>

                <ErrorIndicator
                  issue
                  indicatorErrors={['volumedoi', 'dupevolumedoi', 'invalidvolumedoi', 'dupeDois', 'invalidVolumeDoiPrefix', 'volumeUrl', 'invalidvolumeurl']}
                  errorMessages={props.errorMessages}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>
              </div>
            </div>


            <SubItem
              title={'Optional issue information (Contributorship)'}
              arrowType={'dark'}
              addHandler={props.addSubItem}
              boundSetState={props.boundSetState}
              showSection={props.showSection}>
                <ErrorIndicator
                  indicatorErrors={['contributorLastName', 'contributorRole', 'contributorSuffixLimit', 'contributorOrcid']}
                  errorMessages={[]}
                  errorUtility={props.errorUtility}
                  tooltipUtility={props.tooltipUtility}
                  allErrors={props.errors}/>

                {props.optionalIssueInfo.map((data, i)=>
                  <OptionalIssueInfo
                    key={i}
                    openSubItems={props.openSubItems}
                    validate={props.validate}
                    optionalIssueInfo={data}
                    handler={props.boundSetState}
                    remove={props.removeSubItem}
                    data={props.optionalIssueInfo}
                    tooltipUtility={props.tooltipUtility}
                    tooltip={props.showHelper}
                    errorMessages={props.errorMessages}
                    errorUtility={props.errorUtility}
                    index={i}/>
                )}
            </SubItem>
            <div className='saveButtonAddIssueHolder'>
              <div onClick={props.save} className='saveButton addIssue actionTooltip'>
                Save
              </div>
              <button onClick={props.closeModal} type='button' className='cancelButton addIssue'>Close</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}