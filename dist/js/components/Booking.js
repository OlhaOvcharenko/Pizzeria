import {select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget  from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.starters =[];
    thisBooking.selectedTables = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  
  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        startDateParam,
        endDateParam,
        settings.db.repeatParam,
      ],
      eventsRepeat: [
        settings.db.notRepeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);
    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings 
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events 
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events 
                                     + '?' + params.eventsRepeat.join('&'),
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
        //console.log('bookings', bookings);
        //console.log('eventsCurrent', eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked ={};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour,duration,table){
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
    //console.log(thisBooking.booked, 'thisBooking.booked');
  
  }

  updateDOM() {
    const thisBooking = this;

    //console.log(thisBooking.booked, 'thisBooking.booked');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    // console.log(thisBooking.hourPicker.value, 'thisBooking.hourPicker.value', typeof thisBooking.hourPicker.value);
    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (!allAvailable
        && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
    
  render(element) {
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    element.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = element.querySelector(select.booking.floorPlan);

    thisBooking.dom.starters = element.querySelector(select.booking.starters);
    thisBooking.dom.form = element.querySelector(select.booking.form);

    thisBooking.dom.ppl = element.querySelector(select.booking.ppl);
    thisBooking.dom.hours = element.querySelector(select.booking.hours);

    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.orderButton = element.querySelector(select.booking.orderButton);
 
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.resetSelectedTable();
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      thisBooking.resetSelectedTable();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.resetSelectedTable();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.resetSelectedTable();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

    thisBooking.dom.starters.addEventListener('click', function(event){
      const clickedElement = event.target;

      const tagName = clickedElement.tagName;
      const type = clickedElement.getAttribute('type');
      const name = clickedElement.getAttribute('name');

      if(tagName == 'INPUT' && type == 'checkbox' && name == 'starter'){
        if(clickedElement.checked) {
          thisBooking.starters.push(clickedElement.value);
          //console.log(clickedElement.value);
        } else {
          const starterNumber = thisBooking.starters.indexOf(clickedElement.value);
          thisBooking.starters.splice(starterNumber, 1);
        }
      }
      //console.log(thisBooking.starters);
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();

      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.tableSelected);
      }
      thisBooking.dom.form.reset();
    });
  }
  initTables(event){

    const thisBooking = this;

    const clickedElement = event.target;
    console.log('clickedElem', clickedElement);

    if (clickedElement.classList.contains('table')) {

      const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);
      console.log('tableId', tableId);

      if (clickedElement.classList.contains('booked')){

        alert('This table is already booked');

      } else if (thisBooking.selectedTables !== 0 && clickedElement.classList.contains('selected')){
        clickedElement.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTables = 0;

      } else {

        for(let table of thisBooking.dom.tables){
          // If any table have class 'selected'
          if(table.classList.contains('selected')){
            // Remove this class from every table
            table.classList.remove(classNames.booking.tableSelected);
          }
        }
        thisBooking.selectedTables = tableId;
        clickedElement.classList.add(classNames.booking.tableSelected);
        console.log('thisBooking.selectedTables',thisBooking.selectedTables);
      }
    }
  }

  resetSelectedTable(){
    const thisBooking = this;
    const selectedTables = thisBooking.dom.wrapper.querySelectorAll(select.booking.selected);
    selectedTables.forEach(table => table.classList.remove(classNames.booking.tableSelected));
  }

  sendBooking(){
    const thisBooking = this;
  
    const url = settings.db.url + '/' + settings.db.bookings;
  
    const bookingLoad = {
      date:  thisBooking.date,
      hour:  thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selectedTables),
      duration:  parseInt(thisBooking.dom.hours.value),
      ppl: parseInt(thisBooking.dom.ppl.value),
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.adress,
      starters: thisBooking.starters,
    };

    console.log(bookingLoad);
    thisBooking.makeBooked(bookingLoad.date, bookingLoad.hour, bookingLoad.duration, bookingLoad.table);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingLoad),
    };
  
    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisBooking.getData();
      });

  }
}

export default  Booking;