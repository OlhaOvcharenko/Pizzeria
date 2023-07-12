import {select,templates} from '../settings.js';
import AmountWidget  from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    this.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){

    this.dom.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.dom.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    this.dom.datePickerWidget = new DatePicker(this.dom.datePicker);
    this.dom.hourPickerWidget = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', function () {
      // Handle people amount update
    });

    this.dom.hoursAmount.addEventListener('updated', function () {
      // Handle hours amount update
    });

    this.dom.datePicker.addEventListener('updated', function () {
    });

    this.dom.hourPicker.addEventListener('updated', function (){
    });

  }
}

export default  Booking;