import {select, classNames, templates, settings} from './settings.js';
import utils from '../utils.js';
import CartProduct from "./CartProduct";


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

export default Cart;