import {templates, select, classNames} from '../settings.js';

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
    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.homeLinks = document.querySelectorAll(select.nav.homeLinks);
    hisApp.navLinks = document.querySelectorAll(select.nav.links);
  
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
