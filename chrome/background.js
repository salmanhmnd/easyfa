/**
 * https://github.com/salmanhmnd/easyfa
 * Salman Hooshmand | https://twitter.com/yetatc
 * Nabi KAZ | https://twitter.com/NabiKAZ
 */

"use strict"

chrome.action.onClicked.addListener(function (tab) {
  convertFocusedText(tab)
})

chrome.commands.onCommand.addListener(function (command, tab) {
  if (command == "convert-current-text") convertFocusedText(tab)
})

class EasyFa {
  constructor(latestMap) {
    this.latestMap = latestMap
  }
  reloadCharMaps() {
    var parts = this.latestMap.split("_DEL_")
    var size = parts.length
    this.mapfarsi = []
    this.mapenglish = []
    this.maplength = size
    this.mapfarsi.length = size //allocate farsi
    this.mapenglish.length = size //allocate english
    var i = 0
    for (i = 0; i < size; i++) {
      this.mapfarsi[i] = parts[i].charAt(2)
      this.mapenglish[i] = parts[i].charAt(0)
      console.log("map created " + this.mapfarsi[i] + " to " + this.mapenglish[i])
    }
  }
  isFarsi(source) {
    var isfarsi = false
    var i = 0
    for (i = 0; i < this.maplength; i++)
      if (source.charAt(0) == this.mapfarsi[i]) {
        isfarsi = true
        break
      }
    return isfarsi
  }
  map(x, source, dest) {
    x = x.toLowerCase()
    var d = x
    var i = 0
    while (i < this.maplength && x != source[i]) {
      i++
    }
    if (i != this.maplength) d = dest[i]
    return d
  }
  transform(s, source, dest) {
    var temp = ""
    var i
    for (i = 0; i < s.length; i++) temp = temp + this.map(s.charAt(i), source, dest)
    return temp
  }
  convert(s) {
    var result = s
    if (this.isFarsi(s)) {
      result = this.transform(s, this.mapfarsi, this.mapenglish)
    } else {
      result = this.transform(s, this.mapenglish, this.mapfarsi)
    }
    return result
  }
}

function convert(source) {
  return reloadMap().then(function (latestMap) {
    let easyfa = new EasyFa(latestMap)
    easyfa.reloadCharMaps()
    return easyfa.convert(source)
  })
}

function convertFocusedText(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func : () => {
      return document.activeElement.value;
    },
  }, (activeElement) => {
      if (activeElement && activeElement[0] && activeElement[0].result) {
        let currentTypedValue = activeElement[0].result
        console.log("currentTypedValue:", currentTypedValue)
        convert(currentTypedValue).then(function (val) {
          console.log("converted:", val)
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (command) => {
              document.activeElement.value = command;
            },
            args: [val],
          });

        })
      } else {
        console.log("No active element on the page")
      }
  });
}

function reloadMap() {
  var defaultMap = "q ض_DEL_w ص_DEL_e ث_DEL_r ق_DEL_t ف_DEL_y غ_DEL_u ع_DEL_i ه_DEL_o خ_DEL_p ح_DEL_[ ج_DEL_] چ_DEL_a ش_DEL_s س_DEL_d ی_DEL_f ب_DEL_g ل_DEL_h ا_DEL_j ت_DEL_k ن_DEL_l م_DEL_; ک_DEL_' گ_DEL_\\ پ_DEL_z ظ_DEL_x ط_DEL_c ز_DEL_v ر_DEL_b ذ_DEL_n د_DEL_m ئ_DEL_, و_DEL_. ._DEL_/ /"
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get(["charMapStr"], function (charMap) {
      if (charMap.charMapStr) {
        resolve(charMap.charMapStr)
      } else {
        chrome.storage.sync.set({ charMapStr: defaultMap }, function () {})
        resolve(defaultMap)
      }
    })
  })
  return p
}
