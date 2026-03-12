import { LightningElement } from 'lwc';
import ASSETS01 from '@salesforce/resourceUrl/DFPepsiSite01';
import ASSETS02 from '@salesforce/resourceUrl/DFPepsiSite02';

export default class PepsiMainSite extends LightningElement {
  preCarouselSite = `${ASSETS01}/site-precarousel.png`;
  postCarouselSite = `${ASSETS01}/site-postcarousel.png`;
  chatIcon = `${ASSETS02}/chat-icon.png`;

  carouselData = [
    {
      id: 'starry',
      image: `${ASSETS02}/carousel-1.gif`,
      title: "You can't beat this burst",
      description: "Talk about bursting onto the soda scene. With its crisp, satisfying, burst of caffeine-free lemon lime flavor, Starry is the next big thing for a new generation of refreshment seekers. Also available with zero sugar.",
      buttonText: "Order Now",
      buttonUrl: "https://www.pepsicopartners.com/pepsico/en/USD/PEPSICO-BRANDS/STARRY%E2%84%A2/c/brand_starry?source=brand_pepsicobrands&root=beverages&selectedBrand=brand_starry",
    },
    {
      id: 'tea',
      image: `${ASSETS02}/carousel-2.jpg`,
      title: "Tea is for tempting",
      description: "Whether they prefer it \"straight up\" or infused with fun new flavor combinations, tea lovers will find the refreshment they're thirsty for in offerings from our Pure Leaf® and Lipton® brands.",
      buttonText: "Order Now",
    },
    {
      id: 'menus',
      image: `${ASSETS02}/carousel-3.jpg`,
      title: "Menus Are Making a Comeback",
      description: "During the pandemic, operators were forced to strip menus down to the essentials as supply chain issues and labor shortages hit. Fortunately, menus are growing again. But the operational lessons remain—and ingredient versatility continues to be a top priority.",
      buttonText: "Read Article",
    },
    {
      id: 'juice',
      image: `${ASSETS02}/carousel-4.jpg`,
      title: "No tricks. Just Squeeze",
      description: "With amazing flavors that taste like they just came right off the farm, PepsiCo's juice options are sure to be sipped (or gulped) to your customers' delight. Be sure to check out our newly reformulated Naked Juice® with a new look!",
      buttonText: "Order Now",
    },
    {
      id: 'poppi',
      image: `${ASSETS02}/carousel-5.jpg`,
      title: "Modernizing Soda for the Next Generation",
      description: "New to the PepsiCo portfolio, poppi is a modern soda for the next generation. With 5g of sugar, prebiotics, and ingredients you can love, poppi enables the freedom to love soda again!",
      buttonText: "Order Now",
    }
  ];

  currentSlide = 0;
  autoplayInterval;
  showChat = false;

  get computedSlides() {
    return this.carouselData.map((slide, index) => {
      let slideState = '';
      if (index === this.currentSlide) {
        slideState = 'active';
      } else if (index === ((this.currentSlide - 1 + 5) % 5)) {
        slideState = 'previous';
      }
      
      return {
        ...slide,
        isActive: index === this.currentSlide,
        slideClasses: `carousel-slide ${slideState}`,
        dotClasses: `slds-button slds-button_icon carousel-dot ${index === this.currentSlide ? 'active' : ''}`
      };
    });
  }

  connectedCallback() {
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % 5;
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + 5) % 5;
  }

  goToSlide(event) {
    this.currentSlide = parseInt(event.target.dataset.index, 10);
    // Reset autoplay timer when manually changing slides
    this.stopAutoplay();
    this.startAutoplay();
  }


  handleShowChat() {
    this.showChat = !this.showChat;
  }
}