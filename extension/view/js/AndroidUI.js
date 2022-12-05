/* eslint-disable no-unused-vars */
/* global browser, DOMPurify, AndroidUI */

class AndroidUI {

    constructor(source) {
        this.onTranslationRequest = {};
        this.onTranslationRequest.addListener = this._onTranslationRequest;
    }

    async show(tabId, srcLang, dstLang) {
        let pageFragment = null;

        // first we load the pageFragment (UI)
        const response = await fetch(browser
            .runtime.getURL("view/static/androidUI.html"), { mode: "no-cors" });
          if (response.ok) {
            pageFragment = await response.text();
          } else {
            pageFragment = "Error loading outbound translation code fragment";
          }

        // then we create the div that holds it
        this.uiDiv = document.createElement("div");
        this.uiDiv.className = "fxtranslations-ot";
        this.uiDiv.innerHTML = pageFragment;
        this.uiDiv.id = "fxtranslations-ot";
        document.body.appendChild(this.uiDiv);
        this.uiDiv.querySelector("#translateBtn").addEventListener("click", this.translate.bind(this));
        this.uiDiv.querySelector("#srcLang").value = srcLang;
        this.uiDiv.querySelector("#dstLang").value = dstLang;
        this.uiDiv.querySelector(".logo").src = browser.runtime.getURL("/view/icons/translation-color.svg")
        // it's safe to hardcode the widget to have the highest possible zindex in the page
        this.uiDiv.style.zIndex = 2147483647;
        this.uiElement = document.getElementById("OTapp");
        this.tabId = tabId;
    }

    updateProgress(msg){
        if (this.uiDiv) this.uiDiv.querySelector(".fxtranslations-header").innerHTML = DOMPurify.sanitize(msg, { USE_PROFILES: { html: true } });
    }

    getLocalizedLanguageName(lng){
        return lng;
    }

    isMochitest() {
        return false;
    }

    _onTranslationRequest(...params) {
        return true;
    }

    translate(){
        this.uiDiv.querySelector("#translateBtn").disabled = true;
        this.uiDiv.querySelector("#srcLang").disabled = true;
        this.uiDiv.querySelector("#dstLang").disabled = true;
        const message = {
            command: "translationRequested",
            from: this.uiDiv.querySelector("#srcLang").value,
            to: this.uiDiv.querySelector("#dstLang").value,
            withOutboundTranslation: false,
            withQualityEstimation: false,
            tabId: this.tabId
        };
        browser.runtime.sendMessage(message);
    }
}