import {templates, select} from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    this.initSlider();

  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.pageHome();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    element.innerHTML = generatedHTML;
    console.log('home', generatedHTML);

    thisHome.dom.slider = thisHome.dom.wrapper.querySelectorAll(select.all.carousel);
  }

  initSlider(){
    const thisHome = this;

    thisHome.dom.slider.flickity({
      // options
      cellAlign: 'left',
      contain: true
    });
  }


}

export default Home;
