import {settings, select} from '../settings.js';



class AmountWidget{
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }
    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

   
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }

      
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      console.log(newValue);
      const {
        amountWidget: { defaultMax, defaultMin },
      } = settings;

      if (newValue > defaultMax || newValue < defaultMin) {
        return;
      }

      if (thisWidget.value !== newValue) {
        thisWidget.value = newValue;
      }

      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        thisWidget.value = newValue;
      }

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;

      thisWidget.announce();
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function () {
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
  }




  export default AmountWidget;