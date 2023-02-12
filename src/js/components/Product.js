import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';


class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // thisProduct.addToCart(); 
      thisProduct.element;
    }


    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (activeProduct !== thisProduct.element && activeProduct !== null) {
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
            
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder(); 
          
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart(); 
      });
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      // set price to default price
      let price = thisProduct.data.price;
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // select an element with the appropriate class
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // if image IS
            if (optionImage) {
              // add class active to image-element
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
          }
          
          else {
            if (optionImage) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
        }
      }
      //multiply price by amount
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    addToCart() {
      const thisProduct = this;
    //   app.cart.add(thisProduct.readyCartProduct());

    const event = CustomEvent('add-to-cart', {
        bubbles:true,
        detail:{
            product:thisProduct,
        },
    });

      thisProduct.element.dispatchEvent(event);
    }

    readyCartProduct() {
      const thisProduct = this;
      const productSummary = {
        'id': thisProduct.id,
        'name': thisProduct.data.name,
        'amount': thisProduct.amountWidget.value,
        'priceSingle': thisProduct.priceSingle,
        'price': thisProduct.priceSingle * thisProduct.amountWidget.value,
        'params': thisProduct.readyCartProductParams(),
      };
      return productSummary;
    }
    readyCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };
        
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  export default Product;