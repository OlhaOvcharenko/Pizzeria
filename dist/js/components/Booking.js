import {select,templates,settings} from '../settings.js';
import utils from '../utils.js';
import AmountWidget  from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();
  }
  
  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
        // settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate),
        // settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate),
      ],
      eventsCurrent: [
        startDateParam,
        endDateParam,
        settings.db.repeatParam,
      ],
      eventsRepeat: [
        settings.db.notRepeatParam, endDateParam,
      ],
    };
    //console.log('getData params', params);
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    //console.log(params, 'params');
    //console.log(urls, 'urls');
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });

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