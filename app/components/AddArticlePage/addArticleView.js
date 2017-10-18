import React, { Component } from 'react'
import is from 'prop-types'
import Switch from 'react-toggle-switch'

import SubItem from '../Common/subItem'
import ActionBar from './actionBar'
import { TopBar, InfoBubble, InfoHelperRow, ErrorBubble, ArticleTitleField, OptionalTitleData, ArticleDOIField, ArticleUrlField, DatesRow, BottomFields } from './articleFormComponents'
import { makeDateDropDown } from '../../utilities/date'
import Contributor from './SubItems/contributor'
import Funding from './SubItems/funding'
import License from './SubItems/license'
import RelatedItems from './SubItems/relatedItems'
import AdditionalInformation from './SubItems/additionalInfo'
import { CrossmarkCards, CrossmarkAddButton } from './SubItems/Crossmark/crossmark'






export default class AddArticleCard extends Component {

  static propTypes = {
    back: is.func.isRequired,
    addToCart: is.func.isRequired,
    save: is.func.isRequired,
    openReviewArticleModal: is.func.isRequired,
    handleChange: is.func.isRequired,
    toggleFields: is.func.isRequired,
    boundSetState: is.func.isRequired,
    removeSection: is.func.isRequired,
    addSection: is.func.isRequired
  }

  render () {
    return (
      <div>

        <div className='addarticlecard'>

          <form className='addArticleForm'>

            <ActionBar
              back={this.props.back}
              addToCart={this.props.addToCart}
              save={this.props.save}
              openReviewArticleModal={this.props.openReviewArticleModal}
              saving={this.props.saving}
              inCart={this.props.inCart}
              criticalErrors={this.props.criticalErrors}/>

            <div className='articleInnerForm'>

              <TopBar title={this.props.article.title} />

              <div className='body'>

                <InfoHelperRow setState={this.props.boundSetState} on={this.props.on}/>

                <div className='row'>
                  <ArticleTitleField handleChange={this.props.handleChange} title={this.props.article.title} errors={this.props.errors}/>
                  {(!this.props.error && this.props.showHelper) && <InfoBubble/> }
                  {(this.props.error) && <ErrorBubble errors={this.props.errors} crossmarkErrors={this.props.crossmarkErrors}/> }
                </div>

                <div className='row'>
                  <OptionalTitleData
                    show={this.props.showOptionalTitleData}
                    toggleFields={this.props.toggleFields}
                    subtitle={this.props.article.subtitle}
                    originallanguagetitle={this.props.article.originallanguagetitle}
                    originallanguagetitlesubtitle={this.props.article.originallanguagetitlesubtitle}
                    handleChange={this.props.handleChange}/>
                </div>

                <div className='row'>
                  <div className="fieldHolder">
                    <ArticleDOIField disabled={this.props.doiDisabled} doi={this.props.article.doi} handleChange={this.props.handleChange} errors={this.props.errors}/>
                    <ArticleUrlField url={this.props.article.url} handleChange={this.props.handleChange} errors={this.props.errors} />
                  </div>
                </div>

                <DatesRow
                  article={this.props.article}
                  errors={this.props.errors}
                  makeDateDropDown={makeDateDropDown}
                  handleChange={this.props.handleChange}
                />

                <BottomFields
                  article={this.props.article}
                  errors={this.props.errors}
                  makeDateDropDown={makeDateDropDown}
                  handleChange={this.props.handleChange}
                />

              </div>

              <SubItem
                title={'Contributor'}
                validating={this.props.validating}
                showSection={this.props.openItems.Contributors}
                addHandler={this.props.addSection.bind(null, 'contributors')}>
                  {this.props.contributors.map((data, i)=>
                    <Contributor
                      validating={this.props.validating}
                      key={i}
                      contributor={data}
                      remove={this.props.removeSection.bind(null, 'contributors', i)}
                      handler={this.props.boundSetState}
                      data={this.props.contributors}
                      index={i}/>
                  )}
              </SubItem>

              <SubItem
                title={'Funding'}
                validating={this.props.validating}
                showSection={this.props.openItems.Funding}
                addHandler={this.props.addSection.bind(null, 'funding')}>
                  {this.props.funding.map((data, i)=>
                    <Funding
                      validating={this.props.validating}
                      key={i}
                      funding={data}
                      remove={this.props.removeSection.bind(null, 'funding', i)}
                      handler={this.props.boundSetState}
                      data={this.props.funding}
                      index={i}/>
                  )}
              </SubItem>

              <SubItem
                title={'License'}
                validating={this.props.validating}
                showSection={this.props.openItems.Licenses}
                addHandler={this.props.addSection.bind(null, 'license')}
                freeToRead={this.props.article.freetolicense}>

                  <div className="freeToLicense">
                    <div className='row'>
                      <div className='fieldHolder'>
                        <div className='fieldinnerholder halflength'>
                          <div className='labelholder'>
                            <div></div>
                            <div className='labelinnerholder'>
                              <div className='label'>&nbsp;</div>
                            </div>
                          </div>
                          <div className='requrefieldholder'>
                            <div className='field'>
                              <div className='switchOuterHolder'>
                                <div className='switchInnerHolder'>
                                  <div>&nbsp;</div>
                                  <div className='switchLicense'>
                                    <div className='switchLabel'><span>Free to License</span></div>
                                    <Switch
                                      ref='freetolicense'
                                      onClick={() => {
                                        const event={
                                          target: {
                                            name: 'freetolicense',
                                            value: !this.props.article.freetolicense
                                          }
                                        }
                                        this.props.handleChange(event)
                                      }}
                                      on={this.props.article.freetolicense}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='errorHolder'>
                    </div>
                  </div>

                  {this.props.license.map((data, i)=>
                    <License
                      validating={this.props.validating}
                      key={i}
                      license={data}
                      remove={this.props.removeSection.bind(null, 'license', i)}
                      handler={this.props.boundSetState}
                      data={this.props.license}
                      index={i}
                      makeDateDropDown={makeDateDropDown}
                      freeToRead={i===0 ? this.props.addInfo.freetolicense : false}/>
                  )}
              </SubItem>

              <SubItem
                title={'Related Items'}
                validating={this.props.validating}
                showSection={this.props.openItems.relatedItems}
                addHandler={this.props.addSection.bind(null, 'relatedItems')}>
                  {this.props.relatedItems.map((data, i)=>
                    <RelatedItems
                      validating={this.props.validating}
                      key={i}
                      relateditem={data}
                      remove={this.props.removeSection.bind(null, 'relatedItems', i)}
                      handler={this.props.boundSetState}
                      data={this.props.relatedItems}
                      index={i}/>
                  )}
              </SubItem>

              <SubItem
                title={'Additional Information'}
                validating={this.props.validating}
                showSection={this.props.openItems.addInfo}>
                  <AdditionalInformation
                    addInfo={this.props.addInfo}
                    handler={this.props.boundSetState}
                    simCheckError={this.props.errors.simCheckUrlInvalid}/>
              </SubItem>

              {this.props.crossmark &&
                <SubItem
                  title={'Crossmark'}
                  showSection={!!Object.keys(this.props.showCards).length}
                  validating={this.props.validating}
                  CrossmarkAddButton={CrossmarkAddButton}>
                    <CrossmarkCards
                      showCards={this.props.showCards}
                      reduxDeleteCard={this.props.reduxDeleteCard}/>
                </SubItem>
              }

            </div>
          </form>
        </div>
      </div>
    )
  }
}
