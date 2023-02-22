
// ===
import { settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();

    // console.log('AmountWidget', AmountWidget);
  }
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector('input.amount');
    thisWidget.dom.linkDecrease =
      thisWidget.dom.wrapper.querySelector('a[href="#less"]');
    thisWidget.dom.linkIncrease =
      thisWidget.dom.wrapper.querySelector('a[href="#more"]');
    thisWidget.setValue(thisWidget.dom.input.value);
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    //використовуємо пусту функцію, щоб додати в аргумент функцію
    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    //додати Listener click, для якого обробник зупинить дію за замовчуванням для цієї події
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      //і використовуватиме setValue з аргументом thisWidget.value мінус 1
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}
export default AmountWidget;

// =====
