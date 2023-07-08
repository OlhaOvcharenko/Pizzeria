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