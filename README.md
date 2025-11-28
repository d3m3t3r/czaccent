# CzAccent

Firefox add-on to add Czech diacritics to the selected text using
https://nlp.fi.muni.cz/languageservices/#diacritics API.

## TODO
* Czech [i18n](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization)

## Issues
* Replacing regular selections (not in <input/textarea>) removes all markup
  (e.g. if selection is "lo wo" in "<div>hello <b>world</b></div>").
* Unlike the service (https://nlp.fi.muni.cz/cz_accent/), the API does not seem
  to provide an option to request not to save the input text.
