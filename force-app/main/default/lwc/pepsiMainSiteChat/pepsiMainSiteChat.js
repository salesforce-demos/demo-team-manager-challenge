import { LightningElement, api, track } from 'lwc';
import ASSETS02 from '@salesforce/resourceUrl/DFPepsiSite02';
import cpChatUtils from 'c/cpChatUtils';
import { getChatConfig } from 'c/cpChatDataSelector';

export default class PepsiMainSiteChat extends LightningElement {
    recordId;
    @api todayChatCounter;
    @track isSendingMessage = false;
    @track isTyping = false;
    @track typingMessage = { 'isTyping': false }
    @track currentTyping = '';
    @track botIsThinking = false;
    _interval;
    wordCount = 0;
    @api inputEmpty = false;
    @track preloadImages = [];
    _chatConfig;
    todayIndex = -1;

    @api
    get chatConfigInfo() {
        return this.parseObjectArray(this._chatConfig);
    }
    set chatConfigInfo(value) {
        let chatConfig = value;

        //Add Styles
        chatConfig.messagesFilteredByDate.forEach((timestamp, timeIndex) => {
            timestamp.messages.forEach((message, msgIndex) => {
                message.messageClass = 'message one-line ' + (message.imageURL ? 'image-message ' : '') + (message.sender == 'Customer' ? 'own-text me' : 'you-message you');
                //Options style
                message.options.forEach((optionItem, index) => {
                    optionItem.optionClass = message.optionType == "text" ? 'selection-container' : 'option-container';
                    if (!optionItem.selected && message.optionChosen) {
                        optionItem.optionClass = optionItem.optionClass + ' not-chosen';
                    }
                });

                if (message.messageShown) {
                    message.sendTime = message.sendTime ?? this.getLiveTime(chatConfig.hourFormat24, chatConfig.showAMPM);
                }

                message.hasOptions = message.optionType != "none";
                message.isImageSelection = (message.optionType == "mixed" || message.optionType == "images");

                message.optionsContainerClass = 'action-message';
                if (message.optionType == "text") {
                    message.optionsContainerClass = message.optionsContainerClass + ' text-selection-container';
                    message.optionsContainerClass = message.optionsContainerClass + (message.optionChosen ? ' text-selected' : '');
                } else {
                    message.optionsContainerClass = message.optionsContainerClass + ' image-selection-container';
                }
            });
        });
        this._chatConfig = chatConfig;
    }

    //RESOURCES
    threeDotsIcon = `${ASSETS02}/three-dots.png`;
    splitPaneIcon = `${ASSETS02}/split-pane.png`;
    dropdownIcon = `${ASSETS02}/dropdown.png`;
    plusIcon = `${ASSETS02}/plus.png`;
    waveformIcon = `${ASSETS02}/waveform.png`;
    agentforceFooter = `${ASSETS02}/agentforce-footer.png`;

    connectedCallback() {
        this.inputEmpty = true;
        this.recordId = this.getUrlParamValue(window.location.href, 'recordId');
        const recordName = this.getUrlParamValue(window.location.href, 'recordName');
        const demoId = this.getUrlParamValue(window.location.href, 'demoId');

        this.getChatConfigFromJSON(recordName);

        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('send_msg_nextgen_chat', this.callSendMessage);
    }

    disconnectedCallback() {
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('send_msg_nextgen_chat', this.callSendMessage);
    }

    handleKeyUp = (event) => {
        event.preventDefault();
        const inputChat = this.template.querySelector('[data-id="autoGrow"]');
        const isFocus = this.template.activeElement === inputChat;

        if ((event.key === 'Enter' || event.key === 'ArrowRight') && isFocus) {
            if (!this.isTyping && !this.isSendingMessage) {
                let todayMessages = this.chatConfigInfo.messagesFilteredByDate[this.todayIndex].messages;
                var nextMessage = todayMessages[this.todayChatCounter + 1];
                if (nextMessage && nextMessage.sender == 'Customer' && nextMessage.text.length) {
                    this.changeInputValue(event);
                } else {
                    this.sendMessage();
                }
            }
        }
    }

    @track isMobile = false;
    getChatConfigFromJSON(recordName) {
        try {
            var resultObject = getChatConfig(recordName);
            if (resultObject) {
                this.isMobile = resultObject.chatConfig.isMobile;
                let todayIndex = resultObject.chatConfig.messagesFilteredByDate.findIndex(x => x.day === "Today");

                let _chatConfigInfo = resultObject.chatConfig;

                let context = this;
                this.todayChatCounter = resultObject.chatConfig.todayChatCounter;
                _chatConfigInfo.messagesFilteredByDate.forEach(function (timestamp) {
                    timestamp.messages.forEach(function (message) {
                        if (message.imageURL) {
                            message.imageURL = context.fixImage(message.imageURL);
                            context.preloadImages.push({ 'id': 'img-' + message.id, 'src': message.imageURL });
                        }
                        message.component = message.component ? "c/" + message.component : "";
                    });
                });

                this.chatConfigInfo = resultObject.chatConfig;

                if (this.chatConfigInfo.botImageURL) {
                    this.chatConfigInfo.botImageURL = context.fixImage(this.chatConfigInfo.botImageURL);
                }

                this.preloadImages.push({ 'id': 'img-' + this.chatConfigInfo.id, 'src': this.chatConfigInfo.botImageURL });
                this.todayIndex = todayIndex;
            }
        } catch (error) {
            console.error(error);
        }
    }

    handleChatFocus(event) {
        try {
            if (this.isMobile) {
                event.preventDefault();
                var hiddenInput = this.template.querySelector(`[data-id="hidden-input"]`);
                hiddenInput.focus();
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    hasAssignedListeners = false;
    textareaHTML;
    renderedCallback() {
        if (!this.hasAssignedListeners) {
            const textarea = this.template.querySelector('[data-id="autoGrow"]');
            if (textarea) {
                this.hasAssignedListeners = true;
                this.textareaHTML = textarea;
            }
        }
        this.scrollChat(5);
    }

    @api
    sendMessage() {
        if (this.todayChatCounter < 0) {
            const todayMessages = this.chatConfigInfo.messagesFilteredByDate[this.todayIndex].messages;
            const nextMessage = todayMessages[this.todayChatCounter + 1];
            if (nextMessage && (nextMessage.sender === 'Agent' || nextMessage.sender === 'Bot') && nextMessage.sendAutimatically) {
                this.botIsThinking = true;
                const delay = nextMessage.delay ?? 1000;
                setTimeout(() => {
                    this.botIsThinking = false;
                    this.callSendMessage();
                }, delay);
            }
        } else {
            this.callSendMessage();
        }
    }

    updateOptionSelected(event) {
        let todayMessages = this.chatConfigInfo.messagesFilteredByDate[this.todayIndex].messages;
        let messageUpdated = this.parseObjectArray(event.detail);
        let indexMessage = todayMessages.findIndex(x => x.order === messageUpdated.order);

        if (todayMessages[indexMessage + 1]) {
            let option = messageUpdated.options.find(x => (x.text === todayMessages[indexMessage + 1].text || x.isSelectable));
            if (option) {
                messageUpdated.options.forEach(x => x.selected = false);
                messageUpdated.options.forEach(x => {
                    if (option.order == x.order) {
                        x.selected = true;
                    }
                });
            }
        }
        let chatConfig = this.chatConfigInfo;
        chatConfig.messagesFilteredByDate[this.todayIndex].messages[indexMessage] = messageUpdated;
        this.chatConfigInfo = chatConfig;
        this.sendMessage();
    }

    @track typingCounter = 0;

    changeInputValue(event) {
        try {
            event.preventDefault();
            if (event && event.key && (event.key == 'Control' || event.key == 'Alt')) {
                this.textareaHTML.value = '';
                this.resetTextareaSize();
            } else {
                let todayMessages = this.chatConfigInfo.messagesFilteredByDate[this.todayIndex].messages;
                let msg = this.parseObjectArray(todayMessages)[this.todayChatCounter + 1];
                if (msg.sender == 'Customer' && msg.text && !this.isTyping && this.textareaHTML.value == '') {
                    var text = msg.text.replaceAll('&nbsp;', '');
                    this.textareaHTML.value = text;
                    this.autoSizeTextarea();
                } else if (this.textareaHTML.value != '') {
                    this.sendMessage();
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    autoSizeTextarea() {
        const textarea = this.template.querySelector('[data-id="autoGrow"]');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
            const length = textarea.value.length;
            textarea.setSelectionRange(length, length);
        }
    }

    resetTextareaSize() {
        const textarea = this.template.querySelector('[data-id="autoGrow"]');
        if (textarea) {
            textarea.style.height = '28px';
        }
    }

    callSendMessage = () => {
        this.isSendingMessage = true;
        this.textareaHTML.value = '';
        this.resetTextareaSize();

        cpChatUtils.sendMessage(this.chatConfigInfo, this.todayChatCounter).then((result) => {
            let resultObject = this.parseObjectArray(result);
            let messagesUpdated = resultObject.chatConfig;
            let counter = resultObject.todayChatCounter;

            this.todayChatCounter = counter;

            messagesUpdated.messagesFilteredByDate = messagesUpdated.messagesFilteredByDate.map((element) => {
                if (element.day === "Today") {
                    const filteredMessages = element.messages.filter((msg, i, arr) => {
                        const nextMsg = arr[i + 1];
                        return !(msg.replaceByNextMessage && nextMsg && nextMsg.messageShown);
                    });

                    return {
                        ...element,
                        messages: filteredMessages
                    };
                }
                return element;
            });

            this.chatConfigInfo = messagesUpdated;
            this.isSendingMessage = false;

            messagesUpdated.messagesFilteredByDate.forEach((element) => {
                if (element.day == "Today" && element.messages[counter] && element.messages[counter].event) {
                    const eventName = element.messages[counter].event;
                    setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 600);
                }

                if (element.day == "Today" && element.messages[counter + 1]) {
                    if (element.messages[counter + 1].sendAutimatically || element.messages[counter + 1].sender == "Bot") {
                        const delay = element.messages[counter + 1].delay ?? 1000;
                        this.isTyping = true;
                        this.botIsThinking = true;
                        setTimeout(() => {
                            this.isTyping = false;
                            this.botIsThinking = false;
                            this.sendMessage();
                        }, delay);
                    }

                    if (element.messages[counter + 1].sender == "Customer") {
                        this.currentTyping = '';
                    }
                }
            });
        }).catch((error) => {
            console.error(error);
        });
    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }

    parseObjectArray(variable) {
        return JSON.parse(JSON.stringify(variable ?? []));
    }

    scrollChat(repeatCall = 0) {
        if (this) {
            var objDiv = this.template.querySelector('[data-id="chatContainer"]');
            if (objDiv) {
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        }
        if (repeatCall > 0) {
            setTimeout(() => {
                this.scrollChat(repeatCall - 1);
            }, 100);
        }
    }

    fixImage(url) {
        var res = url;
        if (url && url.startsWith("/sfsites/c/resource/")) {
            res = res.replace("/sfsites/c", window.location.pathname.replace('/s/', ''));
        } else if (url && url.startsWith("../resource/")) {
            res = res.replace("..", window.location.pathname.replace('/s/', ''));
        }
        return res;
    }

    getLiveTime(format24 = false, showAMPM = false) {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm;

        if (!format24) {
            ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12 || 12;
        }

        minutes = minutes < 10 ? '0' + minutes : minutes;

        var time = hours + ':' + minutes;
        if (!format24 && showAMPM) {
            time = time + ' ' + ampm;
        }

        return time;
    }

    handleCloseChat() {
        this.dispatchEvent(new CustomEvent('closechat'));
    }

    get startChatTimeText() {
        return `Today • ${this.getLiveTime(false, true)}`;
    }
}