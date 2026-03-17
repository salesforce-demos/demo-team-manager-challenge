import { LightningElement } from 'lwc';
import ASSETS from '@salesforce/resourceUrl/DFPepsiSiteLdn01';

const SITE_NAV_ITEMS = [
  { text: 'Who we are', hasDropdown: true },
  { text: 'Our Impact', hasDropdown: true },
  { text: 'Our Brands', hasDropdown: false },
  { text: 'Our Stories', hasDropdown: false },
  { text: 'Resources', hasDropdown: true },
];

export default class PepsiMainSiteLdn extends LightningElement {
  landingImg = `${ASSETS}/landing.png`;
  siteLogo = `${ASSETS}/site-logo.png`;
  siteDropdown = `${ASSETS}/site-dropdown.png`;
  arrowGif = `${ASSETS}/arrow.gif`;
  halfBurstGif = `${ASSETS}/half-burst.gif`;
  chatIcon = `${ASSETS}/chat-icon-ldn.png`;
  showChat = false;

  SITE_NAV_ITEMS = SITE_NAV_ITEMS;

  handleStartChat() {
    this.showChat = true;
    this.template.querySelector('c-pepsi-main-site-chat').sendMessage();
  }

  handleCloseChat() {
    this.showChat = false;
  }
}