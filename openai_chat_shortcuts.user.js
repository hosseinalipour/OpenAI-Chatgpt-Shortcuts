// ==UserScript==
// @name         OpenAI Chat Shortcuts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Provides keyboard shortcuts for specific buttons on chat.openai.com.
// @author       You
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
    const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
    return vertInView && horInView;
  }

  function* treeWalkerToIterator(walker) {
    let node;
    while ((node = walker.nextNode())) {
      yield node;
    }
  }

  function findSaveAndSubmitElements() {
    let walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function (node) {
          if (
            node.tagName === "BUTTON" &&
            node.textContent.trim() === "Save & Submit"
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      },
      false
    );

    return Array.from(treeWalkerToIterator(walker));
  }

  function findSVGButtons() {
    let walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function (node) {
          if (node.tagName === "BUTTON") {
            let paths = node.querySelectorAll("svg > path");
            if (
              paths.length === 2 &&
              paths[0].getAttribute("d") ===
                "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" &&
              paths[1].getAttribute("d") ===
                "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        },
      },
      false
    );

    return Array.from(treeWalkerToIterator(walker));
  }

  function findPromptTextArea() {
    return [document.getElementById("prompt-textarea")];
  }

  function findNonPromptTextArea() {
    return Array.from(document.getElementsByTagName("textarea")).filter(
      (textarea) => textarea.id !== "prompt-textarea"
    );
  }

  const milliseconds = async (wait) => new Promise((r) => setTimeout(r, wait));

  document.addEventListener("keydown", async function (event) {
    switch (event.key) {
      case "Enter":
        event.ctrlKey &&
          event.shiftKey &&
          findSaveAndSubmitElements()
            .filter(isElementVisible)
            .forEach((i) => i.click());
        break;
      case "e":
        event.ctrlKey &&
          event.altKey &&
          findSVGButtons()
            .filter(isElementVisible)
            .forEach((i) => i.click());

        await milliseconds(10);

        const textAreas = findNonPromptTextArea();
        textAreas.forEach((i) => i.focus());

        break;
      case "f":
        event.ctrlKey &&
          event.altKey &&
          findPromptTextArea()
            .filter(isElementVisible)
            .forEach((i) => i.focus());
        break;
    }
  });
})();
