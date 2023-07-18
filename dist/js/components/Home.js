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

  }

  initSlider(){

   new Flickity(select.all.carousel, {
    prevNextButtons: false,
    autoPlay: true,
    imagesLoaded: true,
    percentPosition: false,

    });
  }


}

export default Home;
