import AmountWidget from "./AmountWidget.js";

class InitWidgets{
  constructor(){

    this.initAmountWidget();

  }

  initAmountWidget(){

    this.dom.peopleAmount = new AmountWidget(this.dom.amountWidget);

    this.dom.peopleAmount.addEventListener('updated', function () {
    });

  }

}

export default InitWidgets;