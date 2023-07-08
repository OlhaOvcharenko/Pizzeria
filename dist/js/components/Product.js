import{select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';


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

      //app.cart.add(productSummary);

      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        details: {
          product: productSummary,
        },
      });
      thisProduct.element.dispatchEvent(event);
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

export default Product;
