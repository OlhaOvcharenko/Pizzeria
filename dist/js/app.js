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
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
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
      thisProduct.name = data.name;

      thisProduct.renderInMenu();
      //console.log('New Product:', thisProduct);

      thisProduct.getElements();

      thisProduct.initAccordion();
      //console.log('Ative Product:', thisProduct);

      thisProduct.initOrderForm();
      //console.log('Order Form:', thisProduct);

      thisProduct.initAmountWidget();
      //console.log(thisProduct);

      thisProduct.processOrder();
      //console.log('Process of Order:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
  

      /* Create element using utils.createDOMFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //console.log(thisProduct.element);

      /* Find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom = {};
      
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }

    initAccordion() {
      const thisProduct = this;
      //console.log(thisProduct);
    
      /* Find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(clickableTrigger);
    
      /* START: Add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
        /* Prevent default action for event */
        event.preventDefault();
        //console.log(event);
    
        /* Find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
    
        /* If there is an active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
    
        /* Toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log(thisProduct)

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log(thisProduct);

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      //console.log('formData', formData);

      /*set price to default price*/
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //creat const to get the selected option from paramID
          const selectedOption = formData[paramId] && formData[paramId]. includes(optionId);
          //console.log(selectedOption);

          if(selectedOption) {
            // Check if the selected option is not the default option
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
            } else {
              // check if the option is default
              if (option.default) {
              // reduce price 
              price -= option.price;
              }
            }

          // create a const to find image which = a specific category-option
          const productImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if(productImage) {

            if(selectedOption){
              //add class active to image 
              productImage.classList.add(classNames.menuProduct.imageVisible);
            }else{
              productImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /*multiplie price by amount*/
      
      thisProduct.priceSingle = price;

      price *= thisProduct.amountWidget.value;

      thisProduct.dom.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct =this;

      const productSummary = thisProduct.prepareCartProduct();

      app.cart.add(productSummary);
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.priceSingle * thisProduct.amountWidget.value;
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
    
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
    
          if (selectedOption) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }      
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      //console.log('AmountWidget:',thisWidget);
      //console.log('constructor arguments:',element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);

      thisWidget.setValue(thisWidget.input.value);

      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;
      
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue =  parseInt(value);
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;

      /*TODO:add validation*/
      if(thisWidget.value !== newValue && !isNaN(newValue)) {
        thisWidget.value = newValue;
      }
      if(thisWidget.value < minValue) {
        thisWidget.value = minValue;
      }
      if(thisWidget.value > maxValue) {
        thisWidget.value = maxValue + 1;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault(); // Powstrzymuje domyślną akcję dla eventu "click"
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault(); // Powstrzymuje domyślną akcję dla eventu "click"
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);

    }
  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = []; 

      thisCart.getElements(element);

      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.address = element.querySelector(select.cart.address);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
    }

  
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault(); 

        thisCart.sendOrder();

      });
  
    }

    sendOrder() {
      const thisCart = this;
    
      const url = settings.db.url + '/' + settings.db.orders;
    
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
        totalNumber: thisCart.dom.totalNumber.innerHTML,
        deliveryFee: thisCart.dom.deliveryFee.innerHTML,
        products: [],
      };
    
      console.log('payload', payload);
    
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
    
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
    
      fetch(url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    
      console.log('options', options);
    }
    
    remove(cartProduct) {
     const thisCart = this;
     
     cartProduct.dom.wrapper.remove();

     const indexOfProduct = thisCart.products.indexOf(cartProduct);

     if (indexOfProduct !== -1) {
      thisCart.products.splice(indexOfProduct, 1);
    }

     thisCart.update();

    }

    add(menuProduct) {
      const thisCart = this;
    
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    update() {
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
    
      let totalNumber = 0;
      let subtotalPrice = 0;
    
      for (let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
    
      thisCart.totalNumber = totalNumber;
      thisCart.subtotalPrice = subtotalPrice;
      
      if (totalNumber === 0) {
        thisCart.deliveryFee = 0;
      } else {
        thisCart.deliveryFee = deliveryFee;
      }

      thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
    
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

      for (let item of thisCart.dom.totalPrice) {
        item.innerHTML = thisCart.totalPrice;
      }
    }

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
  
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
  
      thisCartProduct.getElements(element);
  
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
  
    getElements(element) {
      const thisCartProduct = this;
  
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }
  
    initAmountWidget() {
      const thisCartProduct = this;
  
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
  
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
  
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
  
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
  
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  
      });
  
    }

    remove (){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    getData(){
      const thisCartProduct = this;

      const getDataSummary = {};
      
      getDataSummary.id = thisCartProduct.id;
      getDataSummary.name = thisCartProduct.name;
      getDataSummary.amount = thisCartProduct.amount;
      getDataSummary.price = thisCartProduct.price;
      getDataSummary.priceSingle = thisCartProduct.priceSingle;
      getDataSummary.params = thisCartProduct.params;
      return getDataSummary;

    }

    initActions() {

      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      })

    }

  }


  const app = {

    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data =  {};

      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
        
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        /*save parsedResponce as thisApp.data.proucts*/
        thisApp.data.products = parsedResponse;

        /*execute initMenu method*/
        app.initMenu();
      });

      console.log('thisApp.data', JSON.stringify(thisApp.data))
    },
  
    init: function() {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      

      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }

  }
  
  app.init();

}
