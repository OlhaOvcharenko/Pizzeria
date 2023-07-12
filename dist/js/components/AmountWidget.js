import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    console.log('AmountWidget:',thisWidget);
    //console.log('constructor arguments:',element);

    thisWidget.getElements(element);

    thisWidget.initActions();

  }

  getElements(){
    const thisWidget = this;
 
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return!isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <=settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', () => {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', (event)=>{
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.value) - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', (event)=>{
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.value) + 1);
    });
  }
}

export default AmountWidget;