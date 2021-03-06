import React from 'react'
import is from 'prop-types'

import {routes} from '../../routing'




export default class FormTextArea extends React.Component {

  static propTypes = {
    label: is.string.isRequired,
    name: is.oneOfType([is.string, is.array]).isRequired,
    style: is.string,
    value: is.string.isRequired,
    required: is.bool,
    error: is.bool,
    indicatorErrors: is.array,
    allErrors: is.object,
    errorUtility: is.object.isRequired,
    subItemIndex: is.string,
    changeHandler: is.func.isRequired,
    onBlur: is.func,
    onFocus: is.func,
    tooltip: is.object,
    tooltipUtility: is.object.isRequired
  }


  generateId = () => {
    if(Array.isArray(this.props.name)) {
      return `${this.props.name.join('-')}`.replace(/\s+/g, '')
    }

    return `${this.props.name}-${this.props.subItemIndex}`
  }


  onFocus = () => {
    if(this.props.onFocus) {
      this.props.onFocus()
    }

    if(this.props.errorUtility.setErrorMessages && this.props.error && this.props.indicatorErrors) {
      if(this.props.subItemIndex) {
        this.props.errorUtility.subItemIndex = this.props.subItemIndex
      }
      this.props.errorUtility.setErrorMessages(this.props.indicatorErrors, this.props.allErrors)

    } else if (this.props.tooltip) {
      this.props.errorUtility.setErrorMessages([])
    }

    this.props.tooltipUtility.assignFocus(this.generateId(), this.props.tooltip)
  }


  onBlur = () => {
    if(this.props.onBlur) {
      this.props.onBlur()
    }
  }


  render() {
    const isFocus = this.props.tooltipUtility.getFocusedInput() === this.generateId()

    return (
      <div className='fieldinnerholder fulllength'>
        <div className='labelholder'>
          <div className='labelinnerholder'>
            <div className='label'>{this.props.label}{this.props.required ? ' *' : ''}</div>
          </div>
        </div>
        <div className='requrefieldholder'>
          <div className={`requiredholder ${!this.props.required && 'norequire'}`}>
            <div className='required height64'>{this.props.required && <span>*</span>}</div>
          </div>
          <div className='field'>
            {isFocus && this.props.tooltip && <img className='infoFlag infoFlagTextArea' src={`${routes.images}/common/Asset_Icons_GY_HelpFlag.svg`} />}
            <textarea
              className={`height64 ${this.props.style ? this.props.style : ''} ${this.props.error ? 'fieldError' : ''} ${isFocus && this.props.tooltip ? 'infoFlagBorder' : ''}`}
              type='text'
              name={this.props.name}
              onChange={this.props.changeHandler}
              value={this.props.value}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            />
          </div>
        </div>
      </div>
    )

  }
}
