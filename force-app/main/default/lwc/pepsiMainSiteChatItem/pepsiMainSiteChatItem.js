import { LightningElement, api } from 'lwc';

export default class PepsiMainSiteChatItem extends LightningElement {
    @api message;
    @api chatConfigInfo;

    selectOption(event) {
        let dataId = event.currentTarget.getAttribute("data-name");
        let message = this.parseObjectArray(this.message);

        message.optionChosen = false;
        message.options.forEach(function (optionItem, index) {
            if (index == dataId) {
                optionItem.selected = true;
                message.optionChosen = true;
            }
        });

        let ev = new CustomEvent('selectoption', { detail: message });
        this.dispatchEvent(ev);
    }

    parseObjectArray(variable) {
        return JSON.parse(JSON.stringify(variable ?? []));
    }

    get messageContainer() {
        return this.message.sender == 'Customer' ? 'message-container right' : 'message-container left';
    }

    get timestamp() {
        return this.message.sender == 'Agent' ? 'Team PepsiCo Agent • ' + this.message.sendTime.toUpperCase() : ((this.message.sender == 'Customer') ? 'Read • ' + this.message.sendTime.toUpperCase() : '');
    }

    get isAgent() {
        return this.message.sender == "Agent";
    }

    get hasComponent() {
        return !this.message.component == '' || !this.message.component == null;
    }
}