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
    thisHome.navLinks = document.querySelectorAll(select.nav.links);
    
    const idFromHash = window.location.hash.replace('#/', '');
    
    let pageMatchingHash = thisHome.pages[0].id;

    for(let page of thisHome.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
        
      }
    }
    
    thisHome.activatePage(pageMatchingHash);

    for(let link of thisHome.homeLinks){
      link.addEventListener('click', (event)=>{

        const clickedElement = event.currentTarget;
        event.preventDefault();
       

        // get page ID from href attr.
        const id = clickedElement.getAttribute('href').replace('#', '');
        //console.log(clickedElement,'clickedElement');
        // run thisApp.activatePage() with ID
        thisHome.activatePage(id);
        //console.log(id, 'id');
        // change URL hash, add / to prevent scrolling to #

        window.location.hash = '#/' + id;
      });
    }
  }

  activatePage(pageId){

    const thisHome = this;

    for(let page of thisHome.pages) {
      page.classList.add(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisHome.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
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
