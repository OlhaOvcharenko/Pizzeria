import { select, templates } from "../settings.js";


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
}

export default  Booking;