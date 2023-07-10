import {select,templates} from '../settings.js';
import AmountWidget  from './AmountWidget.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }
  
  render(element) {
    const generatedHTML = templates.bookingWidget();

    this.dom = {};
    this.dom.wrapper = element;

    element.innerHTML = generatedHTML;

    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){

    this.dom.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.dom.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

    this.dom.peopleAmount.addEventListener('updated', function () {
      // Handle people amount update
    });

    this.dom.hoursAmount.addEventListener('updated', function () {
      // Handle hours amount update
    });

  }
}

export default  Booking;