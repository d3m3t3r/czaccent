const NAME = "czaccent";
const MENU_ITEM_ID = NAME + "-menu-item";

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: MENU_ITEM_ID,
    title: "Add Czech diacritics",
    contexts: ["selection"],
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ITEM_ID || !info.selectionText) {
    return;
  }

  const text = info.selectionText;

  try {
    console.debug(`sending request (text len=${text.length})`);

    /*
    const response = await fetch("https://nlp.fi.muni.cz/cz_accent/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text: text,
        usepre: 1, // Use <pre> for the response.
        dontsave: 1, // Request the endpoint not to save the text.
      }),
    });

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    console.debug("parsing response");

    const parser = new DOMParser();
    var newText = parser
      .parseFromString(await response.text(), "text/html")
      .getElementsByTagName("pre")[0].innerText;

    // Remove extra trailing space added in <pre>.
    newText = newText.substring(0, newText.length - 1);
    */

    const response = await fetch(
      "https://nlp.fi.muni.cz/languageservices/service.py?call=diacritics&lang=cs&output=json&text=" +
        encodeURIComponent(text),
    );

    const new_text = JSON.parse(await response.text()).text;

    console.debug(`response received (new text len=${new_text.length})`);

    // Note logging will happen in the context of the page, not of the add-on.
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (replacement, original, NAME) => {
        if (replacement === original) {
          console.debug(`${NAME}: no replacement needed`);
          return;
        }

        const selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
          // Note when the selection is collapsed it is not highlighted.
          console.debug(
            `${NAME}: replacing in normal selection (rangeCount=${selection.rangeCount})`,
          );

          // Allow replacement only in elements with "contenteditable=true" attribute.
          if (document.activeElement.contentEditable !== "true") {
            console.debug(`${NAME}: not replacing in non-editable element`);
            return;
          }

          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(replacement));
        } else {
          const e = document.activeElement;
          if (!["INPUT", "TEXTAREA"].includes(e.tagName)) {
            console.debug(`${NAME}: unsupported selection`);
            return;
          }

          // Note selectionStart and selectionEnd are always defined even if
          // no "real" selection was actually made in the element.
          console.debug(
            `${NAME}: replacing in ${e.tagName} from ${e.selectionStart} to ${e.selectionEnd}`,
          );

          e.value =
            e.value.substring(0, e.selectionStart) +
            replacement +
            e.value.substring(e.selectionEnd);
        }
      },
      args: [new_text, text, NAME],
    });
  } catch (ex) {
    console.error("exception caught:", ex);
  }
});
