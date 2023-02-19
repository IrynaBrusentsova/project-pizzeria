
import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.tablesClicked = [] /*властивість, яка зберігатиме інформацію про вибраний столик. */

    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();

  };

  // getData() {

  //   const thisBooking = this;
  //   const startDateParam = settings.db.dateStartParamKey + '='  + utils.dateToStr(thisBooking.datePicker.minDate);
  //   const endDateParam = settings.db.dateEndParamKey + '='  + utils.dateToStr(thisBooking.datePicker.maxDate);

  //   const params = {
  //     bookings:[
  //       startDateParam,
  //       endDateParam,
  //     ],
  //     eventsCurrent:[
  //       settings.db.notRepeatParam,
  //       startDateParam,
  //       endDateParam,
  //     ],
  //     eventsRepeat:[
  //       settings.db.repeatParam,
  //       endDateParam,
  //     ],
  //   };

  //   console.log('getDatam params', params);

  //   const urls = {
  //     bookings:       settings.db.url + '/' + settings.db.bookings
  //                                     + '?' + params.bookings.join('&'),
  //     eventsCurrent:  settings.db.url + '/' + settings.db.events   
  //                                     + '?' + params.eventsCurrent.join('&'),
  //     eventsRepeat:   settings.db.url + '/' + settings.db.events   
  //                                     + '?' + params.eventsRepeat.join('&'),

  //   };

  //   // console.log('getData urls', urls);


  //   Promise.all([
  //     fetch(urls.bookings),
  //     fetch(urls.eventsCurrent),
  //     fetch(urls.eventsRepeat),
  //   ])
  //   .then(function(allResponses){
  //     const bookingsResponse      = allResponses[0];
  //     const eventsCurrentResponse = allResponses[1];
  //     const eventsRepeatResponse  = allResponses[2];

  //     return Promise.all([
  //     bookingsResponse.json(),
  //     eventsCurrentResponse.json(),
  //     eventsRepeatResponse.json(),
  //     ]);
      
  //   })
  //   .then(function([bookings, eventsCurrent, eventsRepeat])  {
  //     //  console.log(bookings);
  //     //  console.log(eventsCurrent);
  //     //  console.log(eventsRepeat);

  //     thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
  //   });

  // }



// ===


/*10.3*/

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    };
    console.log('getData params', params);

    const urls = {
      bookings:      settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsRepeat.join('&'),
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses)  {
        const bookingsResponse      = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse  = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat])  {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

// 10.3

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked ={};
    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate  = thisBooking.datePicker.minDate;
    const maxDate  = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
        thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        } 
      } 
    }
     console.log(' thisBooking.booked',  thisBooking.booked);
     thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if( typeof thisBooking.booked[date] =='undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour =  utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      // console.log('loop', index);
      if (typeof thisBooking.booked[date][hourBlock] =='undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] =='undefined'
      ||
      typeof thisBooking.booked[thisBooking.date] [thisBooking.hour] =='undefined'
      ){
        allAvailable = true;
      }

      for(let table of thisBooking.dom.tables){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if(isNaN (tableId)){
          tableId = parseInt(tableId);
        }
        if(
          !allAvailable
          &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
        ){
          table.classList.add(classNames.booking.tableBooked);
        }else{
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
  }

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
    console.log(thisBooking.dom.datePicker);

    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    console.log(thisBooking.dom.hourPicker);

    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    console.log(thisBooking.dom.tables);

    
  }

  



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
    
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    }); 
  }

}

export default Booking;

// ===



