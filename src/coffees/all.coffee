###
emojidex coffee plugin for jQuery/Zepto and compatible

=LICENSE=
When used with the emojidex service enabled this library is
  licensed under:
  * LGPL[https://www.gnu.org/licenses/lgpl.html].
When modified to not use the emojidex service this library is
  dual licensed under:
  * GPL v3[https://www.gnu.org/licenses/gpl.html]
  * AGPL v3[https://www.gnu.org/licenses/agpl.html]

The
Copyright 2013 Genshin Souzou Kabushiki Kaisha
###

do ($ = jQuery, window, document) ->
  pluginName = "emojidex"
  defaults =
    emojiarea:
      plaintext: "emojidex-plaintext"
      wysiwyg: "emojidex-wysiwyg"
      value_output: "emojidex-rawtext"

  $.fn[pluginName] = (options) ->
    @each ->
      if !$.data(@, "plugin_#{pluginName}")
        $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

  class Plugin
    constructor: (@element, options) ->
      # start main --------
      @options = $.extend {}, defaults, options
      @_defaults = defaults
      @_name = pluginName

      @setEmojiarea @options
      $.emojiarea.path = options.path_img
      
      @poe_emojis = new EmojisLoaderPOE @element, @options
      @poe_emojis.load (loaded)->
        # console.log loaded.emojis_data

      @api_emojis = new EmojisLoaderAPI

    getEmojiDataFromAPI: (callback) ->
      $.ajax
        url: "https://www.emojidex.com/api/v1/emoji"
        dataType: "jsonp"
        jsonpCallback: "callback"
        type: "get"
        success: (emojis_data) ->
          console.log "success: load jsonp"
          console.log emojis_data
          # callback emojis_data
          return
        error: (data) ->
          console.log "error: load jsonp"
          console.log data
          return

    setEmojiarea: (options) ->
      options.emojiarea["plaintext"].emojiarea wysiwyg: false
      # options.emojiarea["wysiwyg"].emojiarea wysiwyg: true
      options.emojiarea["wysiwyg"].on "change", ->
        options.emojiarea["value_output"].text $(this).val()
      options.emojiarea["wysiwyg"].trigger "change"

    prepareAutoComplete: (emojis_data, options) ->
      emojis = []
      for category of emojis_data
        for emoji in emojis_data[category]
          emojis.push emoji.code
      emojis = $.map emojis, (value) ->
        key: value
        name: value

      emoji_config =
        at: ":"
        data: emojis
        tpl: "<li data-value=':${key}:'><img src='../src/assets/img/utf/${name}.svg'  height='20' width='20' /> ${name}</li>"
        insert_tpl: "<img src='../src/assets/img/utf/${name}.svg' height='20' width='20' />"
      options.emojiarea["plaintext"].atwho(emoji_config)
      options.emojiarea["wysiwyg"].atwho(emoji_config)

class EmojisLoader
  emojis_data: null
  element: null
  options: null

class EmojisLoaderAPI extends EmojisLoader
  constructor: (@json_url) ->
    super
    console.log "EmojisLoaderAPI --- start ---"

class EmojisLoaderPOE extends EmojisLoader
  constructor: (@element, @options) ->
    super

  load: (callback) ->
    onLoadEmojisData = (emojis_data) =>
      @emojis_data = @getCategorizedData emojis_data
      @emoji_regexps = @setEmojiCSS_getEmojiRegexps @emojis_data
      @setEmojiIcon @emojis_data
      callback @
      # Plugin::prepareAutoComplete emojis_data, options
      
    # start main --------
    $.getJSON @options.path_json, onLoadEmojisData
    @

  getCategorizedData: (emojis_data) ->
    new_emojis_data = {}
    for emoji in emojis_data
      unless new_emojis_data[emoji.category]? 
        new_emojis_data[emoji.category] = [emoji]
      else
        new_emojis_data[emoji.category].push emoji
    return new_emojis_data

  setEmojiCSS_getEmojiRegexps: (emojis_data) ->
    regexp_for_utf = ""
    regexp_for_code = ":("

    emojis_css = $('<style type="text/css" />')
    for category of emojis_data
      emojis_in_category = emojis_data[category]
      for emoji in emojis_in_category
        regexp_for_utf += emoji.moji + "|"
        regexp_for_code += emoji.code + "|"
        emojis_css.append "i.emojidex-" + emoji.moji + " {background-image: url('" + $.emojiarea.path + emoji.code + ".svg')}"
    $("head").append emojis_css
    
    return [regexp_for_utf.slice(0, -1), regexp_for_code.slice(0, -1) + "):"]

  setEmojiIcon: (emojis_data) ->
    getEmojiTag = (emoji_utf) ->
      return '<i class="emojidex-' + emoji_utf + '"></i>'
    
    replaceForUTF = (replaced_string) =>
      replaced_string = replaced_string.replace new RegExp(@emoji_regexps[0], "g"), (matched_string) ->
        return getEmojiTag matched_string
    
    replaceForCode = (replaced_string, emojis_data) =>
      replaced_string = replaced_string.replace new RegExp(@emoji_regexps[1], "g"), (matched_string) ->
        matched_string = matched_string.replace /:/g, ""
        for category of emojis_data
          for emoji in emojis_data[category]
            if emoji.code is matched_string
              return getEmojiTag emoji.moji

    # start main --------
    $(@element).find(":not(iframe,textarea,script)").andSelf().contents().filter(->
      @nodeType is Node.TEXT_NODE
    ).each ->
      replaced_string = @textContent
      replaced_string = replaceForUTF replaced_string
      replaced_string = replaceForCode replaced_string, emojis_data
      $(@).replaceWith replaced_string

###
emojiarea.poe
@author Yusuke Matsui

emojiarea - A rich textarea control that supports emojis, WYSIWYG-style.
Copyright (c) 2012 DIY Co

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
file except in compliance with the License. You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.

@author Brian Reavis <brian@diy.org>
###
(($, window, document) ->
  ELEMENT_NODE = 1
  TEXT_NODE = 3
  TAGS_BLOCK = [
    "p"
    "div"
    "pre"
    "form"
  ]
  KEY_ESC = 27
  KEY_TAB = 9
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  $.emojiarea =
    path: ""
    icons: {}
    defaults:
      button: null
      buttonLabel: "Emojis"
      buttonPosition: "after"

  $.fn.emojiarea = (options) ->
    options = $.extend({}, $.emojiarea.defaults, options)
    @each ->
      $textarea = $(this)
      if "contentEditable" of document.body and options.wysiwyg isnt false
        new EmojiArea_WYSIWYG($textarea, options)
      else
        new EmojiArea_Plain($textarea, options)
      return


  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  util = {}
  util.restoreSelection = (->
    if window.getSelection
      (savedSelection) ->
        sel = window.getSelection()
        sel.removeAllRanges()
        i = 0
        len = savedSelection.length

        while i < len
          sel.addRange savedSelection[i]
          ++i
        return
    else if document.selection and document.selection.createRange
      (savedSelection) ->
        savedSelection.select()  if savedSelection
        return
  )()
  util.saveSelection = (->
    if window.getSelection
      ->
        sel = window.getSelection()
        ranges = []
        if sel.rangeCount
          i = 0
          len = sel.rangeCount

          while i < len
            ranges.push sel.getRangeAt(i)
            ++i
        ranges
    else if document.selection and document.selection.createRange
      ->
        sel = document.selection
        (if (sel.type.toLowerCase() isnt "none") then sel.createRange() else null)
  )()
  util.replaceSelection = (->
    if window.getSelection
      (content) ->
        range = undefined
        sel = window.getSelection()
        node = (if typeof content is "string" then document.createTextNode(content) else content)
        if sel.getRangeAt and sel.rangeCount
          range = sel.getRangeAt(0)
          range.deleteContents()
          range.insertNode document.createTextNode(" ")
          range.insertNode node
          range.setStart node, 0
          window.setTimeout (->
            range = document.createRange()
            range.setStartAfter node
            range.collapse true
            sel.removeAllRanges()
            sel.addRange range
            return
          ), 0
        return
    else if document.selection and document.selection.createRange
      (content) ->
        range = document.selection.createRange()
        if typeof content is "string"
          range.text = content
        else
          range.pasteHTML content.outerHTML
        return
  )()
  util.insertAtCursor = (text, el) ->
    text = " " + text
    val = el.value
    endIndex = undefined
    startIndex = undefined
    range = undefined
    if typeof el.selectionStart isnt "undefined" and typeof el.selectionEnd isnt "undefined"
      startIndex = el.selectionStart
      endIndex = el.selectionEnd
      el.value = val.substring(0, startIndex) + text + val.substring(el.selectionEnd)
      el.selectionStart = el.selectionEnd = startIndex + text.length
    else if typeof document.selection isnt "undefined" and typeof document.selection.createRange isnt "undefined"
      el.focus()
      range = document.selection.createRange()
      range.text = text
      range.select()
    return

  util.extend = (a, b) ->
    a = {}  if typeof a is "undefined" or not a
    if typeof b is "object"
      for key of b
        a[key] = b[key]  if b.hasOwnProperty(key)
    a

  util.escapeRegex = (str) ->
    (str + "").replace /([.?*+^$[\]\\(){}|-])/g, "\\$1"

  util.htmlEntities = (str) ->
    String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace /"/g, "&quot;"

  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  EmojiArea = ->

  EmojiArea::setup = ->
    self = this
    @$editor.on "focus", ->
      self.hasFocus = true
      return

    @$editor.on "blur", ->
      self.hasFocus = false
      return

    @setupButton()
    return

  EmojiArea::setupButton = ->
    self = this
    $button = undefined
    if @options.button
      $button = $(@options.button)
    else if @options.button isnt false
      $button = $("<a href=\"javascript:void(0)\">")
      $button.html @options.buttonLabel
      $button.addClass "emoji-button"
      $button.attr title: @options.buttonLabel
      @$editor[@options.buttonPosition] $button
    else
      $button = $("")
    $button.on "click", (e) ->
      EmojiMenu.show self
      e.stopPropagation()
      return

    @$button = $button
    return

  EmojiArea.createIcon = (emoji) ->
    filename = emoji + ".svg"
    path = $.emojiarea.path or ""
    path += "/"  if path.length and path.charAt(path.length - 1) isnt "/"
    "<img src=\"" + path + filename + "\" alt=\"" + util.htmlEntities(emoji) + "\">"

  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Editor (plain-text)
  
  @constructor
  @param {object} $textarea
  @param {object} options
  ###
  EmojiArea_Plain = ($textarea, options) ->
    @options = options
    @$textarea = $textarea
    @$editor = $textarea
    @setup()
    return

  EmojiArea_Plain::insert = (emoji) ->
    for category of $.emojiarea.icons
      i = 0

      while i < $.emojiarea.icons[category]
        return  unless $.emojiarea.icons[category][i].hasOwnProperty(emoji)
        i++
    emoji = ":" + emoji + ":"
    util.insertAtCursor emoji, @$textarea[0]
    @$textarea.trigger "change"
    return

  EmojiArea_Plain::val = ->
    @$textarea.val()

  util.extend EmojiArea_Plain::, EmojiArea::
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Editor (rich)
  
  @constructor
  @param {object} $textarea
  @param {object} options
  ###
  EmojiArea_WYSIWYG = ($textarea, options) ->
    self = this
    @options = options
    @$textarea = $textarea
    @$editor = $("<div>").addClass("emoji-wysiwyg-editor")
    @$editor.text $textarea.val()
    @$editor.attr contenteditable: "true"
    @$editor.on "blur keyup paste", ->
      self.onChange.apply self, arguments_

    @$editor.on "mousedown focus", ->
      document.execCommand "enableObjectResizing", false, false
      return

    @$editor.on "blur", ->
      document.execCommand "enableObjectResizing", true, true
      return

    html = @$editor.text()
    emojis = $.emojiarea.icons
    for key of emojis
      html = html.replace(new RegExp(util.escapeRegex(key), "g"), EmojiArea.createIcon(key))  if emojis.hasOwnProperty(key)
    @$editor.html html
    $textarea.hide().after @$editor
    @setup()
    @$button.on "mousedown", ->
      self.selection = util.saveSelection()  if self.hasFocus
      return

    return

  EmojiArea_WYSIWYG::onChange = ->
    @$textarea.val(@val()).trigger "change"
    return

  EmojiArea_WYSIWYG::insert = (emoji) ->
    content = undefined
    $img = $(EmojiArea.createIcon(emoji))
    $img[0].alt = ":" + $img[0].alt + ":"
    if $img[0].attachEvent
      $img[0].attachEvent "onresizestart", ((e) ->
        e.returnValue = false
        return
      ), false
    @$editor.trigger "focus"
    util.restoreSelection @selection  if @selection
    try
      util.replaceSelection $img[0]
    @onChange()
    return

  EmojiArea_WYSIWYG::val = ->
    lines = []
    line = []
    flush = ->
      lines.push line.join("")
      line = []
      return

    sanitizeNode = (node) ->
      if node.nodeType is TEXT_NODE
        line.push node.nodeValue
      else if node.nodeType is ELEMENT_NODE
        tagName = node.tagName.toLowerCase()
        isBlock = TAGS_BLOCK.indexOf(tagName) isnt -1
        flush()  if isBlock and line.length
        if tagName is "img"
          alt = node.getAttribute("alt") or ""
          line.push alt  if alt
          return
        else flush()  if tagName is "br"
        children = node.childNodes
        i = 0

        while i < children.length
          sanitizeNode children[i]
          i++
        flush()  if isBlock and line.length
      return

    children = @$editor[0].childNodes
    i = 0

    while i < children.length
      sanitizeNode children[i]
      i++
    flush()  if line.length
    lines.join "\n"

  util.extend EmojiArea_WYSIWYG::, EmojiArea::
  
  # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  ###
  Emoji Dropdown Menu
  
  @constructor
  @param {object} emojiarea
  ###
  EmojiMenu = ->
    self = this
    $body = $(document.body)
    $window = $(window)
    @visible = false
    @emojiarea = null
    @$menu = $("<div>")
    @$menu.addClass "emoji-menu"
    @$menu.hide()
    @$items = $("<div>").appendTo(@$menu)
    $body.append @$menu
    $body.on "keydown", (e) ->
      self.hide()  if e.keyCode is KEY_ESC or e.keyCode is KEY_TAB
      return

    $body.on "mouseup", ->
      self.hide()
      return

    $window.on "resize", ->
      self.reposition()  if self.visible
      return

    @$menu.on "mouseup", "a", (e) ->
      e.stopPropagation()
      false

    @$menu.on "click", "a", (e) ->
      emoji = $(".label", $(this)).text()
      unless emoji
        return window.setTimeout(->
          self.onItemSelected.apply self, [emoji]
          return
        , 0)
      e.stopPropagation()
      false

    @load()
    return

  EmojiMenu::onItemSelected = (emoji) ->
    @emojiarea.insert emoji
    @hide()
    return

  EmojiMenu::load = ->
    setImage = (category) ->
      html = ""
      i = 0

      while i < $.emojiarea.icons[category].length
        html += "<a href=\"javascript:void(0)\" title=\"" + options[category][i].code + "\">" + EmojiArea.createIcon(options[category][i].code) + "<span class=\"label\">" + util.htmlEntities(options[category][i].code) + "</span></a>"
        i++
      html
    html = []
    options = $.emojiarea.icons
    path = $.emojiarea.path
    path += "/"  if path.length and path.charAt(path.length - 1) isnt "/"
    html.push "<ul class=\"nav nav-tabs\"><li class=\"dropdown active emoji-category\"><a class=\"dropdown-toggle emoji-toggle\" data-toggle=\"dropdown\" href=\"#category\">category<span class=\"caret\"></span></a><ul class=\"dropdown-menu emoji-category-menu\" role=\"menu\">"
    flag = true
    for category of $.emojiarea.icons
      if flag
        html.push "<li class=\"active\"><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>"
        flag = false
      else
        html.push "<li><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>"
    html.push "</ul></li></ul><div class=\"tab-content emoji-content\">"
    flag = true
    for category of $.emojiarea.icons
      if flag
        html.push "<div class=\"tab-pane fade active in\" id=\"" + category + "\">" + setImage(category) + "</div>"
        flag = false
      else
        html.push "<div class=\"tab-pane fade\" id=\"" + category + "\">" + setImage(category) + "</div>"
    html.push "</div>"
    @$items.html html.join("")
    return

  EmojiMenu::reposition = ->
    $button = @emojiarea.$button
    offset = $button.offset()
    offset.top += $button.outerHeight()
    offset.left += Math.round($button.outerWidth() / 2)
    @$menu.css
      top: offset.top
      left: offset.left

    return

  EmojiMenu::hide = (callback) ->
    if @emojiarea
      @emojiarea.menu = null
      @emojiarea.$button.removeClass "on"
      @emojiarea = null
    @visible = false
    @$menu.hide()
    return

  EmojiMenu::show = (emojiarea) ->
    return  if @emojiarea and @emojiarea is emojiarea
    @emojiarea = emojiarea
    @emojiarea.menu = this
    @reposition()
    @$menu.show()
    @visible = true
    return

  EmojiMenu.show = (->
    menu = null
    (emojiarea) ->
      menu = menu or new EmojiMenu()
      menu.show emojiarea
      return
  )()
  return
) jQuery, window, document