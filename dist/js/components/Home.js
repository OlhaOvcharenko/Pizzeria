import {templates, select} from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;
  
    thisHome.render(element);
    thisHome.initSlider();

  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.pageHome();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    element.innerHTML = generatedHTML;
  }

  initSlider(){

    // eslint-disable-next-line no-undef
    new Flickity(select.all.carousel, {
      prevNextButtons: false,
      autoPlay: true,
      imagesLoaded: true,
      cellAlign: 'left',
      contain: true,
      percentPosition: false,
    });
  }
}

export default Home;
