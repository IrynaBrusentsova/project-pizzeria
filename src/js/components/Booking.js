
import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();
  };
  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    console.log( thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);

    thisBooking.dom.houseAmount = document.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.peopleAmount);
  };

  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function () { });

    thisBooking.houseAmount = new AmountWidget(thisBooking.dom.houseAmount);
    thisBooking.dom.houseAmount.addEventListener('update', function () { });

  };

}

export default Booking;
