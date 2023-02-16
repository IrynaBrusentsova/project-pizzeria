
import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);

    thisBooking.dom.houseAmount = document.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.peopleAmount);

    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    console.log( thisBooking.dom.datePicker);

    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    console.log( thisBooking.dom.hourPicker);

  };

  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('update', function () { });

    thisBooking.houseAmount = new AmountWidget(thisBooking.dom.houseAmount);
    thisBooking.dom.houseAmount.addEventListener('update', function () { });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('update', function () { });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('update', function () { });

  };

}

export default Booking;
