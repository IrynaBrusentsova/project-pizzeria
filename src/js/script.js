/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
  };
  

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };

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

      // thisProduct.readyCartProduct ();
      
      

      console.log('new Product:', thisProduct)
    }
    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log( generatedHTML);
     
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      console.log(thisProduct.element);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      console.log(menuContainer);

      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);
      console.log(menuContainer);
    }   

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log( thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log( thisProduct.priceElem);
      thisProduct.imageWrapper =  thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      // console.log(thisProduct.imageWrapper);
       thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      // console.log(thisProduct.amountWidgetElem);
      
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log( clickableTrigger);
  
      /* START: add event listener to clickable trigger on event click */
      // clickableTrigger.addEventListener('click', function(event)
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();
  
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        console.log(activeProduct);
  
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== thisProduct.element && activeProduct !== null){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
         
      });
  
    }

    initOrderForm(){
      const thisProduct = this;
      console.log(thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder(){
      const thisProduct = this;
     console.log(thisProduct);
     

      

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData:', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }

        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }

          const option = param.options[optionId];
          console.log(optionId, option);
          // =====
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default

            if(!option.default ) {
              // add option price to price variable  
              price = price + option.price;
              console.log(price);
            }
          } else {
            // check if the option is default
            if(option.default ) { 
              // reduce price variable
              price = price - option.price;
            }
          }  
           const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
           
           const optionImage = thisProduct.imageWrapper.querySelector( '.' + paramId + '-' + optionId );
                           
            if (optionImage){
              if (optionSelected){
                optionImage.classList.add(classNames.menuProduct.imageVisible);
              }
              else {
               optionImage.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          
        }
      }
      /*multiply price by amount */
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priseSingle = price;
      console.log(thisProduct.priseSingle);
            
      //  thisProduct.priceSingle.innerHTML = thisProduct.data.price;
       thisProduct.priceElem.innerHTML = price;  
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
         event.preventDefault();
         thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      app.cart.add (thisProduct.readyCartProduct ()); 
    }

    readyCartProduct (){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle, 
        price:  thisProduct.priceSingle * thisProduct.amountWidget.value,
        params:thisProduct.readyCartProductParams(),
      };
       return productSummary;
      
    }
    
    readyCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }
  
  
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget:',thisWidget );
      console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      thisWidget.initAction(); 
      //  thisWidget.setValue(thisWidget.input.value); 
       thisWidget.setValue(settings.amountWidget.defaultValue);   
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.setValue(thisWidget.input.value);
    }

    

    setValue(value){
      const thisWidget = this;
      
      const newValue = parseInt(value);
      console.log(newValue);
     
    const {
    	amountWidget: {defaultMax, defaultMin},   	
    } = settings;

    if (newValue > defaultMax || newValue < defaultMin){
    	return;
    }

     if (thisWidget.value !== newValue){
     	thisWidget.value = newValue;
    }

    if (thisWidget.value !== newValue && !isNaN(newValue)){ 
      	thisWidget.value = newValue; 
    }   
            
       thisWidget.value = newValue;
       thisWidget.input.value = thisWidget.value;

      thisWidget.announce(); 
    }
    
// ====

    announce(){
      const thisWidget = this;
      const event =  new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

    initAction(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      });
    }
  }
  
  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initAction();
      console.log('new Cart', thisCart);
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      console.log(thisCart.dom.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      console.log( thisCart.dom.productList);
    }

    initAction(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
   
    



    add(menuProduct) {
      const thisCart = this;

      /* generate HTML based on template*/
      const generatedHTML = templates.cartProduct(menuProduct);
      console.log( generatedHTML);

      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      console.log(generatedDOM);

      /* find menu container */
      const cartContainer = document.querySelector(select.containerOf.cart);
      console.log(cartContainer);

      /* add element to menu*/
      thisCart.dom.productList.appendChild(generatedDOM);
      console.log('adding product', menuProduct);

      thisCart.products.push(menuProduct);
      console.log ('thisCart.products', thisCart.products);
      
    }  
  }

 

   const app = {
   initMenu: function() {
    const thisApp = this;
    console.log('thisApp.data:', thisApp.data);
   
    for (let productData in thisApp.data.products) {
      new Product(productData, thisApp.data.products[productData]); 
    };
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = dataSource;
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    

    thisApp.initData();

    thisApp.initMenu();

    thisApp.initCart();
   
  },

};

app.init();
}
