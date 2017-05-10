import React, { Component } from 'react'
import { stateTrackerII } from 'my_decorators'

import Contributor from './Contributor'
import Funding from './Funding'
import License from './License'
import RelatedItems from './RelatedItems'
import AdditionalInformation from './AdditionalInformation'
import OptionalIssueInformation from './OptionalIssueInformation'
import { Crossmark, CrossmarkAddButton } from './Crossmark/crossmark'



export default class SubtItem extends Component {
  constructor (props) {
    super(props)
    const { incomingData } = this.props
    this.state = {
      showSection: false,
      incomingData: incomingData,
      crossmarkAddList: false,
      crossmarkCards: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
        incomingData: nextProps.incomingData
    })
  }

  toggle = () => {
    this.setState({
        showSection: !this.state.showSection
    })
  }

  toggleCrossmarkAddList = () => {
    this.setState({
      crossmarkAddList: !this.state.crossmarkAddList
    })
  }

  addCrossmarkCard = (selection) => {
    this.setState({ crossmarkCards: {...this.state.crossmarkCards, [selection]: true } })
  }

  removeCrossmarkCard = (selection) => {
    const newState = {...this.state.crossmarkCards};
    delete newState[selection];
    this.setState({ crossmarkCards: newState })
  }

  render () {
    const { remove, handler, title, addHandler, addable, arrowType, makeDateDropDown } = this.props
    var incomingData = this.state.incomingData
    // Map through the todos
    let Nodes;
    if (addable && title !== 'Crossmark') {
      Nodes = incomingData.map((data, i) => {
        var card = ''
        switch (title) {
          case 'Contributor':
            card = <Contributor
              key={i}
              contributor={data}
              remove={remove}
              handler={handler}
              index={i}/>
            break
          case 'Funding':
            const {addGrant, removeGrant, grantHandler} = this.props
            card = <Funding
              key={i}
              funding={data}
              remove={remove}
              handler={handler}
              index={i}
              grantNumbers={data.grantNumbers}
              addGrant={addGrant}
              removeGrant={removeGrant}
              grantHandler={grantHandler}/>
            break
            case 'License':
            const { freetoread, errorLicenseStartDate } = this.props
            card = <License
                    key={i}
                    license={data}
                    remove={remove}
                    handler={handler}
                    index={i}
                    freetoread={freetoread}
                    errorLicenseStartDate={errorLicenseStartDate}
                    makeDateDropDown={makeDateDropDown} />
            break
          case 'Related Items':
            card = <RelatedItems
              key={i}
              relateditem={data}
              remove={remove}
              handler={handler}
              index={i}/>
            break
          case 'Optional Issue Information (Contributorship)':
            card = <OptionalIssueInformation
              key={i}
              optionalIssueInfo={data}
              remove={remove}
              handler={handler}
              index={i}/>
            break
          case 'Crossmark':
            card = <Crossmark
              key={i}
              makeDateDropDown={makeDateDropDown}/>
            break
        }
        return (card)
      })

    } else if (title==='Crossmark') {
      Nodes =
        <Crossmark
          makeDateDropDown={makeDateDropDown} removeCrossmarkCard={this.removeCrossmarkCard} crossmarkCards={this.state.crossmarkCards}/>

    } else {
       Nodes = <AdditionalInformation
                      addInfo={incomingData}
                      makeDateDropDown={makeDateDropDown}
                      handler={handler} />
    }
    return (
      <div>
        <div className='topbar'>
          <div className='titleholder'>
            <div className={'titleinnholder' + (addable ? ' subinnerholder' : ' notclickableholder')} onClick={this.toggle.bind(this)}>
              <span className={'arrowHolder' + (this.state.showSection ? ' openArrowHolder' : '')}>
                {(arrowType === 'dark') ? <img src="/images/AddArticle/DarkTriangle.svg" /> : <img src="/images/AddArticle/Triangle.svg" />}
              </span>
              <span>{title}{addable}</span>
            </div>
            {addable && title !== 'Crossmark' &&
              <div className='addholder'>
                <a onClick={()=>{
                  if (!this.state.showSection) {
                    this.toggle()
                  }
                  addHandler()
                }}>Add New</a>
              </div>}
            {title === 'Crossmark' &&
              <CrossmarkAddButton
                toggle={this.toggle}
                toggleAdd={this.toggleCrossmarkAddList}
                showSection={this.state.showSection}
                addList={this.state.crossmarkAddList}
                addCrossmarkCard={this.addCrossmarkCard}
              />}
          </div>
        </div>
        {this.state.showSection &&
         <div className='body'>
           {Nodes}
         </div>}
      </div>
    )
  }
}
