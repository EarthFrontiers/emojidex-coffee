/*
 *  jQuery Emojidex - v0.1.0
 *  emojidex coffee plugin for jQuery/Zepto and compatible
 *  https://github.com/Genshin/emojidex-coffee#emojidex-coffee
 *
 *  Made by Genshin
 *  Under LGPL License
 */
/*
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
*/


(function() {
  var EmojisData, EmojisLoader, EmojisLoaderAPI, EmojisLoaderPOE, EmojisPallet,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "emojidex";
    defaults = {
      path_json: null,
      path_img: "img/utf",
      emojiarea: {
        plaintext: "emojidex-plaintext",
        wysiwyg: "emojidex-wysiwyg",
        rawtext: "emojidex-rawtext"
      }
    };
    $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
    return Plugin = (function() {
      function Plugin(element, options) {
        var _this = this;
        this.element = element;
        this.emojis_data_array = [];
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.poe_emojis = new EmojisLoaderPOE(this.element, this.options);
        this.poe_emojis.load(function() {
          _this.emojis_data_array.push(_this.poe_emojis.emojis_data);
          return _this.checkLoadedEmojisData();
        });
      }

      Plugin.prototype.checkLoadedEmojisData = function() {
        if (this.emojis_data_array.length === 1) {
          this.setAutoComplete(this.options);
          this.emojis_pallet = new EmojisPallet(this.emojis_data_array, $("#ep"), this.options);
          return this.emojis_pallet.setPallet();
        }
      };

      Plugin.prototype.setAutoComplete = function(options) {
        var at_config, category, emoji, emojis, emojis_data, _i, _j, _len, _len1, _ref, _ref1;
        emojis = [];
        _ref = this.emojis_data_array;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          emojis_data = _ref[_i];
          for (category in emojis_data) {
            _ref1 = emojis_data[category];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              emoji = _ref1[_j];
              emojis.push({
                key: emoji.code,
                name: emoji.code,
                img_url: emoji.img_url
              });
            }
          }
        }
        at_config = {
          at: ":",
          data: emojis,
          tpl: "<li data-value=':${key}:'><img src='${img_url}' height='20' width='20' /> ${name}</li>",
          insert_tpl: "<img src='${img_url}' height='20' width='20' />"
        };
        options.emojiarea["plaintext"].atwho(at_config);
        options.emojiarea["wysiwyg"].atwho(at_config);
        return cke.atwho(at_config);
      };

      Plugin.prototype.setEmojiarea = function(options) {
        options.emojiarea["plaintext"].emojiarea({
          wysiwyg: false
        });
        options.emojiarea["wysiwyg"].on("change", function() {
          console.dir(this);
          return options.emojiarea["rawtext"].text($(this).val());
        });
        return options.emojiarea["wysiwyg"].trigger("change");
      };

      return Plugin;

    })();
  })(jQuery, window, document);

  EmojisLoader = (function() {
    function EmojisLoader() {}

    EmojisLoader.prototype.emojis_data = null;

    EmojisLoader.prototype.element = null;

    EmojisLoader.prototype.options = null;

    EmojisLoader.prototype.emoji_regexps = null;

    EmojisLoader.prototype.getCategorizedData = function(emojis_data) {
      var emoji, new_emojis_data, _i, _len;
      new_emojis_data = {};
      for (_i = 0, _len = emojis_data.length; _i < _len; _i++) {
        emoji = emojis_data[_i];
        if (emoji.category === null) {
          if (new_emojis_data.uncategorized == null) {
            new_emojis_data.uncategorized = [emoji];
          } else {
            new_emojis_data.uncategorized.push(emoji);
          }
        } else {
          if (new_emojis_data[emoji.category] == null) {
            new_emojis_data[emoji.category] = [emoji];
          } else {
            new_emojis_data[emoji.category].push(emoji);
          }
        }
      }
      return new_emojis_data;
    };

    EmojisLoader.prototype.setEmojiCSS_getEmojiRegexps = function(emojis_data) {
      var category, emoji, emojis_css, emojis_in_category, regexp_for_code, regexp_for_utf, _i, _len;
      regexp_for_utf = "";
      regexp_for_code = ":(";
      emojis_css = $('<style type="text/css" />');
      for (category in emojis_data) {
        emojis_in_category = emojis_data[category];
        for (_i = 0, _len = emojis_in_category.length; _i < _len; _i++) {
          emoji = emojis_in_category[_i];
          regexp_for_utf += emoji.moji + "|";
          regexp_for_code += emoji.code + "|";
          emojis_css.append("i.emojidex-" + emoji.code + " {background-image: url('" + emoji.img_url + "')}");
        }
      }
      $("head").append(emojis_css);
      return {
        utf: regexp_for_utf.slice(0, -1),
        code: regexp_for_code.slice(0, -1) + "):"
      };
    };

    EmojisLoader.prototype.getEmojiTag = function(emoji_code) {
      return '<i class="emojidex-' + emoji_code + '"></i>';
    };

    EmojisLoader.prototype.replaceForUTF = function(options) {
      var replaced_string;
      return replaced_string = options.s_replace.replace(new RegExp(options.regexp, "g"), function(matched_string) {
        var category, emoji, _i, _len, _ref;
        for (category in options.emojis_data) {
          _ref = options.emojis_data[category];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            emoji = _ref[_i];
            if (emoji.moji === matched_string) {
              return EmojisLoader.prototype.getEmojiTag(emoji.code);
            }
          }
        }
      });
    };

    EmojisLoader.prototype.replaceForCode = function(options) {
      var replaced_string;
      return replaced_string = options.s_replace.replace(new RegExp(options.regexp, "g"), function(matched_string) {
        var category, emoji, _i, _len, _ref;
        matched_string = matched_string.replace(/:/g, "");
        for (category in options.emojis_data) {
          _ref = options.emojis_data[category];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            emoji = _ref[_i];
            if (emoji.code === matched_string) {
              return EmojisLoader.prototype.getEmojiTag(emoji.code);
            }
          }
        }
      });
    };

    EmojisLoader.prototype.setEmojiIcon = function(loader) {
      return $(this.element).find(":not(iframe,textarea,script)").andSelf().contents().filter(function() {
        return this.nodeType === Node.TEXT_NODE;
      }).each(function() {
        var replaced_string;
        replaced_string = this.textContent;
        if (loader.emoji_regexps.utf != null) {
          replaced_string = EmojisLoader.prototype.replaceForUTF({
            s_replace: replaced_string,
            regexp: loader.emoji_regexps.utf,
            emojis_data: loader.emojis_data
          });
        }
        if (loader.emoji_regexps.code != null) {
          replaced_string = EmojisLoader.prototype.replaceForCode({
            s_replace: replaced_string,
            regexp: loader.emoji_regexps.code,
            emojis_data: loader.emojis_data
          });
        }
        return $(this).replaceWith(replaced_string);
      });
    };

    return EmojisLoader;

  })();

  EmojisLoaderAPI = (function(_super) {
    __extends(EmojisLoaderAPI, _super);

    function EmojisLoaderAPI(element, options) {
      this.element = element;
      this.options = options;
      EmojisLoaderAPI.__super__.constructor.apply(this, arguments);
    }

    EmojisLoaderAPI.prototype.load = function(callback) {
      var onLoadEmojisData,
        _this = this;
      onLoadEmojisData = function(emojis_data) {
        var emoji, _i, _len;
        for (_i = 0, _len = emojis_data.length; _i < _len; _i++) {
          emoji = emojis_data[_i];
          emoji.img_url = "http://assets.emojidex.com/emoji/" + emoji.code + "/px32.png";
        }
        _this.emojis_data = _this.getCategorizedData(emojis_data);
        _this.emoji_regexps = _this.setEmojiCSS_getEmojiRegexps(_this.emojis_data);
        _this.setEmojiIcon(_this);
        return callback(_this);
      };
      this.getEmojiDataFromAPI(onLoadEmojisData);
      return this;
    };

    EmojisLoaderAPI.prototype.getEmojiDataFromAPI = function(callback) {
      return $.ajax({
        url: "https://www.emojidex.com/api/v1/emoji",
        dataType: "jsonp",
        jsonpCallback: "callback",
        type: "get",
        success: function(emojis_data) {
          callback(emojis_data.emoji);
        },
        error: function(emojis_data) {}
      });
    };

    return EmojisLoaderAPI;

  })(EmojisLoader);

  EmojisLoaderPOE = (function(_super) {
    __extends(EmojisLoaderPOE, _super);

    function EmojisLoaderPOE(element, options) {
      this.element = element;
      this.options = options;
      EmojisLoaderPOE.__super__.constructor.apply(this, arguments);
    }

    EmojisLoaderPOE.prototype.load = function(callback) {
      var onLoadEmojisData,
        _this = this;
      onLoadEmojisData = function(emojis_data) {
        var emoji, _i, _len;
        for (_i = 0, _len = emojis_data.length; _i < _len; _i++) {
          emoji = emojis_data[_i];
          emoji.img_url = _this.options.path_img + "/" + emoji.code + ".svg";
        }
        _this.emojis_data = _this.getCategorizedData(emojis_data);
        _this.emoji_regexps = _this.setEmojiCSS_getEmojiRegexps(_this.emojis_data);
        _this.setEmojiIcon(_this);
        return callback(_this);
      };
      if (this.options.path_json) {
        $.getJSON(this.options.path_json, onLoadEmojisData);
        return this;
      } else {
        onLoadEmojisData(new EmojisData().parsed_json);
        return this;
      }
    };

    return EmojisLoaderPOE;

  })(EmojisLoader);

  EmojisPallet = (function() {
    function EmojisPallet(emojis_data_array, element, options) {
      this.emojis_data_array = emojis_data_array;
      this.element = element;
      this.options = options;
      this.KEY_ESC = 27;
      this.KEY_TAB = 9;
    }

    EmojisPallet.prototype.setPallet = function() {};

    return EmojisPallet;

  })();

  /*
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
  */


  (function($, window, document) {
    var ELEMENT_NODE, EmojiArea, EmojiArea_Plain, EmojiArea_WYSIWYG, EmojiMenu, KEY_ESC, KEY_TAB, TAGS_BLOCK, TEXT_NODE, util;
    ELEMENT_NODE = 1;
    TEXT_NODE = 3;
    TAGS_BLOCK = ["p", "div", "pre", "form"];
    KEY_ESC = 27;
    KEY_TAB = 9;
    $.emojiarea = {
      path: "",
      icons: {},
      defaults: {
        button: null,
        buttonLabel: "Emojis",
        buttonPosition: "after"
      }
    };
    $.fn.emojiarea = function(options) {
      options = $.extend({}, $.emojiarea.defaults, options);
      return this.each(function() {
        var $textarea;
        $textarea = $(this);
        if ("contentEditable" in document.body && options.wysiwyg !== false) {
          new EmojiArea_WYSIWYG($textarea, options);
        } else {
          new EmojiArea_Plain($textarea, options);
        }
      });
    };
    util = {};
    util.restoreSelection = (function() {
      if (window.getSelection) {
        return function(savedSelection) {
          var i, len, sel;
          sel = window.getSelection();
          sel.removeAllRanges();
          i = 0;
          len = savedSelection.length;
          while (i < len) {
            sel.addRange(savedSelection[i]);
            ++i;
          }
        };
      } else if (document.selection && document.selection.createRange) {
        return function(savedSelection) {
          if (savedSelection) {
            savedSelection.select();
          }
        };
      }
    })();
    util.saveSelection = (function() {
      if (window.getSelection) {
        return function() {
          var i, len, ranges, sel;
          sel = window.getSelection();
          ranges = [];
          if (sel.rangeCount) {
            i = 0;
            len = sel.rangeCount;
            while (i < len) {
              ranges.push(sel.getRangeAt(i));
              ++i;
            }
          }
          return ranges;
        };
      } else if (document.selection && document.selection.createRange) {
        return function() {
          var sel;
          sel = document.selection;
          if (sel.type.toLowerCase() !== "none") {
            return sel.createRange();
          } else {
            return null;
          }
        };
      }
    })();
    util.replaceSelection = (function() {
      if (window.getSelection) {
        return function(content) {
          var node, range, sel;
          range = void 0;
          sel = window.getSelection();
          node = (typeof content === "string" ? document.createTextNode(content) : content);
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(" "));
            range.insertNode(node);
            range.setStart(node, 0);
            window.setTimeout((function() {
              range = document.createRange();
              range.setStartAfter(node);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }), 0);
          }
        };
      } else if (document.selection && document.selection.createRange) {
        return function(content) {
          var range;
          range = document.selection.createRange();
          if (typeof content === "string") {
            range.text = content;
          } else {
            range.pasteHTML(content.outerHTML);
          }
        };
      }
    })();
    util.insertAtCursor = function(text, el) {
      var endIndex, range, startIndex, val;
      text = " " + text;
      val = el.value;
      endIndex = void 0;
      startIndex = void 0;
      range = void 0;
      if (typeof el.selectionStart !== "undefined" && typeof el.selectionEnd !== "undefined") {
        startIndex = el.selectionStart;
        endIndex = el.selectionEnd;
        el.value = val.substring(0, startIndex) + text + val.substring(el.selectionEnd);
        el.selectionStart = el.selectionEnd = startIndex + text.length;
      } else if (typeof document.selection !== "undefined" && typeof document.selection.createRange !== "undefined") {
        el.focus();
        range = document.selection.createRange();
        range.text = text;
        range.select();
      }
    };
    util.extend = function(a, b) {
      var key;
      if (typeof a === "undefined" || !a) {
        a = {};
      }
      if (typeof b === "object") {
        for (key in b) {
          if (b.hasOwnProperty(key)) {
            a[key] = b[key];
          }
        }
      }
      return a;
    };
    util.escapeRegex = function(str) {
      return (str + "").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };
    util.htmlEntities = function(str) {
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };
    EmojiArea = function() {};
    EmojiArea.prototype.setup = function() {
      var self;
      self = this;
      this.$editor.on("focus", function() {
        self.hasFocus = true;
      });
      this.$editor.on("blur", function() {
        self.hasFocus = false;
      });
      this.setupButton();
    };
    EmojiArea.prototype.setupButton = function() {
      var $button, self;
      self = this;
      $button = void 0;
      if (this.options.button) {
        $button = $(this.options.button);
      } else if (this.options.button !== false) {
        $button = $("<a href=\"javascript:void(0)\">");
        $button.html(this.options.buttonLabel);
        $button.addClass("emoji-button");
        $button.attr({
          title: this.options.buttonLabel
        });
        this.$editor[this.options.buttonPosition]($button);
      } else {
        $button = $("");
      }
      $button.on("click", function(e) {
        EmojiMenu.show(self);
        e.stopPropagation();
      });
      this.$button = $button;
    };
    EmojiArea.createIcon = function(emoji) {
      var filename, path;
      filename = emoji + ".svg";
      path = $.emojiarea.path || "";
      if (path.length && path.charAt(path.length - 1) !== "/") {
        path += "/";
      }
      return "<img src=\"" + path + filename + "\" alt=\"" + util.htmlEntities(emoji) + "\">";
    };
    /*
    Editor (plain-text)
    
    @constructor
    @param {object} $textarea
    @param {object} options
    */

    EmojiArea_Plain = function($textarea, options) {
      this.options = options;
      this.$textarea = $textarea;
      this.$editor = $textarea;
      this.setup();
    };
    EmojiArea_Plain.prototype.insert = function(emoji) {
      var category, i;
      for (category in $.emojiarea.icons) {
        i = 0;
        while (i < $.emojiarea.icons[category]) {
          if (!$.emojiarea.icons[category][i].hasOwnProperty(emoji)) {
            return;
          }
          i++;
        }
      }
      emoji = ":" + emoji + ":";
      util.insertAtCursor(emoji, this.$textarea[0]);
      this.$textarea.trigger("change");
    };
    EmojiArea_Plain.prototype.val = function() {
      return this.$textarea.val();
    };
    util.extend(EmojiArea_Plain.prototype, EmojiArea.prototype);
    /*
    Editor (rich)
    
    @constructor
    @param {object} $textarea
    @param {object} options
    */

    EmojiArea_WYSIWYG = function($textarea, options) {
      var emojis, html, key, self;
      self = this;
      this.options = options;
      this.$textarea = $textarea;
      this.$editor = $("<div>").addClass("emoji-wysiwyg-editor");
      this.$editor.text($textarea.val());
      this.$editor.attr({
        contenteditable: "true"
      });
      this.$editor.on("blur keyup paste", function() {
        return self.onChange.apply(self, arguments_);
      });
      this.$editor.on("mousedown focus", function() {
        document.execCommand("enableObjectResizing", false, false);
      });
      this.$editor.on("blur", function() {
        document.execCommand("enableObjectResizing", true, true);
      });
      html = this.$editor.text();
      emojis = $.emojiarea.icons;
      for (key in emojis) {
        if (emojis.hasOwnProperty(key)) {
          html = html.replace(new RegExp(util.escapeRegex(key), "g"), EmojiArea.createIcon(key));
        }
      }
      this.$editor.html(html);
      $textarea.hide().after(this.$editor);
      this.setup();
      this.$button.on("mousedown", function() {
        if (self.hasFocus) {
          self.selection = util.saveSelection();
        }
      });
    };
    EmojiArea_WYSIWYG.prototype.onChange = function() {
      this.$textarea.val(this.val()).trigger("change");
    };
    EmojiArea_WYSIWYG.prototype.insert = function(emoji) {
      var $img, content;
      content = void 0;
      $img = $(EmojiArea.createIcon(emoji));
      $img[0].alt = ":" + $img[0].alt + ":";
      if ($img[0].attachEvent) {
        $img[0].attachEvent("onresizestart", (function(e) {
          e.returnValue = false;
        }), false);
      }
      this.$editor.trigger("focus");
      if (this.selection) {
        util.restoreSelection(this.selection);
      }
      try {
        util.replaceSelection($img[0]);
      } catch (_error) {}
      this.onChange();
    };
    EmojiArea_WYSIWYG.prototype.val = function() {
      var children, flush, i, line, lines, sanitizeNode;
      lines = [];
      line = [];
      flush = function() {
        lines.push(line.join(""));
        line = [];
      };
      sanitizeNode = function(node) {
        var alt, children, i, isBlock, tagName;
        if (node.nodeType === TEXT_NODE) {
          line.push(node.nodeValue);
        } else if (node.nodeType === ELEMENT_NODE) {
          tagName = node.tagName.toLowerCase();
          isBlock = TAGS_BLOCK.indexOf(tagName) !== -1;
          if (isBlock && line.length) {
            flush();
          }
          if (tagName === "img") {
            alt = node.getAttribute("alt") || "";
            if (alt) {
              line.push(alt);
            }
            return;
          } else {
            if (tagName === "br") {
              flush();
            }
          }
          children = node.childNodes;
          i = 0;
          while (i < children.length) {
            sanitizeNode(children[i]);
            i++;
          }
          if (isBlock && line.length) {
            flush();
          }
        }
      };
      children = this.$editor[0].childNodes;
      i = 0;
      while (i < children.length) {
        sanitizeNode(children[i]);
        i++;
      }
      if (line.length) {
        flush();
      }
      return lines.join("\n");
    };
    util.extend(EmojiArea_WYSIWYG.prototype, EmojiArea.prototype);
    /*
    Emoji Dropdown Menu
    
    @constructor
    @param {object} emojiarea
    */

    EmojiMenu = function() {
      var $body, $window, self;
      self = this;
      $body = $(document.body);
      $window = $(window);
      this.visible = false;
      this.emojiarea = null;
      this.$menu = $("<div>");
      this.$menu.addClass("emoji-menu");
      this.$menu.hide();
      this.$items = $("<div>").appendTo(this.$menu);
      $body.append(this.$menu);
      $body.on("keydown", function(e) {
        if (e.keyCode === KEY_ESC || e.keyCode === KEY_TAB) {
          self.hide();
        }
      });
      $body.on("mouseup", function() {
        self.hide();
      });
      $window.on("resize", function() {
        if (self.visible) {
          self.reposition();
        }
      });
      this.$menu.on("mouseup", "a", function(e) {
        e.stopPropagation();
        return false;
      });
      this.$menu.on("click", "a", function(e) {
        var emoji;
        emoji = $(".label", $(this)).text();
        if (!emoji) {
          return window.setTimeout(function() {
            self.onItemSelected.apply(self, [emoji]);
          }, 0);
        }
        e.stopPropagation();
        return false;
      });
      this.load();
    };
    EmojiMenu.prototype.onItemSelected = function(emoji) {
      this.emojiarea.insert(emoji);
      this.hide();
    };
    EmojiMenu.prototype.load = function() {
      var category, flag, html, options, path, setImage;
      setImage = function(category) {
        var html, i;
        html = "";
        i = 0;
        while (i < $.emojiarea.icons[category].length) {
          html += "<a href=\"javascript:void(0)\" title=\"" + options[category][i].code + "\">" + EmojiArea.createIcon(options[category][i].code) + "<span class=\"label\">" + util.htmlEntities(options[category][i].code) + "</span></a>";
          i++;
        }
        return html;
      };
      html = [];
      options = $.emojiarea.icons;
      path = $.emojiarea.path;
      if (path.length && path.charAt(path.length - 1) !== "/") {
        path += "/";
      }
      html.push("<ul class=\"nav nav-tabs\"><li class=\"dropdown active emoji-category\"><a class=\"dropdown-toggle emoji-toggle\" data-toggle=\"dropdown\" href=\"#category\">category<span class=\"caret\"></span></a><ul class=\"dropdown-menu emoji-category-menu\" role=\"menu\">");
      flag = true;
      for (category in $.emojiarea.icons) {
        if (flag) {
          html.push("<li class=\"active\"><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>");
          flag = false;
        } else {
          html.push("<li><a href=\"#" + category + "\" data-toggle=\"tab\">" + category + "</a></li>");
        }
      }
      html.push("</ul></li></ul><div class=\"tab-content emoji-content\">");
      flag = true;
      for (category in $.emojiarea.icons) {
        if (flag) {
          html.push("<div class=\"tab-pane fade active in\" id=\"" + category + "\">" + setImage(category) + "</div>");
          flag = false;
        } else {
          html.push("<div class=\"tab-pane fade\" id=\"" + category + "\">" + setImage(category) + "</div>");
        }
      }
      html.push("</div>");
      this.$items.html(html.join(""));
    };
    EmojiMenu.prototype.reposition = function() {
      var $button, offset;
      $button = this.emojiarea.$button;
      offset = $button.offset();
      offset.top += $button.outerHeight();
      offset.left += Math.round($button.outerWidth() / 2);
      this.$menu.css({
        top: offset.top,
        left: offset.left
      });
    };
    EmojiMenu.prototype.hide = function(callback) {
      if (this.emojiarea) {
        this.emojiarea.menu = null;
        this.emojiarea.$button.removeClass("on");
        this.emojiarea = null;
      }
      this.visible = false;
      this.$menu.hide();
    };
    EmojiMenu.prototype.show = function(emojiarea) {
      if (this.emojiarea && this.emojiarea === emojiarea) {
        return;
      }
      this.emojiarea = emojiarea;
      this.emojiarea.menu = this;
      this.reposition();
      this.$menu.show();
      this.visible = true;
    };
    EmojiMenu.show = (function() {
      var menu;
      menu = null;
      return function(emojiarea) {
        menu = menu || new EmojiMenu();
        menu.show(emojiarea);
      };
    })();
  })(jQuery, window, document);

  EmojisData = (function() {
    function EmojisData() {
      this.parsed_json = $.parseJSON(this.emojis_json);
    }

    EmojisData.prototype.emojis_json = '[\
    {\
      "moji": "🀄",\
      "code": "mahjong_tile_red_dragon",\
      "code_ja": "麻雀",\
      "category": "objects",\
      "unicode": "1f004"\
    },\
    {\
      "moji": "🃏",\
      "code": "playing_card_black_joker",\
      "code_ja": "ジョーカー",\
      "category": "objects",\
      "unicode": "1f0cf"\
    },\
    {\
      "moji": "🅰",\
      "code": "negative_squared_latin_capital_letter_A",\
      "code_ja": "A型",\
      "category": "symbols",\
      "unicode": "1f170"\
    },\
    {\
      "moji": "🅱",\
      "code": "negative_squared_latin_capital_letter_B",\
      "code_ja": "B型",\
      "category": "symbols",\
      "unicode": "1f171"\
    },\
    {\
      "moji": "🅿",\
      "code": "negative_squared_latin_capital_letter_P",\
      "code_ja": "駐車場",\
      "category": "symbols",\
      "unicode": "1f17f"\
    },\
    {\
      "moji": "🅾",\
      "code": "negative_squared_latin_capital_letter_O",\
      "code_ja": "O型",\
      "category": "symbols",\
      "unicode": "1f17e"\
    },\
    {\
      "moji": "🆎",\
      "code": "negative_squared_AB",\
      "code_ja": "AB型",\
      "category": "symbols",\
      "unicode": "1f18e"\
    },\
    {\
      "moji": "🆑",\
      "code": "squared_cl",\
      "code_ja": "クリアマーク",\
      "category": "symbols",\
      "unicode": "1f191"\
    },\
    {\
      "moji": "🆒",\
      "code": "squared_cool",\
      "code_ja": "クールマーク",\
      "category": "symbols",\
      "unicode": "1f192"\
    },\
    {\
      "moji": "🆓",\
      "code": "squared_free",\
      "code_ja": "フリーマーク",\
      "category": "symbols",\
      "unicode": "1f193"\
    },\
    {\
      "moji": "🆔",\
      "code": "squared_id",\
      "code_ja": "IDマーク",\
      "category": "symbols",\
      "unicode": "1f194"\
    },\
    {\
      "moji": "🆕",\
      "code": "squared_new",\
      "code_ja": "NEWマーク",\
      "category": "symbols",\
      "unicode": "1f195"\
    },\
    {\
      "moji": "🆖",\
      "code": "squared_ng",\
      "code_ja": "NGマーク",\
      "category": "symbols",\
      "unicode": "1f196"\
    },\
    {\
      "moji": "🆗",\
      "code": "squared_ok",\
      "code_ja": "OKマーク",\
      "category": "symbols",\
      "unicode": "1f197"\
    },\
    {\
      "moji": "🆘",\
      "code": "squared_sos",\
      "code_ja": "SOSマーク",\
      "category": "symbols",\
      "unicode": "1f198"\
    },\
    {\
      "moji": "🆙",\
      "code": "squared_up_with_exclamation_mark",\
      "code_ja": "UPマーク",\
      "category": "symbols",\
      "unicode": "1f199"\
    },\
    {\
      "moji": "🆚",\
      "code": "squared_vs",\
      "code_ja": "VSマーク",\
      "category": "symbols",\
      "unicode": "1f19a"\
    },\
    {\
      "moji": "🇦",\
      "code": "regional_indicator_symbol_letter_A",\
      "code_ja": "A",\
      "category": "symbols",\
      "unicode": "1f1e6"\
    },\
    {\
      "moji": "🇧",\
      "code": "regional_indicator_symbol_letter_B",\
      "code_ja": "B",\
      "category": "symbols",\
      "unicode": "1f1e7"\
    },\
    {\
      "moji": "🇨",\
      "code": "regional_indicator_symbol_letter_C",\
      "code_ja": "C",\
      "category": "symbols",\
      "unicode": "1f1e8"\
    },\
    {\
      "moji": "🇩",\
      "code": "regional_indicator_symbol_letter_D",\
      "code_ja": "D",\
      "category": "symbols",\
      "unicode": "1f1e9"\
    },\
    {\
      "moji": "🇪",\
      "code": "regional_indicator_symbol_letter_E",\
      "code_ja": "E",\
      "category": "symbols",\
      "unicode": "1f1ea"\
    },\
    {\
      "moji": "🇫",\
      "code": "regional_indicator_symbol_letter_F",\
      "code_ja": "F",\
      "category": "symbols",\
      "unicode": "1f1eb"\
    },\
    {\
      "moji": "🇬",\
      "code": "regional_indicator_symbol_letter_G",\
      "code_ja": "G",\
      "category": "symbols",\
      "unicode": "1f1ec"\
    },\
    {\
      "moji": "🇭",\
      "code": "regional_indicator_symbol_letter_H",\
      "code_ja": "H",\
      "category": "symbols",\
      "unicode": "1f1ed"\
    },\
    {\
      "moji": "🇮",\
      "code": "regional_indicator_symbol_letter_I",\
      "code_ja": "I",\
      "category": "symbols",\
      "unicode": "1f1ee"\
    },\
    {\
      "moji": "🇯",\
      "code": "regional_indicator_symbol_letter_J",\
      "code_ja": "J",\
      "category": "symbols",\
      "unicode": "1f1ef"\
    },\
    {\
      "moji": "🇰",\
      "code": "regional_indicator_symbol_letter_K",\
      "code_ja": "K",\
      "category": "symbols",\
      "unicode": "1f1f0"\
    },\
    {\
      "moji": "🇱",\
      "code": "regional_indicator_symbol_letter_L",\
      "code_ja": "L",\
      "category": "symbols",\
      "unicode": "1f1f1"\
    },\
    {\
      "moji": "🇲",\
      "code": "regional_indicator_symbol_letter_M",\
      "code_ja": "M",\
      "category": "symbols",\
      "unicode": "1f1f2"\
    },\
    {\
      "moji": "🇳",\
      "code": "regional_indicator_symbol_letter_N",\
      "code_ja": "N",\
      "category": "symbols",\
      "unicode": "1f1f3"\
    },\
    {\
      "moji": "🇴",\
      "code": "regional_indicator_symbol_letter_O",\
      "code_ja": "O",\
      "category": "symbols",\
      "unicode": "1f1f4"\
    },\
    {\
      "moji": "🇵",\
      "code": "regional_indicator_symbol_letter_P",\
      "code_ja": "P",\
      "category": "symbols",\
      "unicode": "1f1f5"\
    },\
    {\
      "moji": "🇶",\
      "code": "regional_indicator_symbol_letter_Q",\
      "code_ja": "Q",\
      "category": "symbols",\
      "unicode": "1f1f6"\
    },\
    {\
      "moji": "🇷",\
      "code": "regional_indicator_symbol_letter_R",\
      "code_ja": "R",\
      "category": "symbols",\
      "unicode": "1f1f7"\
    },\
    {\
      "moji": "🇸",\
      "code": "regional_indicator_symbol_letter_S",\
      "code_ja": "S",\
      "category": "symbols",\
      "unicode": "1f1f8"\
    },\
    {\
      "moji": "🇹",\
      "code": "regional_indicator_symbol_letter_T",\
      "code_ja": "T",\
      "category": "symbols",\
      "unicode": "1f1f9"\
    },\
    {\
      "moji": "🇺",\
      "code": "regional_indicator_symbol_letter_U",\
      "code_ja": "U",\
      "category": "symbols",\
      "unicode": "1f1fa"\
    },\
    {\
      "moji": "🇻",\
      "code": "regional_indicator_symbol_letter_V",\
      "code_ja": "V",\
      "category": "symbols",\
      "unicode": "1f1fb"\
    },\
    {\
      "moji": "🇼",\
      "code": "regional_indicator_symbol_letter_W",\
      "code_ja": "W",\
      "category": "symbols",\
      "unicode": "1f1fc"\
    },\
    {\
      "moji": "🇽",\
      "code": "regional_indicator_symbol_letter_X",\
      "code_ja": "X",\
      "category": "symbols",\
      "unicode": "1f1fd"\
    },\
    {\
      "moji": "🇾",\
      "code": "regional_indicator_symbol_letter_Y",\
      "code_ja": "Y",\
      "category": "symbols",\
      "unicode": "1f1fe"\
    },\
    {\
      "moji": "🇿",\
      "code": "regional_indicator_symbol_letter_Z",\
      "code_ja": "Z",\
      "category": "symbols",\
      "unicode": "1f1ff"\
    },\
    {\
      "moji": "🇨🇳",\
      "code": "regional_indicator_symbol_letters_CN",\
      "code_ja": "中国国旗",\
      "category": "symbols",\
      "unicode": "1f1e81f1f3"\
    },\
    {\
      "moji": "🇩🇪",\
      "code": "regional_indicator_symbol_letters_DE",\
      "code_ja": "ドイツ国旗",\
      "category": "symbols",\
      "unicode": "1f1e91f1ea"\
    },\
    {\
      "moji": "🇪🇸",\
      "code": "regional_indicator_symbol_letters_ES",\
      "code_ja": "スペイン国旗",\
      "category": "symbols",\
      "unicode": "1f1ea1f1f8"\
    },\
    {\
      "moji": "🇫🇷",\
      "code": "regional_indicator_symbol_letters_FR",\
      "code_ja": "フランス国旗",\
      "category": "symbols",\
      "unicode": "1f1eb1f1f7"\
    },\
    {\
      "moji": "🇬🇧",\
      "code": "regional_indicator_symbol_letters_GB",\
      "code_ja": "イギリス国旗",\
      "category": "symbols",\
      "unicode": "1f1ec1f1e7"\
    },\
    {\
      "moji": "🇮🇹",\
      "code": "regional_indicator_symbol_letters_IT",\
      "code_ja": "イタリア国旗",\
      "category": "symbols",\
      "unicode": "1f1ee1f1f9"\
    },\
    {\
      "moji": "🇯🇵",\
      "code": "regional_indicator_symbol_letters_JP",\
      "code_ja": "日本国旗",\
      "category": "symbols",\
      "unicode": "1f1ef1f1f5"\
    },\
    {\
      "moji": "🇰🇷",\
      "code": "regional_indicator_symbol_letters_KR",\
      "code_ja": "韓国国旗",\
      "category": "symbols",\
      "unicode": "1f1f01f1f7"\
    },\
    {\
      "moji": "🇷🇺",\
      "code": "regional_indicator_symbol_letters_RU",\
      "code_ja": "ロシア国旗",\
      "category": "symbols",\
      "unicode": "1f1f71f1fa"\
    },\
    {\
      "moji": "🇺🇸",\
      "code": "regional_indicator_symbol_letters_US",\
      "code_ja": "アメリカ国旗",\
      "category": "symbols",\
      "unicode": "1f1fa1f1f8"\
    },\
    {\
      "moji": "🈁",\
      "code": "squared_katakana_koko",\
      "code_ja": "ココマーク",\
      "category": "symbols",\
      "unicode": "1f201"\
    },\
    {\
      "moji": "🈂",\
      "code": "squared_katakana_sa",\
      "code_ja": "サービスマーク",\
      "category": "symbols",\
      "unicode": "1f202"\
    },\
    {\
      "moji": "🈚",\
      "code": "squared_cjk_unified_ideograph_7121",\
      "code_ja": "無料マーク",\
      "category": "symbols",\
      "unicode": "1f21a"\
    },\
    {\
      "moji": "🈯",\
      "code": "squared_cjk_unified_ideograph_6307",\
      "code_ja": "指定マーク",\
      "category": "symbols",\
      "unicode": "1f22f"\
    },\
    {\
      "moji": "🈲",\
      "code": "squared_cjk_unified_ideograph_7981",\
      "code_ja": "禁止マーク",\
      "category": "symbols",\
      "unicode": "1f232"\
    },\
    {\
      "moji": "🈳",\
      "code": "squared_cjk_unified_ideograph_7a7a",\
      "code_ja": "空マーク",\
      "category": "symbols",\
      "unicode": "1f233"\
    },\
    {\
      "moji": "🈴",\
      "code": "squared_cjk_unified_ideograph_5408",\
      "code_ja": "合格マーク",\
      "category": "symbols",\
      "unicode": "1f234"\
    },\
    {\
      "moji": "🈵",\
      "code": "squared_cjk_unified_ideograph_6e80",\
      "code_ja": "満マーク",\
      "category": "symbols",\
      "unicode": "1f235"\
    },\
    {\
      "moji": "🈶",\
      "code": "squared_cjk_unified_ideograph_6709",\
      "code_ja": "有料マーク",\
      "category": "symbols",\
      "unicode": "1f236"\
    },\
    {\
      "moji": "🈷",\
      "code": "squared_cjk_unified_ideograph_6708",\
      "code_ja": "月マーク",\
      "category": "symbols",\
      "unicode": "1f237"\
    },\
    {\
      "moji": "🈸",\
      "code": "squared_cjk_unified_ideograph_7533",\
      "code_ja": "申マーク",\
      "category": "symbols",\
      "unicode": "1f238"\
    },\
    {\
      "moji": "🈹",\
      "code": "squared_cjk_unified_ideograph_5272",\
      "code_ja": "割引マーク",\
      "category": "symbols",\
      "unicode": "1f239"\
    },\
    {\
      "moji": "🈺",\
      "code": "squared_cjk_unified_ideograph_55b6",\
      "code_ja": "営業中マーク",\
      "category": "symbols",\
      "unicode": "1f23a"\
    },\
    {\
      "moji": "🉐",\
      "code": "circled_ideograph_advantage",\
      "code_ja": "お得マーク",\
      "category": "symbols",\
      "unicode": "1f250"\
    },\
    {\
      "moji": "🉑",\
      "code": "circled_ideograph_accept",\
      "code_ja": "許可マーク",\
      "category": "symbols",\
      "unicode": "1f251"\
    },\
    {\
      "moji": "🌀",\
      "code": "cyclone",\
      "code_ja": "台風",\
      "category": "nature",\
      "unicode": "1f300"\
    },\
    {\
      "moji": "🌁",\
      "code": "foggy",\
      "code_ja": "霧",\
      "category": "nature",\
      "unicode": "1f301"\
    },\
    {\
      "moji": "🌂",\
      "code": "closed_umbrella",\
      "code_ja": "傘",\
      "category": "nature",\
      "unicode": "1f302"\
    },\
    {\
      "moji": "🌃",\
      "code": "night_with_stars",\
      "code_ja": "夜",\
      "category": "nature",\
      "unicode": "1f303"\
    },\
    {\
      "moji": "🌄",\
      "code": "sunrise_over_mountains",\
      "code_ja": "山の日の出",\
      "category": "nature",\
      "unicode": "1f304"\
    },\
    {\
      "moji": "🌅",\
      "code": "sunrise",\
      "code_ja": "日の出",\
      "category": "nature",\
      "unicode": "1f305"\
    },\
    {\
      "moji": "🌆",\
      "code": "cityspace_at_dusk",\
      "code_ja": "都市の夕暮れ",\
      "category": "nature",\
      "unicode": "1f306"\
    },\
    {\
      "moji": "🌇",\
      "code": "sunset_over_buildings",\
      "code_ja": "夕日",\
      "category": "nature",\
      "unicode": "1f307"\
    },\
    {\
      "moji": "🌈",\
      "code": "rainbow",\
      "code_ja": "虹",\
      "category": "nature",\
      "unicode": "1f308"\
    },\
    {\
      "moji": "🌉",\
      "code": "bridge_at_night",\
      "code_ja": "夜の端",\
      "category": "nature",\
      "unicode": "1f309"\
    },\
    {\
      "moji": "🌊",\
      "code": "water_wave",\
      "code_ja": "波",\
      "category": "nature",\
      "unicode": "1f30a"\
    },\
    {\
      "moji": "🌋",\
      "code": "volcano",\
      "code_ja": "火山",\
      "category": "nature",\
      "unicode": "1f30b"\
    },\
    {\
      "moji": "🌌",\
      "code": "milky_way",\
      "code_ja": "天の川",\
      "category": "cosmos",\
      "unicode": "1f30c"\
    },\
    {\
      "moji": "🌍",\
      "code": "earth_globe_europe_africa",\
      "code_ja": "地球(ヨーロッパ〜アフリカ)",\
      "category": "nature",\
      "unicode": "1f30d"\
    },\
    {\
      "moji": "🌎",\
      "code": "earth_globe_americas",\
      "code_ja": "地球(アメリカ)",\
      "category": "nature",\
      "unicode": "1f30e"\
    },\
    {\
      "moji": "🌏",\
      "code": "earth_globe_asia_australia",\
      "code_ja": "地球(アジア〜オーストラリア)",\
      "category": "nature",\
      "unicode": "1f30f"\
    },\
    {\
      "moji": "🌐",\
      "code": "globe_with_meridians",\
      "code_ja": "地球(経緯度線)",\
      "category": "nature",\
      "unicode": "1f310"\
    },\
    {\
      "moji": "🌑",\
      "code": "new_moon",\
      "code_ja": "新月",\
      "category": "cosmos",\
      "unicode": "1f311"\
    },\
    {\
      "moji": "🌒",\
      "code": "waxing_crescent_moon_symbol",\
      "code_ja": "三日月",\
      "category": "cosmos",\
      "unicode": "1f312"\
    },\
    {\
      "moji": "🌓",\
      "code": "first_quarter_moon",\
      "code_ja": "上弦の月",\
      "category": "cosmos",\
      "unicode": "1f313"\
    },\
    {\
      "moji": "🌔",\
      "code": "waxing_gibbous_moon",\
      "code_ja": "十三夜",\
      "category": "cosmos",\
      "unicode": "1f314"\
    },\
    {\
      "moji": "🌕",\
      "code": "full_moon",\
      "code_ja": "満月",\
      "category": "cosmos",\
      "unicode": "1f315"\
    },\
    {\
      "moji": "🌖",\
      "code": "waning_gibbous_moon_symbol",\
      "code_ja": "十八夜",\
      "category": "cosmos",\
      "unicode": "1f316"\
    },\
    {\
      "moji": "🌗",\
      "code": "last_quarter_moon",\
      "code_ja": "下弦の月",\
      "category": "cosmos",\
      "unicode": "1f317"\
    },\
    {\
      "moji": "🌘",\
      "code": "waning_crescent_moon_symbol",\
      "code_ja": "二十六夜",\
      "category": "cosmos",\
      "unicode": "1f318"\
    },\
    {\
      "moji": "🌙",\
      "code": "crescent_moon",\
      "code_ja": "三日月2",\
      "category": "cosmos",\
      "unicode": "1f319"\
    },\
    {\
      "moji": "🌚",\
      "code": "new_moon_with_face",\
      "code_ja": "顔月(新月)",\
      "category": "cosmos",\
      "unicode": "1f31a"\
    },\
    {\
      "moji": "🌛",\
      "code": "first_quarter_moon_with_face",\
      "code_ja": "顔月(上弦の月)",\
      "category": "cosmos",\
      "unicode": "1f31b"\
    },\
    {\
      "moji": "🌜",\
      "code": "last_quarter_moon_with_face",\
      "code_ja": "顔月(下弦の月)",\
      "category": "cosmos",\
      "unicode": "1f31c"\
    },\
    {\
      "moji": "🌝",\
      "code": "full_moon_with_face",\
      "code_ja": "顔月(満月)",\
      "category": "cosmos",\
      "unicode": "1f31d"\
    },\
    {\
      "moji": "🌞",\
      "code": "sun_with_face",\
      "code_ja": "顔太陽",\
      "category": "cosmos",\
      "unicode": "1f31e"\
    },\
    {\
      "moji": "🌟",\
      "code": "glowing_star",\
      "code_ja": "輝く星",\
      "category": "cosmos",\
      "unicode": "1f31f"\
    },\
     {\
      "moji": "🌠",\
      "code": "shooting_star",\
      "code_ja": "流れ星",\
      "category": "cosmos",\
      "unicode": "1f320"\
    },\
    {\
      "moji": "🌰",\
      "code": "chestnut",\
      "code_ja": "栗",\
      "category": "nature",\
      "unicode": "1f330"\
    },\
    {\
      "moji": "🌱",\
      "code": "seeding",\
      "code_ja": "芽",\
      "category": "nature",\
      "unicode": "1f331"\
    },\
    {\
      "moji": "🌲",\
      "code": "evergreen_tree",\
      "code_ja": "常緑樹",\
      "category": "nature",\
      "unicode": "1f332"\
    },\
    {\
      "moji": "🌳",\
      "code": "deciduous_tree",\
      "code_ja": "落葉樹",\
      "category": "nature",\
      "unicode": "1f333"\
    },\
    {\
      "moji": "🌴",\
      "code": "palm_tree",\
      "code_ja": "ヤシの木",\
      "category": "nature",\
      "unicode": "1f334"\
    },\
    {\
      "moji": "🌵",\
      "code": "cactus",\
      "code_ja": "サボテン",\
      "category": "nature",\
      "unicode": "1f335"\
    },\
    {\
      "moji": "🌷",\
      "code": "tulip",\
      "code_ja": "チューリップ",\
      "category": "nature",\
      "unicode": "1f337"\
    },\
    {\
      "moji": "🌸",\
      "code": "cherry_blossom",\
      "code_ja": "桜",\
      "category": "nature",\
      "unicode": "1f338"\
    },\
    {\
      "moji": "🌹",\
      "code": "rose",\
      "code_ja": "バラ",\
      "category": "nature",\
      "unicode": "1f339"\
    },\
    {\
      "moji": "🌺",\
      "code": "hibiscus",\
      "code_ja": "ハイビスカス",\
      "category": "nature",\
      "unicode": "1f33a"\
    },\
    {\
      "moji": "🌻",\
      "code": "sunflower",\
      "code_ja": "ひまわり",\
      "category": "nature",\
      "unicode": "1f33b"\
    },\
    {\
      "moji": "🌼",\
      "code": "blossom",\
      "code_ja": "花",\
      "category": "nature",\
      "unicode": "1f33c"\
    },\
    {\
      "moji": "🌽",\
      "code": "ear_of_maize",\
      "code_ja": "とうろもこし",\
      "category": "food",\
      "unicode": "1f33d"\
    },\
    {\
      "moji": "🌾",\
      "code": "ear_of_rice",\
      "code_ja": "稲穂",\
      "category": "nature",\
      "unicode": "1f33e"\
    },\
    {\
      "moji": "🌿",\
      "code": "herb",\
      "code_ja": "ハーブ",\
      "category": "nature",\
      "unicode": "1f33f"\
    },\
    {\
      "moji": "🍀",\
      "code": "four_leaf_clover",\
      "code_ja": "四葉のクローバー",\
      "category": "nature",\
      "unicode": "1f340"\
    },\
    {\
      "moji": "🍁",\
      "code": "maple_leaf",\
      "code_ja": "もみじ",\
      "category": "nature",\
      "unicode": "1f341"\
    },\
    {\
      "moji": "🍂",\
      "code": "fallen_leaf",\
      "code_ja": "落ち葉",\
      "category": "nature",\
      "unicode": "1f342"\
    },\
    {\
      "moji": "🍃",\
      "code": "leaf_fluttering_in_wind",\
      "code_ja": "風に舞う葉",\
      "category": "nature",\
      "unicode": "1f343"\
    },\
    {\
      "moji": "🍄",\
      "code": "mushroom",\
      "code_ja": "きのこ",\
      "category": "food",\
      "unicode": "1f344"\
    },\
    {\
      "moji": "🍅",\
      "code": "tomato",\
      "code_ja": "トマト",\
      "category": "food",\
      "unicode": "1f345"\
    },\
    {\
      "moji": "🍆",\
      "code": "aubergine",\
      "code_ja": "ナス",\
      "category": "food",\
      "unicode": "1f346"\
    },\
    {\
      "moji": "🍇",\
      "code": "grapes",\
      "code_ja": "ブドウ",\
      "category": "food",\
      "unicode": "1f347"\
    },\
    {\
      "moji": "🍈",\
      "code": "melon",\
      "code_ja": "メロン",\
      "category": "food",\
      "unicode": "1f348"\
    },\
    {\
      "moji": "🍉",\
      "code": "watermelon",\
      "code_ja": "スイカ",\
      "category": "food",\
      "unicode": "1f349"\
    },\
    {\
      "moji": "🍊",\
      "code": "tangerine",\
      "code_ja": "みかん",\
      "category": "food",\
      "unicode": "1f34a"\
    },\
    {\
      "moji": "🍋",\
      "code": "lemon",\
      "code_ja": "レモン",\
      "category": "food",\
      "unicode": "1f34b"\
    },\
    {\
      "moji": "🍌",\
      "code": "banana",\
      "code_ja": "バナナ",\
      "category": "food",\
      "unicode": "1f34c"\
    },\
    {\
      "moji": "🍍",\
      "code": "pineapple",\
      "code_ja": "パイナップル",\
      "category": "food",\
      "unicode": "1f34d"\
    },\
    {\
      "moji": "🍎",\
      "code": "red_apple",\
      "code_ja": "リンゴ",\
      "category": "food",\
      "unicode": "1f34e"\
    },\
    {\
      "moji": "🍏",\
      "code": "green_apple",\
      "code_ja": "青リンゴ",\
      "category": "food",\
      "unicode": "1f34f"\
    },\
    {\
      "moji": "🍐",\
      "code": "pear",\
      "code_ja": "洋ナシ",\
      "category": "food",\
      "unicode": "1f350"\
    },\
    {\
      "moji": "🍑",\
      "code": "peach",\
      "code_ja": "桃",\
      "category": "food",\
      "unicode": "1f351"\
    },\
    {\
      "moji": "🍒",\
      "code": "cherries",\
      "code_ja": "チェリー",\
      "category": "food",\
      "unicode": "1f352"\
    },\
    {\
      "moji": "🍓",\
      "code": "strawberry",\
      "code_ja": "ストロベリー",\
      "category": "food",\
      "unicode": "1f353"\
    },\
    {\
      "moji": "🍔",\
      "code": "hamburger",\
      "code_ja": "ハンバーガー",\
      "category": "food",\
      "unicode": "1f354"\
    },\
    {\
      "moji": "🍕",\
      "code": "pizza",\
      "code_ja": "ピザ",\
      "category": "food",\
      "unicode": "1f355"\
    },\
    {\
      "moji": "🍖",\
      "code": "meat_on_bone",\
      "code_ja": "肉",\
      "category": "food",\
      "unicode": "1f356"\
    },\
    {\
      "moji": "🍗",\
      "code": "poultry_leg",\
      "code_ja": "チキン",\
      "category": "food",\
      "unicode": "1f357"\
    },\
    {\
      "moji": "🍘",\
      "code": "rice_cracker",\
      "code_ja": "せんべい",\
      "category": "food",\
      "unicode": "1f358"\
    },\
    {\
      "moji": "🍙",\
      "code": "rice_ball",\
      "code_ja": "おにぎり",\
      "category": "food",\
      "unicode": "1f359"\
    },\
    {\
      "moji": "🍚",\
      "code": "cooked_rice",\
      "code_ja": "ごはん",\
      "category": "food",\
      "unicode": "1f35a"\
    },\
    {\
      "moji": "🍛",\
      "code": "curry_and_rice",\
      "code_ja": "カレーライス",\
      "category": "food",\
      "unicode": "1f35b"\
    },\
    {\
      "moji": "🍜",\
      "code": "steaming_bowl",\
      "code_ja": "ラーメン",\
      "category": "food",\
      "unicode": "1f35c"\
    },\
    {\
      "moji": "🍝",\
      "code": "spaghetti",\
      "code_ja": "スパゲッティ",\
      "category": "food",\
      "unicode": "1f35d"\
    },\
    {\
      "moji": "🍞",\
      "code": "bread",\
      "code_ja": "パン",\
      "category": "food",\
      "unicode": "1f35e"\
    },\
    {\
      "moji": "🍟",\
      "code": "french_fries",\
      "code_ja": "フライドポテト",\
      "category": "food",\
      "unicode": "1f35f"\
    },\
    {\
      "moji": "🍠",\
      "code": "roasted_sweet_potato",\
      "code_ja": "焼きいも",\
      "category": "food",\
      "unicode": "1f360"\
    },\
    {\
      "moji": "🍡",\
      "code": "dango",\
      "code_ja": "だんご",\
      "category": "food",\
      "unicode": "1f361"\
    },\
    {\
      "moji": "🍢",\
      "code": "oden",\
      "code_ja": "おでん",\
      "category": "food",\
      "unicode": "1f362"\
    },\
    {\
      "moji": "🍣",\
      "code": "sushi",\
      "code_ja": "すし",\
      "category": "food",\
      "unicode": "1f363"\
    },\
    {\
      "moji": "🍤",\
      "code": "fried_shrimp",\
      "code_ja": "エビフライ",\
      "category": "food",\
      "unicode": "1f364"\
    },\
    {\
      "moji": "🍥",\
      "code": "fish_cake_with_swirl_design",\
      "code_ja": "なると",\
      "category": "food",\
      "unicode": "1f365"\
    },\
    {\
      "moji": "🍦",\
      "code": "soft_ice_cream",\
      "code_ja": "ソフトクリーム",\
      "category": "food",\
      "unicode": "1f366"\
    },\
    {\
      "moji": "🍧",\
      "code": "shaved_ice",\
      "code_ja": "かき氷",\
      "category": "food",\
      "unicode": "1f367"\
    },\
    {\
      "moji": "🍨",\
      "code": "ice_cream",\
      "code_ja": "アイスクリーム",\
      "category": "food",\
      "unicode": "1f368"\
    },\
    {\
      "moji": "🍩",\
      "code": "doughnut",\
      "code_ja": "ドーナツ",\
      "category": "food",\
      "unicode": "1f369"\
    },\
    {\
      "moji": "🍪",\
      "code": "cookie",\
      "code_ja": "クッキー",\
      "category": "food",\
      "unicode": "1f36a"\
    },\
    {\
      "moji": "🍫",\
      "code": "chocolate_bar",\
      "code_ja": "チョコレート",\
      "category": "food",\
      "unicode": "1f36b"\
    },\
    {\
      "moji": "🍬",\
      "code": "candy",\
      "code_ja": "キャンディ",\
      "category": "food",\
      "unicode": "1f36c"\
    },\
    {\
      "moji": "🍭",\
      "code": "lollipop",\
      "code_ja": "ペロペロキャンディ",\
      "category": "food",\
      "unicode": "1f36d"\
    },\
    {\
      "moji": "🍮",\
      "code": "custard",\
      "code_ja": "プリン",\
      "category": "food",\
      "unicode": "1f36e"\
    },\
    {\
      "moji": "🍯",\
      "code": "honey_pot",\
      "code_ja": "ハチミツ",\
      "category": "food",\
      "unicode": "1f36f"\
    },\
    {\
      "moji": "🍰",\
      "code": "shortcake",\
      "code_ja": "ショートケーキ",\
      "category": "food",\
      "unicode": "1f370"\
    },\
    {\
      "moji": "🍱",\
      "code": "bento_box",\
      "code_ja": "お弁当",\
      "category": "food",\
      "unicode": "1f371"\
    },\
    {\
      "moji": "🍲",\
      "code": "pot_of_food",\
      "code_ja": "鍋",\
      "category": "food",\
      "unicode": "1f372"\
    },\
    {\
      "moji": "🍳",\
      "code": "cooking",\
      "code_ja": "料理",\
      "category": "food",\
      "unicode": "1f373"\
    },\
    {\
      "moji": "🍴",\
      "code": "fork_and_knife",\
      "code_ja": "食事",\
      "category": "food",\
      "unicode": "1f374"\
    },\
    {\
      "moji": "🍵",\
      "code": "teacup_without_handle",\
      "code_ja": "お茶",\
      "category": "food",\
      "unicode": "1f375"\
    },\
    {\
      "moji": "🍶",\
      "code": "sake_bottle_and_cup",\
      "code_ja": "日本酒",\
      "category": "food",\
      "unicode": "1f376"\
    },\
    {\
      "moji": "🍷",\
      "code": "wine_glass",\
      "code_ja": "ワイン",\
      "category": "food",\
      "unicode": "1f377"\
    },\
    {\
      "moji": "🍸",\
      "code": "cocktail_glass",\
      "code_ja": "カクテル",\
      "category": "food",\
      "unicode": "1f378"\
    },\
    {\
      "moji": "🍹",\
      "code": "tropical_drink",\
      "code_ja": "トロピカルドリンク",\
      "category": "food",\
      "unicode": "1f379"\
    },\
    {\
      "moji": "🍺",\
      "code": "beer_mug",\
      "code_ja": "ビールジョッキ",\
      "category": "food",\
      "unicode": "1f37a"\
    },\
    {\
      "moji": "🍻",\
      "code": "clinking_beer_mugs",\
      "code_ja": "乾杯",\
      "category": "food",\
      "unicode": "1f37b"\
    },\
    {\
      "moji": "🍼",\
      "code": "baby_bottle",\
      "code_ja": "哺乳瓶",\
      "category": "food",\
      "unicode": "1f37c"\
    },\
    {\
      "moji": "🎀",\
      "code": "ribbon",\
      "code_ja": "リボン",\
      "category": "objects",\
      "unicode": "1f380"\
    },\
    {\
      "moji": "🎁",\
      "code": "wrapped_present",\
      "code_ja": "プレゼント",\
      "category": "objects",\
      "unicode": "1f381"\
    },\
    {\
      "moji": "🎂",\
      "code": "birthday_cake",\
      "code_ja": "バースデーケーキ",\
      "category": "food",\
      "unicode": "1f382"\
    },\
    {\
      "moji": "🎃",\
      "code": "jack_o_lantern",\
      "code_ja": "ジャック・オ・ランタン",\
      "category": "objects",\
      "unicode": "1f383"\
    },\
    {\
      "moji": "🎄",\
      "code": "christmas_tree",\
      "code_ja": "クリスマスツリー",\
      "category": "objects",\
      "unicode": "1f384"\
    },\
    {\
      "moji": "🎅",\
      "code": "father_christmas",\
      "code_ja": "サンタクロース",\
      "category": "people",\
      "unicode": "1f385"\
    },\
    {\
      "moji": "🎆",\
      "code": "fireworks",\
      "code_ja": "花火",\
      "category": "objects",\
      "unicode": "1f386"\
    },\
    {\
      "moji": "🎇",\
      "code": "firework_sparkler",\
      "code_ja": "線香花火",\
      "category": "objects",\
      "unicode": "1f387"\
    },\
    {\
      "moji": "🎈",\
      "code": "balloon",\
      "code_ja": "風船",\
      "category": "objects",\
      "unicode": "1f388"\
    },\
    {\
      "moji": "🎉",\
      "code": "party_popper",\
      "code_ja": "クラッカー",\
      "category": "objects",\
      "unicode": "1f389"\
    },\
    {\
      "moji": "🎊",\
      "code": "confetti_ball",\
      "code_ja": "くす玉",\
      "category": "objects",\
      "unicode": "1f38a"\
    },\
    {\
      "moji": "🎋",\
      "code": "tanabata_tree",\
      "code_ja": "七夕",\
      "category": "objects",\
      "unicode": "1f38b"\
    },\
    {\
      "moji": "🎌",\
      "code": "crossed_flags",\
      "code_ja": "祝日",\
      "category": "objects",\
      "unicode": "1f38c"\
    },\
    {\
      "moji": "🎍",\
      "code": "pine_decoration",\
      "code_ja": "門松",\
      "category": "objects",\
      "unicode": "1f38d"\
    },\
    {\
      "moji": "🎎",\
      "code": "japanese_dolls",\
      "code_ja": "ひな祭り",\
      "category": "objects",\
      "unicode": "1f38e"\
    },\
    {\
      "moji": "🎏",\
      "code": "carp_streamer",\
      "code_ja": "こいのぼり",\
      "category": "objects",\
      "unicode": "1f38f"\
    },\
    {\
      "moji": "🎐",\
      "code": "wind_chime",\
      "code_ja": "風鈴",\
      "category": "objects",\
      "unicode": "1f390"\
    },\
    {\
      "moji": "🎑",\
      "code": "moon_viewing_ceremony",\
      "code_ja": "お月見",\
      "category": "objects",\
      "unicode": "1f391"\
    },\
    {\
      "moji": "🎒",\
      "code": "school_satchel",\
      "code_ja": "ランドセル",\
      "category": "objects",\
      "unicode": "1f392"\
    },\
    {\
      "moji": "🎓",\
      "code": "graduation_cap",\
      "code_ja": "卒業式",\
      "category": "objects",\
      "unicode": "1f393"\
    },\
    {\
      "moji": "🎠",\
      "code": "carousel_horse",\
      "code_ja": "メリーゴーランド",\
      "category": "objects",\
      "unicode": "1f3a0"\
    },\
    {\
      "moji": "🎡",\
      "code": "ferris_wheel",\
      "code_ja": "観覧車",\
      "category": "objects",\
      "unicode": "1f3a1"\
    },\
    {\
      "moji": "🎢",\
      "code": "roller_coaster",\
      "code_ja": "ジェットコースター",\
      "category": "objects",\
      "unicode": "1f3a2"\
    },\
    {\
      "moji": "🎣",\
      "code": "fishing_pole_and_fish",\
      "code_ja": "釣り",\
      "category": "objects",\
      "unicode": "1f3a3"\
    },\
    {\
      "moji": "🎤",\
      "code": "microphone",\
      "code_ja": "マイク",\
      "category": "objects",\
      "unicode": "1f3a4"\
    },\
    {\
      "moji": "🎥",\
      "code": "movie_camera",\
      "code_ja": "ビデオカメラ",\
      "category": "objects",\
      "unicode": "1f3a5"\
    },\
    {\
      "moji": "🎦",\
      "code": "cinema",\
      "code_ja": "映画",\
      "category": "objects",\
      "unicode": "1f3a6"\
    },\
    {\
      "moji": "🎧",\
      "code": "headphone",\
      "code_ja": "ヘッドホン",\
      "category": "objects",\
      "unicode": "1f3a7"\
    },\
    {\
      "moji": "🎨",\
      "code": "artist_palette",\
      "code_ja": "パレット",\
      "category": "objects",\
      "unicode": "1f3a8"\
    },\
    {\
      "moji": "🎩",\
      "code": "top_hat",\
      "code_ja": "シルクハット",\
      "category": "objects",\
      "unicode": "1f3a9"\
    },\
    {\
      "moji": "🎪",\
      "code": "circus_tent",\
      "code_ja": "サーカス",\
      "category": "objects",\
      "unicode": "1f3aa"\
    },\
    {\
      "moji": "🎫",\
      "code": "ticket",\
      "code_ja": "チケット",\
      "category": "objects",\
      "unicode": "1f3ab"\
    },\
    {\
      "moji": "🎬",\
      "code": "clapper_board",\
      "code_ja": "カチンコ",\
      "category": "objects",\
      "unicode": "1f3ac"\
    },\
    {\
      "moji": "🎭",\
      "code": "performing_arts",\
      "code_ja": "演劇",\
      "category": "abstract",\
      "unicode": "1f3ad"\
    },\
    {\
      "moji": "🎮",\
      "code": "video_game",\
      "code_ja": "ゲームコントローラー",\
      "category": "objects",\
      "unicode": "1f3ae"\
    },\
    {\
      "moji": "🎯",\
      "code": "direct_hit",\
      "code_ja": "当たり",\
      "category": "abstract",\
      "unicode": "1f3af"\
    },\
    {\
      "moji": "🎰",\
      "code": "slot_machine",\
      "code_ja": "スロット",\
      "category": "objects",\
      "unicode": "1f3b0"\
    },\
    {\
      "moji": "🎱",\
      "code": "billiards",\
      "code_ja": "ビリヤード",\
      "category": "objects",\
      "unicode": "1f3b1"\
    },\
    {\
      "moji": "🎲",\
      "code": "game_die",\
      "code_ja": "サイコロ",\
      "category": "objects",\
      "unicode": "1f3b2"\
    },\
    {\
      "moji": "🎳",\
      "code": "bowling",\
      "code_ja": "ボウリング",\
      "category": "objects",\
      "unicode": "1f3b3"\
    },\
    {\
      "moji": "🎴",\
      "code": "flower_playing_cards",\
      "code_ja": "花札",\
      "category": "objects",\
      "unicode": "1f3b4"\
    },\
    {\
      "moji": "🎵",\
      "code": "musical_note",\
      "code_ja": "音符",\
      "category": "abstract",\
      "unicode": "1f3b5"\
    },\
    {\
      "moji": "🎶",\
      "code": "multiple_musical_notes",\
      "code_ja": "メロディー",\
      "category": "abstract",\
      "unicode": "1f3b6"\
    },\
    {\
      "moji": "🎷",\
      "code": "saxophone",\
      "code_ja": "サックス",\
      "category": "objects",\
      "unicode": "1f3b7"\
    },\
    {\
      "moji": "🎸",\
      "code": "guitar",\
      "code_ja": "ギター",\
      "category": "objects",\
      "unicode": "1f3b8"\
    },\
    {\
      "moji": "🎹",\
      "code": "musical_keyboard",\
      "code_ja": "ピアノ",\
      "category": "objects",\
      "unicode": "1f3b9"\
    },\
    {\
      "moji": "🎺",\
      "code": "trumpet",\
      "code_ja": "トランペット",\
      "category": "objects",\
      "unicode": "1f3ba"\
    },\
    {\
      "moji": "🎻",\
      "code": "violin",\
      "code_ja": "バイオリン",\
      "category": "objects",\
      "unicode": "1f3bb"\
    },\
    {\
      "moji": "🎼",\
      "code": "musical_score",\
      "code_ja": "楽譜",\
      "category": "objects",\
      "unicode": "1f3bc"\
    },\
    {\
      "moji": "🎽",\
      "code": "running_shirt_with_sash",\
      "code_ja": "ランニングシャツ",\
      "category": "objects",\
      "unicode": "1f3bd"\
    },\
    {\
      "moji": "🎾",\
      "code": "tennis_racquet_and_ball",\
      "code_ja": "テニスラケットとボール",\
      "category": "objects",\
      "unicode": "1f3be"\
    },\
    {\
      "moji": "🎿",\
      "code": "ski_and_ski_boot",\
      "code_ja": "スキー",\
      "category": "objects",\
      "unicode": "1f3bf"\
    },\
    {\
      "moji": "🏀",\
      "code": "basketball_and_hoop",\
      "code_ja": "バスケットボール",\
      "category": "objects",\
      "unicode": "1f3c0"\
    },\
    {\
      "moji": "🏁",\
      "code": "chequered_flag",\
      "code_ja": "チェッカーフラグ",\
      "category": "objects",\
      "unicode": "1f3c1"\
    },\
    {\
      "moji": "🏂",\
      "code": "snowboarder",\
      "code_ja": "スノーボード",\
      "category": "people",\
      "unicode": "1f3c2"\
    },\
    {\
      "moji": "🏃",\
      "code": "runner",\
      "code_ja": "ランニング",\
      "category": "people",\
      "unicode": "1f3c3"\
    },\
    {\
      "moji": "🏄",\
      "code": "surfer",\
      "code_ja": "サーフィン",\
      "category": "people",\
      "unicode": "1f3c4"\
    },\
    {\
      "moji": "🏆",\
      "code": "trophy",\
      "code_ja": "トロフィー",\
      "category": "objects",\
      "unicode": "1f3c6"\
    },\
    {\
      "moji": "🏇",\
      "code": "horse_racing",\
      "code_ja": "競馬",\
      "category": "people",\
      "unicode": "1f3c7"\
    },\
    {\
      "moji": "🏈",\
      "code": "american_football",\
      "code_ja": "フットボール",\
      "category": "objects",\
      "unicode": "1f3c8"\
    },\
    {\
      "moji": "🏉",\
      "code": "rugby_football",\
      "code_ja": "ラグビーボール",\
      "category": "objects",\
      "unicode": "1f3c9"\
    },\
    {\
      "moji": "🏊",\
      "code": "swimmer",\
      "code_ja": "スイミング",\
      "category": "people",\
      "unicode": "1f3ca"\
    },\
    {\
      "moji": "🏠",\
      "code": "house_building",\
      "code_ja": "家",\
      "category": "places",\
      "unicode": "1f3e0"\
    },\
    {\
      "moji": "🏡",\
      "code": "house_with_garden",\
      "code_ja": "家(庭付き)",\
      "category": "places",\
      "unicode": "1f3e1"\
    },\
    {\
      "moji": "🏢",\
      "code": "office_building",\
      "code_ja": "オフィスビル",\
      "category": "places",\
      "unicode": "1f3e2"\
    },\
    {\
      "moji": "🏣",\
      "code": "japanese_post_office",\
      "code_ja": "郵便局",\
      "category": "places",\
      "unicode": "1f3e3"\
    },\
    {\
      "moji": "🏤",\
      "code": "european_post_office",\
      "code_ja": "郵便局(ヨーロッパ風)",\
      "category": "places",\
      "unicode": "1f3e4"\
    },\
    {\
      "moji": "🏥",\
      "code": "hospital",\
      "code_ja": "病院",\
      "category": "places",\
      "unicode": "1f3e5"\
    },\
    {\
      "moji": "🏦",\
      "code": "bank",\
      "code_ja": "銀行",\
      "category": "places",\
      "unicode": "1f3e6"\
    },\
    {\
      "moji": "🏧",\
      "code": "automated_teller_machine",\
      "code_ja": "ATM",\
      "category": "places",\
      "unicode": "1f3e7"\
    },\
    {\
      "moji": "🏨",\
      "code": "hotel",\
      "code_ja": "ホテル",\
      "category": "places",\
      "unicode": "1f3e8"\
    },\
    {\
      "moji": "🏩",\
      "code": "love_hotel",\
      "code_ja": "ラブホテル",\
      "category": "places",\
      "unicode": "1f3e9"\
    },\
    {\
      "moji": "🏪",\
      "code": "convenience_store",\
      "code_ja": "コンビニ",\
      "category": "places",\
      "unicode": "1f3ea"\
    },\
    {\
      "moji": "🏫",\
      "code": "school",\
      "code_ja": "学校",\
      "category": "places",\
      "unicode": "1f3eb"\
    },\
    {\
      "moji": "🏬",\
      "code": "department_store",\
      "code_ja": "デパート",\
      "category": "places",\
      "unicode": "1f3ec"\
    },\
    {\
      "moji": "🏭",\
      "code": "factory",\
      "code_ja": "工場",\
      "category": "places",\
      "unicode": "1f3ed"\
    },\
    {\
      "moji": "🏮",\
      "code": "izakaya_lantern",\
      "code_ja": "居酒屋",\
      "category": "places",\
      "unicode": "1f3ee"\
    },\
    {\
      "moji": "🏯",\
      "code": "japanese_castle",\
      "code_ja": "日本の城",\
      "category": "places",\
      "unicode": "1f3ef"\
    },\
    {\
      "moji": "🏰",\
      "code": "european_castle",\
      "code_ja": "ヨーロッパの城",\
      "category": "places",\
      "unicode": "1f3f0"\
    },\
    {\
      "moji": "🐀",\
      "code": "rat",\
      "code_ja": "ネズミ",\
      "category": "nature",\
      "unicode": "1f400"\
    },\
    {\
      "moji": "🐁",\
      "code": "mouse",\
      "code_ja": "ハツカネズミ",\
      "category": "nature",\
      "unicode": "1f401"\
    },\
    {\
      "moji": "🐂",\
      "code": "ox",\
      "code_ja": "雄牛",\
      "category": "nature",\
      "unicode": "1f402"\
    },\
    {\
      "moji": "🐃",\
      "code": "water_buffalo",\
      "code_ja": "水牛",\
      "category": "nature",\
      "unicode": "1f403"\
    },\
    {\
      "moji": "🐄",\
      "code": "cow",\
      "code_ja": "乳牛",\
      "category": "nature",\
      "unicode": "1f404"\
    },\
    {\
      "moji": "🐅",\
      "code": "tiger",\
      "code_ja": "トラ",\
      "category": "nature",\
      "unicode": "1f405"\
    },\
    {\
      "moji": "🐆",\
      "code": "leopard",\
      "code_ja": "ヒョウ",\
      "category": "nature",\
      "unicode": "1f406"\
    },\
    {\
      "moji": "🐇",\
      "code": "rabbit",\
      "code_ja": "ウサギ",\
      "category": "nature",\
      "unicode": "1f407"\
    },\
    {\
      "moji": "🐈",\
      "code": "cat",\
      "code_ja": "ネコ",\
      "category": "nature",\
      "unicode": "1f408"\
    },\
    {\
      "moji": "🐉",\
      "code": "dragon",\
      "code_ja": "ドラゴン",\
      "category": "nature",\
      "unicode": "1f409"\
    },\
    {\
      "moji": "🐊",\
      "code": "crocodile",\
      "code_ja": "ワニ",\
      "category": "nature",\
      "unicode": "1f40a"\
    },\
    {\
      "moji": "🐋",\
      "code": "whale",\
      "code_ja": "クジラ",\
      "category": "nature",\
      "unicode": "1f40b"\
    },\
    {\
      "moji": "🐌",\
      "code": "snail",\
      "code_ja": "カタツムリ",\
      "category": "nature",\
      "unicode": "1f40c"\
    },\
    {\
      "moji": "🐍",\
      "code": "snake",\
      "code_ja": "ヘビ",\
      "category": "nature",\
      "unicode": "1f40d"\
    },\
    {\
      "moji": "🐎",\
      "code": "horse",\
      "code_ja": "ウマ",\
      "category": "nature",\
      "unicode": "1f40e"\
    },\
    {\
      "moji": "🐏",\
      "code": "ram",\
      "code_ja": "牡羊",\
      "category": "nature",\
      "unicode": "1f40f"\
    },\
    {\
      "moji": "🐐",\
      "code": "goat",\
      "code_ja": "ヤギ",\
      "category": "nature",\
      "unicode": "1f410"\
    },\
    {\
      "moji": "🐑",\
      "code": "sheep",\
      "code_ja": "ヒツジ",\
      "category": "nature",\
      "unicode": "1f411"\
    },\
    {\
      "moji": "🐒",\
      "code": "monkey",\
      "code_ja": "サル",\
      "category": "nature",\
      "unicode": "1f412"\
    },\
    {\
      "moji": "🐓",\
      "code": "rooster",\
      "code_ja": "雄鶏",\
      "category": "nature",\
      "unicode": "1f413"\
    },\
    {\
      "moji": "🐔",\
      "code": "chicken",\
      "code_ja": "ニワトリ",\
      "category": "nature",\
      "unicode": "1f414"\
    },\
    {\
      "moji": "🐕",\
      "code": "dog",\
      "code_ja": "イヌ",\
      "category": "nature",\
      "unicode": "1f415"\
    },\
    {\
      "moji": "🐖",\
      "code": "pig",\
      "code_ja": "ブタ",\
      "category": "nature",\
      "unicode": "1f416"\
    },\
    {\
      "moji": "🐗",\
      "code": "boar",\
      "code_ja": "イノシシ",\
      "category": "nature",\
      "unicode": "1f417"\
    },\
    {\
      "moji": "🐘",\
      "code": "elephant",\
      "code_ja": "ゾウ",\
      "category": "nature",\
      "unicode": "1f418"\
    },\
    {\
      "moji": "🐙",\
      "code": "octopus",\
      "code_ja": "タコ",\
      "category": "nature",\
      "unicode": "1f419"\
    },\
    {\
      "moji": "🐚",\
      "code": "spiral_shell",\
      "code_ja": "巻貝",\
      "category": "nature",\
      "unicode": "1f41a"\
    },\
    {\
      "moji": "🐛",\
      "code": "bug",\
      "code_ja": "毛虫",\
      "category": "nature",\
      "unicode": "1f41b"\
    },\
    {\
      "moji": "🐜",\
      "code": "ant",\
      "code_ja": "アリ",\
      "category": "nature",\
      "unicode": "1f41c"\
    },\
    {\
      "moji": "🐝",\
      "code": "honeybee",\
      "code_ja": "ミツバチ",\
      "category": "nature",\
      "unicode": "1f41d"\
    },\
    {\
      "moji": "🐞",\
      "code": "lady_beetle",\
      "code_ja": "てんとう虫",\
      "category": "nature",\
      "unicode": "1f41e"\
    },\
    {\
      "moji": "🐟",\
      "code": "fish",\
      "code_ja": "魚",\
      "category": "nature",\
      "unicode": "1f41f"\
    },\
    {\
      "moji": "🐠",\
      "code": "tropical_fish",\
      "code_ja": "熱帯魚",\
      "category": "nature",\
      "unicode": "1f420"\
    },\
    {\
      "moji": "🐡",\
      "code": "blowfish",\
      "code_ja": "フグ",\
      "category": "nature",\
      "unicode": "1f421"\
    },\
    {\
      "moji": "🐢",\
      "code": "turtle",\
      "code_ja": "カメ",\
      "category": "nature",\
      "unicode": "1f422"\
    },\
    {\
      "moji": "🐣",\
      "code": "hatching_chick",\
      "code_ja": "孵化ヒヨコ",\
      "category": "nature",\
      "unicode": "1f423"\
    },\
    {\
      "moji": "🐤",\
      "code": "baby_chick",\
      "code_ja": "ヒヨコ",\
      "category": "nature",\
      "unicode": "1f424"\
    },\
    {\
      "moji": "🐥",\
      "code": "front_facing_baby_chick",\
      "code_ja": "ヒヨコ2",\
      "category": "nature",\
      "unicode": "1f425"\
    },\
    {\
      "moji": "🐦",\
      "code": "bird",\
      "code_ja": "トリ",\
      "category": "nature",\
      "unicode": "1f426"\
    },\
    {\
      "moji": "🐧",\
      "code": "penguin",\
      "code_ja": "ペンギン",\
      "category": "nature",\
      "unicode": "1f427"\
    },\
    {\
      "moji": "🐨",\
      "code": "koala",\
      "code_ja": "コアラ",\
      "category": "nature",\
      "unicode": "1f428"\
    },\
    {\
      "moji": "🐩",\
      "code": "poodle",\
      "code_ja": "プードル",\
      "category": "nature",\
      "unicode": "1f429"\
    },\
    {\
      "moji": "🐪",\
      "code": "dromedary_camel",\
      "code_ja": "ヒトコブラクダ",\
      "category": "nature",\
      "unicode": "1f42a"\
    },\
    {\
      "moji": "🐫",\
      "code": "bactrian_camel",\
      "code_ja": "フタコブラクダ",\
      "category": "nature",\
      "unicode": "1f42b"\
    },\
    {\
      "moji": "🐬",\
      "code": "dolphin",\
      "code_ja": "イルカ",\
      "category": "nature",\
      "unicode": "1f42c"\
    },\
    {\
      "moji": "🐭",\
      "code": "mouse_face",\
      "code_ja": "ネズミ2",\
      "category": "nature",\
      "unicode": "1f42d"\
    },\
    {\
      "moji": "🐮",\
      "code": "cow_face",\
      "code_ja": "ウシ",\
      "category": "nature",\
      "unicode": "1f42e"\
    },\
    {\
      "moji": "🐯",\
      "code": "tiger_face",\
      "code_ja": "トラ2",\
      "category": "nature",\
      "unicode": "1f42f"\
    },\
    {\
      "moji": "🐰",\
      "code": "rabbit_face",\
      "code_ja": "ウサギ2",\
      "category": "nature",\
      "unicode": "1f430"\
    },\
    {\
      "moji": "🐱",\
      "code": "cat_face",\
      "code_ja": "ネコ2",\
      "category": "nature",\
      "unicode": "1f431"\
    },\
    {\
      "moji": "🐲",\
      "code": "dragon_face",\
      "code_ja": "ドラゴン2",\
      "category": "nature",\
      "unicode": "1f432"\
    },\
    {\
      "moji": "🐳",\
      "code": "spouting_whale",\
      "code_ja": "クジラ2",\
      "category": "nature",\
      "unicode": "1f433"\
    },\
    {\
      "moji": "🐴",\
      "code": "horse_face",\
      "code_ja": "ウマ2",\
      "category": "nature",\
      "unicode": "1f434"\
    },\
    {\
      "moji": "🐵",\
      "code": "monkey_face",\
      "code_ja": "サル2",\
      "category": "nature",\
      "unicode": "1f435"\
    },\
    {\
      "moji": "🐶",\
      "code": "dog_face",\
      "code_ja": "イヌ2",\
      "category": "nature",\
      "unicode": "1f436"\
    },\
    {\
      "moji": "🐷",\
      "code": "pig_face",\
      "code_ja": "ブタ2",\
      "category": "nature",\
      "unicode": "1f437"\
    },\
    {\
      "moji": "🐸",\
      "code": "frog_face",\
      "code_ja": "カエル",\
      "category": "nature",\
      "unicode": "1f438"\
    },\
    {\
      "moji": "🐹",\
      "code": "hamster_face",\
      "code_ja": "ハムスター",\
      "category": "nature",\
      "unicode": "1f439"\
    },\
    {\
      "moji": "🐺",\
      "code": "wolf_face",\
      "code_ja": "オオカミ",\
      "category": "nature",\
      "unicode": "1f43a"\
    },\
    {\
      "moji": "🐻",\
      "code": "bear_face",\
      "code_ja": "クマ",\
      "category": "nature",\
      "unicode": "1f43b"\
    },\
    {\
      "moji": "🐼",\
      "code": "panda_face",\
      "code_ja": "パンダ",\
      "category": "nature",\
      "unicode": "1f43c"\
    },\
    {\
      "moji": "🐽",\
      "code": "pig_nose",\
      "code_ja": "ブタの鼻",\
      "category": "nature",\
      "unicode": "1f43d"\
    },\
    {\
      "moji": "🐾",\
      "code": "paw_prints",\
      "code_ja": "足跡(犬)",\
      "category": "nature",\
      "unicode": "1f43e"\
    },\
    {\
      "moji": "👀",\
      "code": "eyes",\
      "code_ja": "目",\
      "category": "people",\
      "unicode": "1f440"\
    },\
    {\
      "moji": "👂",\
      "code": "ear",\
      "code_ja": "耳",\
      "category": "people",\
      "unicode": "1f442"\
    },\
    {\
      "moji": "👃",\
      "code": "nose",\
      "code_ja": "鼻",\
      "category": "people",\
      "unicode": "1f443"\
    },\
    {\
      "moji": "👄",\
      "code": "mouth",\
      "code_ja": "口",\
      "category": "people",\
      "unicode": "1f444"\
    },\
    {\
      "moji": "👅",\
      "code": "tongue",\
      "code_ja": "舌",\
      "category": "people",\
      "unicode": "1f445"\
    },\
    {\
      "moji": "👆",\
      "code": "white_up_pointing_backhand_index",\
      "code_ja": "指さし(上)",\
      "category": "gestures",\
      "unicode": "1f446"\
    },\
    {\
      "moji": "👇",\
      "code": "white_down_pointing_backhand_index",\
      "code_ja": "指さし(下)",\
      "category": "gestures",\
      "unicode": "1f447"\
    },\
    {\
      "moji": "👈",\
      "code": "white_left_pointing_backhand_index",\
      "code_ja": "指さし(左)",\
      "category": "gestures",\
      "unicode": "1f448"\
    },\
    {\
      "moji": "👉",\
      "code": "white_right_pointing_backhand_index",\
      "code_ja": "指さし(右)",\
      "category": "gestures",\
      "unicode": "1f449"\
    },\
    {\
      "moji": "👊",\
      "code": "fisted_hand_sign",\
      "code_ja": "パンチ",\
      "category": "gestures",\
      "unicode": "1f44a"\
    },\
    {\
      "moji": "👋",\
      "code": "waving_hand_sign",\
      "code_ja": "バイバイ",\
      "category": "gestures",\
      "unicode": "1f44b"\
    },\
    {\
      "moji": "👌",\
      "code": "ok_hand_sign",\
      "code_ja": "オーケー",\
      "category": "gestures",\
      "unicode": "1f44c"\
    },\
    {\
      "moji": "👍",\
      "code": "thumbs_up_sign",\
      "code_ja": "グッド",\
      "category": "gestures",\
      "unicode": "1f44d"\
    },\
    {\
      "moji": "👎",\
      "code": "thumbs_down_sign",\
      "code_ja": "ブーイング",\
      "category": "gestures",\
      "unicode": "1f44e"\
    },\
    {\
      "moji": "👏",\
      "code": "clapping_hands_sign",\
      "code_ja": "拍手",\
      "category": "gestures",\
      "unicode": "1f44f"\
    },\
    {\
      "moji": "👐",\
      "code": "open_hands_sign",\
      "code_ja": "おっはー",\
      "category": "gestures",\
      "unicode": "1f450"\
    },\
    {\
      "moji": "👑",\
      "code": "crown",\
      "code_ja": "王冠",\
      "category": "objects",\
      "unicode": "1f451"\
    },\
    {\
      "moji": "👒",\
      "code": "womans_hat",\
      "code_ja": "帽子(女性向け)",\
      "category": "objects",\
      "unicode": "1f452"\
    },\
    {\
      "moji": "👓",\
      "code": "eyeglasses",\
      "code_ja": "メガネ",\
      "category": "objects",\
      "unicode": "1f453"\
    },\
    {\
      "moji": "👔",\
      "code": "necktie",\
      "code_ja": "ネクタイ",\
      "category": "objects",\
      "unicode": "1f454"\
    },\
    {\
      "moji": "👕",\
      "code": "t_shirt",\
      "code_ja": "Tシャツ",\
      "category": "objects",\
      "unicode": "1f455"\
    },\
    {\
      "moji": "👖",\
      "code": "jeans",\
      "code_ja": "ジーンズ",\
      "category": "objects",\
      "unicode": "1f456"\
    },\
    {\
      "moji": "👗",\
      "code": "dress",\
      "code_ja": "ドレス",\
      "category": "objects",\
      "unicode": "1f457"\
    },\
    {\
      "moji": "👘",\
      "code": "kimono",\
      "code_ja": "着物",\
      "category": "objects",\
      "unicode": "1f458"\
    },\
    {\
      "moji": "👙",\
      "code": "bikini",\
      "code_ja": "ビキニ",\
      "category": "objects",\
      "unicode": "1f459"\
    },\
    {\
      "moji": "👚",\
      "code": "womans_clothes",\
      "code_ja": "婦人服",\
      "category": "objects",\
      "unicode": "1f45a"\
    },\
    {\
      "moji": "👛",\
      "code": "purse",\
      "code_ja": "小銭入れ",\
      "category": "objects",\
      "unicode": "1f45b"\
    },\
    {\
      "moji": "👜",\
      "code": "handbag",\
      "code_ja": "ハンドバッグ",\
      "category": "objects",\
      "unicode": "1f45c"\
    },\
    {\
      "moji": "👝",\
      "code": "pouch",\
      "code_ja": "ポーチ",\
      "category": "objects",\
      "unicode": "1f45d"\
    },\
    {\
      "moji": "👞",\
      "code": "mans_shoe",\
      "code_ja": "紳士靴",\
      "category": "objects",\
      "unicode": "1f45e"\
    },\
    {\
      "moji": "👟",\
      "code": "athletic_shoe",\
      "code_ja": "運動靴",\
      "category": "objects",\
      "unicode": "1f45f"\
    },\
    {\
      "moji": "👠",\
      "code": "high_heeled_shoe",\
      "code_ja": "ハイヒール",\
      "category": "objects",\
      "unicode": "1f460"\
    },\
    {\
      "moji": "👡",\
      "code": "womans_sandal",\
      "code_ja": "サンダル",\
      "category": "objects",\
      "unicode": "1f461"\
    },\
    {\
      "moji": "👢",\
      "code": "womans_boots",\
      "code_ja": "ブーツ",\
      "category": "objects",\
      "unicode": "1f462"\
    },\
    {\
      "moji": "👣",\
      "code": "footprints",\
      "code_ja": "足跡",\
      "category": "people",\
      "unicode": "1f463"\
    },\
    {\
      "moji": "👤",\
      "code": "bust_in_silhouette",\
      "code_ja": "人影",\
      "category": "people",\
      "unicode": "1f464"\
    },\
    {\
      "moji": "👥",\
      "code": "busts_in_silhouette",\
      "code_ja": "人影2",\
      "category": "people",\
      "unicode": "1f465"\
    },\
    {\
      "moji": "👦",\
      "code": "boy",\
      "code_ja": "男の子",\
      "category": "people",\
      "unicode": "1f466"\
    },\
    {\
      "moji": "👧",\
      "code": "girl",\
      "code_ja": "女の子",\
      "category": "people",\
      "unicode": "1f467"\
    },\
    {\
      "moji": "👨",\
      "code": "man",\
      "code_ja": "男の人",\
      "category": "people",\
      "unicode": "1f468"\
    },\
    {\
      "moji": "👩",\
      "code": "woman",\
      "code_ja": "女の人",\
      "category": "people",\
      "unicode": "1f469"\
    },\
    {\
      "moji": "👪",\
      "code": "family",\
      "code_ja": "家族",\
      "category": "people",\
      "unicode": "1f46a"\
    },\
    {\
      "moji": "👫",\
      "code": "couple_holding_hands",\
      "code_ja": "手をつないだカップル",\
      "category": "people",\
      "unicode": "1f46b"\
    },\
    {\
      "moji": "👬",\
      "code": "two_men_holding_hands",\
      "code_ja": "手をつないだ二人の男性",\
      "category": "people",\
      "unicode": "1f46c"\
    },\
    {\
      "moji": "👭",\
      "code": "two_women_holding_hands",\
      "code_ja": "手をつないだ二人の女性",\
      "category": "people",\
      "unicode": "1f46d"\
    },\
    {\
      "moji": "👮",\
      "code": "police_officer",\
      "code_ja": "警察官",\
      "category": "people",\
      "unicode": "1f46e"\
    },\
    {\
      "moji": "👯",\
      "code": "woman_with_bunny_ears",\
      "code_ja": "バニーガール",\
      "category": "people",\
      "unicode": "1f46f"\
    },\
    {\
      "moji": "👰",\
      "code": "bride_with_veil",\
      "code_ja": "花嫁",\
      "category": "people",\
      "unicode": "1f470"\
    },\
    {\
      "moji": "👱",\
      "code": "person_with_blond_hair",\
      "code_ja": "白人",\
      "category": "people",\
      "unicode": "1f471"\
    },\
    {\
      "moji": "👲",\
      "code": "man_with_gua_pi_mao",\
      "code_ja": "中国人",\
      "category": "people",\
      "unicode": "1f472"\
    },\
    {\
      "moji": "👳",\
      "code": "man_with_turban",\
      "code_ja": "インド人",\
      "category": "people",\
      "unicode": "1f473"\
    },\
    {\
      "moji": "👴",\
      "code": "older_man",\
      "code_ja": "おじいさん",\
      "category": "people",\
      "unicode": "1f474"\
    },\
    {\
      "moji": "👵",\
      "code": "older_woman",\
      "code_ja": "おばあさん",\
      "category": "people",\
      "unicode": "1f475"\
    },\
    {\
      "moji": "👶",\
      "code": "baby",\
      "code_ja": "赤ちゃん",\
      "category": "people",\
      "unicode": "1f476"\
    },\
    {\
      "moji": "👷",\
      "code": "construction_worker",\
      "code_ja": "工事現場の人",\
      "category": "people",\
      "unicode": "1f477"\
    },\
    {\
      "moji": "👸",\
      "code": "princess",\
      "code_ja": "お姫様",\
      "category": "people",\
      "unicode": "1f478"\
    },\
    {\
      "moji": "👹",\
      "code": "japanese_ogre",\
      "code_ja": "なまはげ",\
      "category": "people",\
      "unicode": "1f479"\
    },\
    {\
      "moji": "👺",\
      "code": "japanese_goblin",\
      "code_ja": "天狗",\
      "category": "people",\
      "unicode": "1f47a"\
    },\
    {\
      "moji": "👻",\
      "code": "ghost",\
      "code_ja": "お化け",\
      "category": "people",\
      "unicode": "1f47b"\
    },\
    {\
      "moji": "👼",\
      "code": "baby_angel",\
      "code_ja": "天使",\
      "category": "people",\
      "unicode": "1f47c"\
    },\
    {\
      "moji": "👽",\
      "code": "extraterrestrial_alien",\
      "code_ja": "宇宙人",\
      "category": "people",\
      "unicode": "1f47d"\
    },\
    {\
      "moji": "👾",\
      "code": "alien_monster",\
      "code_ja": "宇宙怪物",\
      "category": "people",\
      "unicode": "1f47e"\
    },\
    {\
      "moji": "👿",\
      "code": "imp",\
      "code_ja": "悪魔",\
      "category": "people",\
      "unicode": "1f47f"\
    },\
    {\
      "moji": "💀",\
      "code": "skull",\
      "code_ja": "ドクロ",\
      "category": "people",\
      "unicode": "1f480"\
    },\
    {\
      "moji": "💁",\
      "code": "information_desk_person",\
      "code_ja": "案内",\
      "category": "people",\
      "unicode": "1f481"\
    },\
    {\
      "moji": "💂",\
      "code": "guardsman",\
      "code_ja": "衛兵",\
      "category": "people",\
      "unicode": "1f482"\
    },\
    {\
      "moji": "💃",\
      "code": "dancer",\
      "code_ja": "ダンサー",\
      "category": "people",\
      "unicode": "1f483"\
    },\
    {\
      "moji": "💄",\
      "code": "lipstick",\
      "code_ja": "リップスティック",\
      "category": "objects",\
      "unicode": "1f484"\
    },\
    {\
      "moji": "💅",\
      "code": "nail_polish",\
      "code_ja": "ネイル",\
      "category": "objects",\
      "unicode": "1f485"\
    },\
    {\
      "moji": "💆",\
      "code": "face_massage",\
      "code_ja": "エステ",\
      "category": "people",\
      "unicode": "1f486"\
    },\
    {\
      "moji": "💇",\
      "code": "haircut",\
      "code_ja": "美容院",\
      "category": "people",\
      "unicode": "1f487"\
    },\
    {\
      "moji": "💈",\
      "code": "barber_pole",\
      "code_ja": "床屋",\
      "category": "objects",\
      "unicode": "1f488"\
    },\
    {\
      "moji": "💉",\
      "code": "syringe",\
      "code_ja": "注射器",\
      "category": "objects",\
      "unicode": "1f489"\
    },\
    {\
      "moji": "💊",\
      "code": "pill",\
      "code_ja": "薬",\
      "category": "objects",\
      "unicode": "1f48a"\
    },\
    {\
      "moji": "💋",\
      "code": "kiss_mark",\
      "code_ja": "キスマーク",\
      "category": "objects",\
      "unicode": "1f48b"\
    },\
    {\
      "moji": "💌",\
      "code": "love_letter",\
      "code_ja": "ラブレター",\
      "category": "objects",\
      "unicode": "1f48c"\
    },\
    {\
      "moji": "💍",\
      "code": "ring",\
      "code_ja": "指輪",\
      "category": "objects",\
      "unicode": "1f48d"\
    },\
    {\
      "moji": "💎",\
      "code": "gem_stone",\
      "code_ja": "宝石",\
      "category": "objects",\
      "unicode": "1f48e"\
    },\
    {\
      "moji": "💏",\
      "code": "kiss",\
      "code_ja": "カップルのキス",\
      "category": "people",\
      "unicode": "1f48f"\
    },\
    {\
      "moji": "💐",\
      "code": "bouquet",\
      "code_ja": "花束",\
      "category": "objects",\
      "unicode": "1f490"\
    },\
    {\
      "moji": "💑",\
      "code": "couple_with_heart",\
      "code_ja": "カップルとハート",\
      "category": "people",\
      "unicode": "1f491"\
    },\
    {\
      "moji": "💒",\
      "code": "wedding",\
      "code_ja": "結婚式",\
      "category": "abstract",\
      "unicode": "1f492"\
    },\
    {\
      "moji": "💓",\
      "code": "heartbeat",\
      "code_ja": "ドキドキしているハート",\
      "category": "abstract",\
      "unicode": "1f493"\
    },\
    {\
      "moji": "💔",\
      "code": "broken_heart",\
      "code_ja": "ハートブレイク",\
      "category": "abstract",\
      "unicode": "1f494"\
    },\
    {\
      "moji": "💕",\
      "code": "two_hearts",\
      "code_ja": "2つのハート",\
      "category": "abstract",\
      "unicode": "1f495"\
    },\
    {\
      "moji": "💖",\
      "code": "sparkling_heart",\
      "code_ja": "光るハート",\
      "category": "abstract",\
      "unicode": "1f496"\
    },\
    {\
      "moji": "💗",\
      "code": "growing_heart",\
      "code_ja": "ハート(ドキドキ)",\
      "category": "abstract",\
      "unicode": "1f497"\
    },\
    {\
      "moji": "💘",\
      "code": "heart_with_arrow",\
      "code_ja": "矢がささったハート",\
      "category": "abstract",\
      "unicode": "1f498"\
    },\
    {\
      "moji": "💙",\
      "code": "blue_heart",\
      "code_ja": "ハート(青)",\
      "category": "abstract",\
      "unicode": "1f499"\
    },\
    {\
      "moji": "💚",\
      "code": "green_heart",\
      "code_ja": "ハート(緑)",\
      "category": "abstract",\
      "unicode": "1f49a"\
    },\
    {\
      "moji": "💛",\
      "code": "yellow_heart",\
      "code_ja": "ハート(黄)",\
      "category": "abstract",\
      "unicode": "1f49b"\
    },\
    {\
      "moji": "💜",\
      "code": "purple_heart",\
      "code_ja": "ハート(紫)",\
      "category": "abstract",\
      "unicode": "1f49c"\
    },\
    {\
      "moji": "💝",\
      "code": "heart_with_ribbon",\
      "code_ja": "リボンがけのハート",\
      "category": "abstract",\
      "unicode": "1f49d"\
    },\
    {\
      "moji": "💞",\
      "code": "revolving_hearts",\
      "code_ja": "回るハート",\
      "category": "abstract",\
      "unicode": "1f49e"\
    },\
    {\
      "moji": "💟",\
      "code": "heart_decoration",\
      "code_ja": "ハートマーク",\
      "category": "abstract",\
      "unicode": "1f49f"\
    },\
    {\
      "moji": "💡",\
      "code": "electric_light_bulb",\
      "code_ja": "電球",\
      "category": "abstract",\
      "unicode": "1f4a1"\
    },\
    {\
      "moji": "💢",\
      "code": "anger_symbol",\
      "code_ja": "怒りマーク",\
      "category": "abstract",\
      "unicode": "1f4a2"\
    },\
    {\
      "moji": "💣",\
      "code": "bomb",\
      "code_ja": "爆弾",\
      "category": "tools",\
      "unicode": "1f4a3"\
    },\
    {\
      "moji": "💤",\
      "code": "sleeping_symbol",\
      "code_ja": "睡眠マーク",\
      "category": "abstract",\
      "unicode": "1f4a4"\
    },\
    {\
      "moji": "💥",\
      "code": "collision_symbol",\
      "code_ja": "衝撃",\
      "category": "abstract",\
      "unicode": "1f4a5"\
    },\
    {\
      "moji": "💦",\
      "code": "splashing_sweat_symbol",\
      "code_ja": "焦りマーク",\
      "category": "abstract",\
      "unicode": "1f4a6"\
    },\
    {\
      "moji": "💧",\
      "code": "droplet",\
      "code_ja": "汗たらり",\
      "category": "abstract",\
      "unicode": "1f4a7"\
    },\
    {\
      "moji": "💨",\
      "code": "dash_symbol",\
      "code_ja": "ダッシュ",\
      "category": "abstract",\
      "unicode": "1f4a8"\
    },\
    {\
      "moji": "💩",\
      "code": "poop",\
      "code_ja": "うんち(顔あり)",\
      "category": "abstract",\
      "unicode": "1f4a9"\
    },\
    {\
      "moji": "💪",\
      "code": "flexed_biceps",\
      "code_ja": "力こぶ",\
      "category": "abstract",\
      "unicode": "1f4aa"\
    },\
    {\
      "moji": "💫",\
      "code": "dizzy_symbol",\
      "code_ja": "目が回る",\
      "category": "abstract",\
      "unicode": "1f4ab"\
    },\
    {\
      "moji": "💬",\
      "code": "speech_balloon",\
      "code_ja": "フキダシ",\
      "category": "abstract",\
      "unicode": "1f4ac"\
    },\
    {\
      "moji": "💭",\
      "code": "thought_balloon",\
      "code_ja": "フキダシ2",\
      "category": "abstract",\
      "unicode": "1f4ad"\
    },\
    {\
      "moji": "💮",\
      "code": "white_flower",\
      "code_ja": "よくできました",\
      "category": "abstract",\
      "unicode": "1f4ae"\
    },\
    {\
      "moji": "💯",\
      "code": "hundred_points_symbol",\
      "code_ja": "100点満点",\
      "category": "abstract",\
      "unicode": "1f4af"\
    },\
    {\
      "moji": "💰",\
      "code": "money_bag",\
      "code_ja": "ドル袋",\
      "category": "objects",\
      "unicode": "1f4b0"\
    },\
    {\
      "moji": "💱",\
      "code": "currency_exchange",\
      "code_ja": "為替",\
      "category": "abstract",\
      "unicode": "1f4b1"\
    },\
    {\
      "moji": "💲",\
      "code": "heavy_dollar_sign",\
      "code_ja": "ドル",\
      "category": "abstract",\
      "unicode": "1f4b2"\
    },\
    {\
      "moji": "💳",\
      "code": "credit_card",\
      "code_ja": "クレジットカード",\
      "category": "objects",\
      "unicode": "1f4b3"\
    },\
    {\
      "moji": "💴",\
      "code": "banknote_with_yen_sign",\
      "code_ja": "お札",\
      "category": "objects",\
      "unicode": "1f4b4"\
    },\
    {\
      "moji": "💵",\
      "code": "banknote_with_dollar_sign",\
      "code_ja": "ドル札",\
      "category": "objects",\
      "unicode": "1f4b5"\
    },\
    {\
      "moji": "💶",\
      "code": "banknote_with_euro_sign",\
      "code_ja": "ユーロ札",\
      "category": "objects",\
      "unicode": "1f4b6"\
    },\
    {\
      "moji": "💷",\
      "code": "banknote_with_pound_sign",\
      "code_ja": "ポンド札",\
      "category": "objects",\
      "unicode": "1f4b7"\
    },\
    {\
      "moji": "💸",\
      "code": "money_with_wings",\
      "code_ja": "飛んでいくお金",\
      "category": "objects",\
      "unicode": "1f4b8"\
    },\
    {\
      "moji": "💹",\
      "code": "chart_with_upwards_trend_and_yen_sign",\
      "code_ja": "株価",\
      "category": "abstract",\
      "unicode": "1f4b9"\
    },\
    {\
      "moji": "💺",\
      "code": "seat",\
      "code_ja": "イス",\
      "category": "objects",\
      "unicode": "1f4ba"\
    },\
    {\
      "moji": "💻",\
      "code": "personal_computer",\
      "code_ja": "パソコン",\
      "category": "objects",\
      "unicode": "1f4bb"\
    },\
    {\
      "moji": "💼",\
      "code": "briefcase",\
      "code_ja": "仕事カバン",\
      "category": "objects",\
      "unicode": "1f4bc"\
    },\
    {\
      "moji": "💽",\
      "code": "minidisc",\
      "code_ja": "MD",\
      "category": "objects",\
      "unicode": "1f4bd"\
    },\
    {\
      "moji": "💾",\
      "code": "floppy_disc",\
      "code_ja": "フロッピーディスク",\
      "category": "objects",\
      "unicode": "1f4be"\
    },\
    {\
      "moji": "💿",\
      "code": "optical_disc",\
      "code_ja": "CD",\
      "category": "objects",\
      "unicode": "1f4bf"\
    },\
    {\
      "moji": "📀",\
      "code": "dvd",\
      "code_ja": "DVD",\
      "category": "objects",\
      "unicode": "1f4c0"\
    },\
    {\
      "moji": "📁",\
      "code": "file_folder",\
      "code_ja": "フォルダ(閉)",\
      "category": "objects",\
      "unicode": "1f4c1"\
    },\
    {\
      "moji": "📂",\
      "code": "open_file_folder",\
      "code_ja": "フォルダ(開)",\
      "category": "objects",\
      "unicode": "1f4c2"\
    },\
    {\
      "moji": "📃",\
      "code": "page_with_curl",\
      "code_ja": "文書",\
      "category": "objects",\
      "unicode": "1f4c3"\
    },\
    {\
      "moji": "📄",\
      "code": "page_facing_up",\
      "code_ja": "文書2",\
      "category": "objects",\
      "unicode": "1f4c4"\
    },\
    {\
      "moji": "📅",\
      "code": "calendar",\
      "code_ja": "カレンダー",\
      "category": "objects",\
      "unicode": "1f4c5"\
    },\
    {\
      "moji": "📆",\
      "code": "tear_off_calendar",\
      "code_ja": "日めくりカレンダー",\
      "category": "objects",\
      "unicode": "1f4c6"\
    },\
    {\
      "moji": "📇",\
      "code": "card_index",\
      "code_ja": "インデックスカード",\
      "category": "objects",\
      "unicode": "1f4c7"\
    },\
    {\
      "moji": "📈",\
      "code": "chart_with_upwards_trend",\
      "code_ja": "折れ線グラフ(右肩上がり)",\
      "category": "abstract",\
      "unicode": "1f4c8"\
    },\
    {\
      "moji": "📉",\
      "code": "chart_with_downwards_trend",\
      "code_ja": "折れ線グラフ(右肩下がり)",\
      "category": "abstract",\
      "unicode": "1f4c9"\
    },\
    {\
      "moji": "📊",\
      "code": "bar_chart",\
      "code_ja": "棒グラフ",\
      "category": "abstract",\
      "unicode": "1f4ca"\
    },\
    {\
      "moji": "📋",\
      "code": "clipboard",\
      "code_ja": "クリップボード",\
      "category": "objects",\
      "unicode": "1f4cb"\
    },\
    {\
      "moji": "📌",\
      "code": "pushpin",\
      "code_ja": "画鋲",\
      "category": "objects",\
      "unicode": "1f4cc"\
    },\
    {\
      "moji": "📍",\
      "code": "round_pushpin",\
      "code_ja": "プッシュピン",\
      "category": "objects",\
      "unicode": "1f4cd"\
    },\
    {\
      "moji": "📎",\
      "code": "paperclip",\
      "code_ja": "クリップ",\
      "category": "objects",\
      "unicode": "1f4ce"\
    },\
    {\
      "moji": "📏",\
      "code": "straight_ruler",\
      "code_ja": "定規",\
      "category": "objects",\
      "unicode": "1f4cf"\
    },\
    {\
      "moji": "📐",\
      "code": "triangular_ruler",\
      "code_ja": "三角定規",\
      "category": "objects",\
      "unicode": "1f4d0"\
    },\
    {\
      "moji": "📑",\
      "code": "bookmark_tabs",\
      "code_ja": "付箋",\
      "category": "objects",\
      "unicode": "1f4d1"\
    },\
    {\
      "moji": "📒",\
      "code": "ledger",\
      "code_ja": "台帳",\
      "category": "objects",\
      "unicode": "1f4d2"\
    },\
    {\
      "moji": "📓",\
      "code": "notebook",\
      "code_ja": "ノート",\
      "category": "objects",\
      "unicode": "1f4d3"\
    },\
    {\
      "moji": "📔",\
      "code": "notebook_with_decorative_cover",\
      "code_ja": "ノート2",\
      "category": "objects",\
      "unicode": "1f4d4"\
    },\
    {\
      "moji": "📕",\
      "code": "closed_book",\
      "code_ja": "閉じられた本",\
      "category": "objects",\
      "unicode": "1f4d5"\
    },\
    {\
      "moji": "📖",\
      "code": "open_book",\
      "code_ja": "開かれた本",\
      "category": "objects",\
      "unicode": "1f4d6"\
    },\
    {\
      "moji": "📗",\
      "code": "green_book",\
      "code_ja": "本(緑)",\
      "category": "objects",\
      "unicode": "1f4d7"\
    },\
    {\
      "moji": "📘",\
      "code": "blue_book",\
      "code_ja": "本(青)",\
      "category": "objects",\
      "unicode": "1f4d8"\
    },\
    {\
      "moji": "📙",\
      "code": "orange_book",\
      "code_ja": "本(オレンジ)",\
      "category": "objects",\
      "unicode": "1f4d9"\
    },\
    {\
      "moji": "📚",\
      "code": "books",\
      "code_ja": "本(複数)",\
      "category": "objects",\
      "unicode": "1f4da"\
    },\
    {\
      "moji": "📛",\
      "code": "name_badge",\
      "code_ja": "名札",\
      "category": "objects",\
      "unicode": "1f4db"\
    },\
    {\
      "moji": "📜",\
      "code": "scroll",\
      "code_ja": "スクロール",\
      "category": "objects",\
      "unicode": "1f4dc"\
    },\
    {\
      "moji": "📝",\
      "code": "memo",\
      "code_ja": "メモ",\
      "category": "objects",\
      "unicode": "1f4dd"\
    },\
    {\
      "moji": "📞",\
      "code": "telephone_receiver",\
      "code_ja": "受話器",\
      "category": "objects",\
      "unicode": "1f4de"\
    },\
    {\
      "moji": "📟",\
      "code": "pager",\
      "code_ja": "ポケットベル",\
      "category": "objects",\
      "unicode": "1f4df"\
    },\
    {\
      "moji": "📠",\
      "code": "fax_machine",\
      "code_ja": "FAX",\
      "category": "objects",\
      "unicode": "1f4e0"\
    },\
    {\
      "moji": "📡",\
      "code": "satellite_antenna",\
      "code_ja": "アンテナ",\
      "category": "objects",\
      "unicode": "1f4e1"\
    },\
    {\
      "moji": "📢",\
      "code": "public_address_loudspeaker",\
      "code_ja": "拡声器",\
      "category": "objects",\
      "unicode": "1f4e2"\
    },\
    {\
      "moji": "📣",\
      "code": "cheering_megaphone",\
      "code_ja": "メガホン",\
      "category": "objects",\
      "unicode": "1f4e3"\
    },\
    {\
      "moji": "📤",\
      "code": "outbox_tray",\
      "code_ja": "送信BOX",\
      "category": "abstract",\
      "unicode": "1f4e4"\
    },\
    {\
      "moji": "📥",\
      "code": "inbox_tray",\
      "code_ja": "受信BOX",\
      "category": "abstract",\
      "unicode": "1f4e5"\
    },\
    {\
      "moji": "📦",\
      "code": "package",\
      "code_ja": "プレゼント2",\
      "category": "objects",\
      "unicode": "1f4e6"\
    },\
    {\
      "moji": "📧",\
      "code": "e_mail_symbol",\
      "code_ja": "eメール",\
      "category": "abstract",\
      "unicode": "1f4e7"\
    },\
    {\
      "moji": "📨",\
      "code": "incoming_envelope",\
      "code_ja": "封筒2",\
      "category": "objects",\
      "unicode": "1f4e8"\
    },\
    {\
      "moji": "📩",\
      "code": "envelope_with_downwards_arrow_above",\
      "code_ja": "メール送信",\
      "category": "abstract",\
      "unicode": "1f4e9"\
    },\
    {\
      "moji": "📪",\
      "code": "closed_mailbox_with_lowered_flag",\
      "code_ja": "メールボックス",\
      "category": "objects",\
      "unicode": "1f4ea"\
    },\
    {\
      "moji": "📫",\
      "code": "closed_mailbox_with_raised_flag",\
      "code_ja": "メールボックス2",\
      "category": "objects",\
      "unicode": "1f4eb"\
    },\
    {\
      "moji": "📬",\
      "code": "open_mailbox_with_raised_flag",\
      "code_ja": "メールボックス3",\
      "category": "objects",\
      "unicode": "1f4ec"\
    },\
    {\
      "moji": "📭",\
      "code": "open_mailbox_with_lowered_flag",\
      "code_ja": "メールボックス4",\
      "category": "objects",\
      "unicode": "1f4ed"\
    },\
    {\
      "moji": "📮",\
      "code": "postbox",\
      "code_ja": "ポスト",\
      "category": "objects",\
      "unicode": "1f4ee"\
    },\
    {\
      "moji": "📯",\
      "code": "postal_horn",\
      "code_ja": "ポストホルン",\
      "category": "objects",\
      "unicode": "1f4ef"\
    },\
    {\
      "moji": "📰",\
      "code": "newspaper",\
      "code_ja": "新聞",\
      "category": "objects",\
      "unicode": "1f4f0"\
    },\
    {\
      "moji": "📱",\
      "code": "mobile_phone",\
      "code_ja": "携帯電話",\
      "category": "objects",\
      "unicode": "1f4f1"\
    },\
    {\
      "moji": "📲",\
      "code": "mobile_phone_with_rightwards_arrow_at_left",\
      "code_ja": "終了",\
      "category": "symbols",\
      "unicode": "1f4f2"\
    },\
    {\
      "moji": "📳",\
      "code": "vibration_mode",\
      "code_ja": "マナーモード",\
      "category": "symbols",\
      "unicode": "1f4f3"\
    },\
    {\
      "moji": "📴",\
      "code": "mobile_phone_off",\
      "code_ja": "電源OFF",\
      "category": "symbols",\
      "unicode": "1f4f4"\
    },\
    {\
      "moji": "📵",\
      "code": "no_mobile_phones",\
      "code_ja": "使用禁止",\
      "category": "symbols",\
      "unicode": "1f4f5"\
    },\
    {\
      "moji": "📶",\
      "code": "antenna_with_bars",\
      "code_ja": "電波状況",\
      "category": "abstract",\
      "unicode": "1f4f6"\
    },\
    {\
      "moji": "📷",\
      "code": "camera",\
      "code_ja": "カメラ",\
      "category": "objects",\
      "unicode": "1f4f7"\
    },\
    {\
      "moji": "📹",\
      "code": "video_camera",\
      "code_ja": "ハンディカム",\
      "category": "objects",\
      "unicode": "1f4f9"\
    },\
    {\
      "moji": "📺",\
      "code": "television",\
      "code_ja": "テレビ",\
      "category": "objects",\
      "unicode": "1f4fa"\
    },\
    {\
      "moji": "📻",\
      "code": "radio",\
      "code_ja": "ラジオ",\
      "category": "objects",\
      "unicode": "1f4fb"\
    },\
    {\
      "moji": "📼",\
      "code": "videocassette",\
      "code_ja": "ビデオテープ",\
      "category": "objects",\
      "unicode": "1f4fc"\
    },\
    {\
      "moji": "🔀",\
      "code": "twisted_rightwards_arrows",\
      "code_ja": "ランダム",\
      "category": "abstract",\
      "unicode": "1f500"\
    },\
    {\
      "moji": "🔁",\
      "code": "clockwise_rightwards_and_leftwards_open_circle_arrows",\
      "code_ja": "リピート",\
      "category": "abstract",\
      "unicode": "1f501"\
    },\
    {\
      "moji": "🔂",\
      "code": "clockwise_rightwards_and_leftwards_open_circle_arrows_with_circled_one_overlay",\
      "code_ja": "1曲リピート",\
      "category": "abstract",\
      "unicode": "1f502"\
    },\
    {\
      "moji": "🔃",\
      "code": "clockwise_downwards_and_upwards_open_circle_arrows",\
      "code_ja": "再読み込み",\
      "category": "abstract",\
      "unicode": "1f503"\
    },\
    {\
      "moji": "🔄",\
      "code": "anticlockwise_downwards_and_upwards_open_circle_arrows",\
      "code_ja": "読み込み中",\
      "category": "abstract",\
      "unicode": "1f504"\
    },\
    {\
      "moji": "🔅",\
      "code": "low_brightness_symbol",\
      "code_ja": "明るさ(暗)",\
      "category": "abstract",\
      "unicode": "1f505"\
    },\
    {\
      "moji": "🔆",\
      "code": "high_brightness_symbol",\
      "code_ja": "明るさ(明)",\
      "category": "abstract",\
      "unicode": "1f506"\
    },\
    {\
      "moji": "🔇",\
      "code": "speaker_with_cancellation_stroke",\
      "code_ja": "ミュート",\
      "category": "abstract",\
      "unicode": "1f507"\
    },\
    {\
      "moji": "🔈",\
      "code": "speaker",\
      "code_ja": "スピーカー",\
      "category": "objects",\
      "unicode": "1f508"\
    },\
    {\
      "moji": "🔉",\
      "code": "speaker_with_one_sound_wave",\
      "code_ja": "音量(小)",\
      "category": "abstract",\
      "unicode": "1f509"\
    },\
    {\
      "moji": "🔊",\
      "code": "speaker_with_three_sound_waves",\
      "code_ja": "音量(大)",\
      "category": "abstract",\
      "unicode": "1f50a"\
    },\
    {\
      "moji": "🔋",\
      "code": "battery",\
      "code_ja": "バッテリー",\
      "category": "objects",\
      "unicode": "1f50b"\
    },\
    {\
      "moji": "🔌",\
      "code": "electric_plug",\
      "code_ja": "コンセント",\
      "category": "objects",\
      "unicode": "1f50c"\
    },\
    {\
      "moji": "🔍",\
      "code": "left_pointing_magnifying_glass",\
      "code_ja": "虫めがね",\
      "category": "objects",\
      "unicode": "1f50d"\
    },\
    {\
      "moji": "🔎",\
      "code": "right_pointing_magnifying_glass",\
      "code_ja": "調べる",\
      "category": "objects",\
      "unicode": "1f50e"\
    },\
    {\
      "moji": "🔏",\
      "code": "lock_with_ink_pen",\
      "code_ja": "ロック2",\
      "category": "objects",\
      "unicode": "1f50f"\
    },\
    {\
      "moji": "🔐",\
      "code": "closed_lock_with_key",\
      "code_ja": "ロック3",\
      "category": "objects",\
      "unicode": "1f510"\
    },\
    {\
      "moji": "🔑",\
      "code": "key",\
      "code_ja": "鍵",\
      "category": "objects",\
      "unicode": "1f511"\
    },\
    {\
      "moji": "🔒",\
      "code": "lock",\
      "code_ja": "ロック",\
      "category": "objects",\
      "unicode": "1f512"\
    },\
    {\
      "moji": "🔓",\
      "code": "open_lock",\
      "code_ja": "ロック(解除)",\
      "category": "objects",\
      "unicode": "1f513"\
    },\
    {\
      "moji": "🔔",\
      "code": "bell",\
      "code_ja": "ベル",\
      "category": "objects",\
      "unicode": "1f514"\
    },\
    {\
      "moji": "🔕",\
      "code": "bell_with_cancellation_stroke",\
      "code_ja": "サウンドオフ",\
      "category": "abstract",\
      "unicode": "1f515"\
    },\
    {\
      "moji": "🔖",\
      "code": "bookmark",\
      "code_ja": "ブックマーク",\
      "category": "abstract",\
      "unicode": "1f516"\
    },\
    {\
      "moji": "🔗",\
      "code": "link_symbol",\
      "code_ja": "リンク",\
      "category": "abstract",\
      "unicode": "1f517"\
    },\
    {\
      "moji": "🔘",\
      "code": "radio_button",\
      "code_ja": "ラジオボタン",\
      "category": "abstract",\
      "unicode": "1f518"\
    },\
    {\
      "moji": "🔙",\
      "code": "back_with_leftwards_arrow_above",\
      "code_ja": "BACK",\
      "category": "abstract",\
      "unicode": "1f519"\
    },\
    {\
      "moji": "🔚",\
      "code": "end_with_leftwards_arrow_above",\
      "code_ja": "END",\
      "category": "abstract",\
      "unicode": "1f51a"\
    },\
    {\
      "moji": "🔛",\
      "code": "on_with_exclamation_mark_with_left_right_arrow_above",\
      "code_ja": "ON",\
      "category": "abstract",\
      "unicode": "1f51b"\
    },\
    {\
      "moji": "🔜",\
      "code": "soon_with_rightwards_arrow_above",\
      "code_ja": "SOON",\
      "category": "abstract",\
      "unicode": "1f51c"\
    },\
    {\
      "moji": "🔝",\
      "code": "top_with_upwards_arrow_above",\
      "code_ja": "TOP",\
      "category": "abstract",\
      "unicode": "1f51d"\
    },\
    {\
      "moji": "🔞",\
      "code": "no_one_under_eighteen_symbol",\
      "code_ja": "18禁",\
      "category": "abstract",\
      "unicode": "1f51e"\
    },\
    {\
      "moji": "🔟",\
      "code": "keycap_ten",\
      "code_ja": "10",\
      "category": "symbols",\
      "unicode": "1f51f"\
    },\
    {\
      "moji": "🔠",\
      "code": "input_symbol_for_latin_capital_letters",\
      "code_ja": "大文字",\
      "category": "abstract",\
      "unicode": "1f520"\
    },\
    {\
      "moji": "🔡",\
      "code": "input_symbol_for_latin_small_letters",\
      "code_ja": "小文字",\
      "category": "abstract",\
      "unicode": "1f521"\
    },\
    {\
      "moji": "🔢",\
      "code": "input_symbol_for_numbers",\
      "code_ja": "数字",\
      "category": "abstract",\
      "unicode": "1f522"\
    },\
    {\
      "moji": "🔣",\
      "code": "input_symbol_for_symbols",\
      "code_ja": "記号",\
      "category": "abstract",\
      "unicode": "1f523"\
    },\
    {\
      "moji": "🔤",\
      "code": "input_symbol_for_latin_letters",\
      "code_ja": "ABC",\
      "category": "abstract",\
      "unicode": "1f524"\
    },\
    {\
      "moji": "🔥",\
      "code": "fire",\
      "code_ja": "炎",\
      "category": "abstract",\
      "unicode": "1f525"\
    },\
    {\
      "moji": "🔦",\
      "code": "electric_torch",\
      "code_ja": "懐中電灯",\
      "category": "tools",\
      "unicode": "1f526"\
    },\
    {\
      "moji": "🔧",\
      "code": "wrench",\
      "code_ja": "レンチ",\
      "category": "tools",\
      "unicode": "1f527"\
    },\
    {\
      "moji": "🔨",\
      "code": "hammer",\
      "code_ja": "ハンマー",\
      "category": "tools",\
      "unicode": "1f528"\
    },\
    {\
      "moji": "🔩",\
      "code": "nut_and_bolt",\
      "code_ja": "ボルト＆ナット",\
      "category": "tools",\
      "unicode": "1f529"\
    },\
    {\
      "moji": "🔪",\
      "code": "houchou",\
      "code_ja": "包丁",\
      "category": "tools",\
      "unicode": "1f52a"\
    },\
    {\
      "moji": "🔫",\
      "code": "pistol",\
      "code_ja": "ピストル",\
      "category": "tools",\
      "unicode": "1f52b"\
    },\
    {\
      "moji": "🔬",\
      "code": "microscope",\
      "code_ja": "顕微鏡",\
      "category": "tools",\
      "unicode": "1f52c"\
    },\
    {\
      "moji": "🔭",\
      "code": "telescope",\
      "code_ja": "望遠鏡",\
      "category": "tools",\
      "unicode": "1f52d"\
    },\
    {\
      "moji": "🔮",\
      "code": "crystal_ball",\
      "code_ja": "水晶玉",\
      "category": "objects",\
      "unicode": "1f52e"\
    },\
    {\
      "moji": "🔯",\
      "code": "six_pointed_star_with_middle_dot",\
      "code_ja": "六芒星",\
      "category": "objects",\
      "unicode": "1f52f"\
    },\
    {\
      "moji": "🔰",\
      "code": "japanese_symbol_for_beginner",\
      "code_ja": "若葉マーク",\
      "category": "objects",\
      "unicode": "1f530"\
    },\
    {\
      "moji": "🔱",\
      "code": "trident_emblem",\
      "code_ja": "紋章",\
      "category": "objects",\
      "unicode": "1f531"\
    },\
    {\
      "moji": "🔲",\
      "code": "black_square_button",\
      "code_ja": "四角ボタン(黒)",\
      "category": "abstract",\
      "unicode": "1f532"\
    },\
    {\
      "moji": "🔳",\
      "code": "white_square_button",\
      "code_ja": "四角ボタン(白)",\
      "category": "abstract",\
      "unicode": "1f533"\
    },\
    {\
      "moji": "🔴",\
      "code": "large_red_circle",\
      "code_ja": "大丸(赤)",\
      "category": "abstract",\
      "unicode": "1f534"\
    },\
    {\
      "moji": "🔵",\
      "code": "large_blue_circle",\
      "code_ja": "大丸(青)",\
      "category": "abstract",\
      "unicode": "1f535"\
    },\
    {\
      "moji": "🔶",\
      "code": "large_orange_diamond",\
      "code_ja": "大菱形(オレンジ)",\
      "category": "abstract",\
      "unicode": "1f536"\
    },\
    {\
      "moji": "🔷",\
      "code": "large_blue_diamond",\
      "code_ja": "大菱形(青)",\
      "category": "abstract",\
      "unicode": "1f537"\
    },\
    {\
      "moji": "🔸",\
      "code": "small_orange_diamond",\
      "code_ja": "小菱形(オレンジ)",\
      "category": "abstract",\
      "unicode": "1f538"\
    },\
    {\
      "moji": "🔹",\
      "code": "small_blue_diamond",\
      "code_ja": "小菱形(青)",\
      "category": "abstract",\
      "unicode": "1f539"\
    },\
    {\
      "moji": "🔺",\
      "code": "up_pointing_red_triangle",\
      "code_ja": "上向き三角3",\
      "category": "abstract",\
      "unicode": "1f53a"\
    },\
    {\
      "moji": "🔻",\
      "code": "down_pointing_red_triangle",\
      "code_ja": "下向き三角3",\
      "category": "abstract",\
      "unicode": "1f53b"\
    },\
    {\
      "moji": "🔼",\
      "code": "up_pointing_small_red_triangle",\
      "code_ja": "上向き三角",\
      "category": "abstract",\
      "unicode": "1f53c"\
    },\
    {\
      "moji": "🔽",\
      "code": "down_pointing_small_red_triangle",\
      "code_ja": "下向き三角",\
      "category": "abstract",\
      "unicode": "1f53d"\
    },\
    {\
      "moji": "🕐",\
      "code": "clock_face_one_oclock",\
      "code_ja": "1時",\
      "category": "objects",\
      "unicode": "1f550"\
    },\
    {\
      "moji": "🕑",\
      "code": "clock_face_two_oclock",\
      "code_ja": "2時",\
      "category": "objects",\
      "unicode": "1f551"\
    },\
    {\
      "moji": "🕒",\
      "code": "clock_face_three_oclock",\
      "code_ja": "3時",\
      "category": "objects",\
      "unicode": "1f552"\
    },\
    {\
      "moji": "🕓",\
      "code": "clock_face_four_oclock",\
      "code_ja": "4時",\
      "category": "objects",\
      "unicode": "1f553"\
    },\
    {\
      "moji": "🕔",\
      "code": "clock_face_five_oclock",\
      "code_ja": "5時",\
      "category": "objects",\
      "unicode": "1f554"\
    },\
    {\
      "moji": "🕕",\
      "code": "clock_face_six_oclock",\
      "code_ja": "6時",\
      "category": "objects",\
      "unicode": "1f555"\
    },\
    {\
      "moji": "🕖",\
      "code": "clock_face_seven_oclock",\
      "code_ja": "7時",\
      "category": "objects",\
      "unicode": "1f556"\
    },\
    {\
      "moji": "🕗",\
      "code": "clock_face_eight_oclock",\
      "code_ja": "8時",\
      "category": "objects",\
      "unicode": "1f557"\
    },\
    {\
      "moji": "🕘",\
      "code": "clock_face_nine_oclock",\
      "code_ja": "9時",\
      "category": "objects",\
      "unicode": "1f558"\
    },\
    {\
      "moji": "🕙",\
      "code": "clock_face_ten_oclock",\
      "code_ja": "10時",\
      "category": "objects",\
      "unicode": "1f559"\
    },\
    {\
      "moji": "🕚",\
      "code": "clock_face_eleven_oclock",\
      "code_ja": "11時",\
      "category": "objects",\
      "unicode": "1f55a"\
    },\
    {\
      "moji": "🕛",\
      "code": "clock_face_twelve_oclock",\
      "code_ja": "12時",\
      "category": "objects",\
      "unicode": "1f55b"\
    },\
    {\
      "moji": "🕜",\
      "code": "clock_face_one_thirty",\
      "code_ja": "1時半",\
      "category": "objects",\
      "unicode": "1f55c"\
    },\
    {\
      "moji": "🕝",\
      "code": "clock_face_two_thirty",\
      "code_ja": "2時半",\
      "category": "objects",\
      "unicode": "1f55d"\
    },\
    {\
      "moji": "🕞",\
      "code": "clock_face_three_thirty",\
      "code_ja": "3時半",\
      "category": "objects",\
      "unicode": "1f55e"\
    },\
    {\
      "moji": "🕟",\
      "code": "clock_face_four_thirty",\
      "code_ja": "4時半",\
      "category": "objects",\
      "unicode": "1f55f"\
    },\
    {\
      "moji": "🕠",\
      "code": "clock_face_five_thirty",\
      "code_ja": "5時半",\
      "category": "objects",\
      "unicode": "1f560"\
    },\
    {\
      "moji": "🕡",\
      "code": "clock_face_six_thirty",\
      "code_ja": "6時半",\
      "category": "objects",\
      "unicode": "1f561"\
    },\
    {\
      "moji": "🕢",\
      "code": "clock_face_seven_thirty",\
      "code_ja": "7時半",\
      "category": "objects",\
      "unicode": "1f562"\
    },\
    {\
      "moji": "🕣",\
      "code": "clock_face_eight_thirty",\
      "code_ja": "8時半",\
      "category": "objects",\
      "unicode": "1f563"\
    },\
    {\
      "moji": "🕤",\
      "code": "clock_face_nine_thirty",\
      "code_ja": "9時半",\
      "category": "objects",\
      "unicode": "1f564"\
    },\
    {\
      "moji": "🕥",\
      "code": "clock_face_ten_thirty",\
      "code_ja": "10時半",\
      "category": "objects",\
      "unicode": "1f565"\
    },\
    {\
      "moji": "🕦",\
      "code": "clock_face_eleven_thirty",\
      "code_ja": "11時半",\
      "category": "objects",\
      "unicode": "1f566"\
    },\
    {\
      "moji": "🕧",\
      "code": "clock_face_twelve_thirty",\
      "code_ja": "12時半",\
      "category": "objects",\
      "unicode": "1f567"\
    },\
    {\
      "moji": "🗻",\
      "code": "mount_fuji",\
      "code_ja": "富士山",\
      "category": "nature",\
      "unicode": "1f5fb"\
    },\
    {\
      "moji": "🗼",\
      "code": "tokyo_tower",\
      "code_ja": "東京タワー",\
      "category": "objects",\
      "unicode": "1f5fc"\
    },\
    {\
      "moji": "🗽",\
      "code": "statue_of_liberty",\
      "code_ja": "自由の女神",\
      "category": "objects",\
      "unicode": "1f5fd"\
    },\
    {\
      "moji": "🗾",\
      "code": "silhouette_of_japan",\
      "code_ja": "日本",\
      "category": "nature",\
      "unicode": "1f5fe"\
    },\
    {\
      "moji": "🗿",\
      "code": "moyai",\
      "code_ja": "モアイ像",\
      "category": "objects",\
      "unicode": "1f5ff"\
    },\
    {\
      "moji": "😀",\
      "code": "grinning",\
      "code_ja": "にんまり",\
      "category": "faces",\
      "unicode": "1f600"\
    },\
    {\
      "moji": "😁",\
      "code": "grin",\
      "code_ja": "うっしっし",\
      "category": "faces",\
      "unicode": "1f601"\
    },\
    {\
      "moji": "😂",\
      "code": "face_with_tears_of_joy",\
      "code_ja": "泣き笑い",\
      "category": "faces",\
      "unicode": "1f602"\
    },\
    {\
      "moji": "😃",\
      "code": "smiley",\
      "code_ja": "スマイル",\
      "category": "faces",\
      "unicode": "1f603"\
    },\
    {\
      "moji": "😄",\
      "code": "smile",\
      "code_ja": "嬉しい顔",\
      "category": "faces",\
      "unicode": "1f604"\
    },\
    {\
      "moji": "😅",\
      "code": "sweat_smile",\
      "code_ja": "冷や汗",\
      "category": "faces",\
      "unicode": "1f605"\
    },\
    {\
      "moji": "😆",\
      "code": "laughing",\
      "code_ja": "笑い",\
      "category": "faces",\
      "unicode": "1f606"\
    },\
    {\
      "moji": "😇",\
      "code": "smiling_face_with_halo",\
      "code_ja": "天使の笑顔",\
      "category": "faces",\
      "unicode": "1f607"\
    },\
    {\
      "moji": "😈",\
      "code": "smiling_face_with_horns",\
      "code_ja": "怒り(悪魔)",\
      "category": "faces",\
      "unicode": "1f608"\
    },\
    {\
      "moji": "😉",\
      "code": "wink",\
      "code_ja": "ウインク",\
      "category": "faces",\
      "unicode": "1f609"\
    },\
    {\
      "moji": "😊",\
      "code": "blush",\
      "code_ja": "にこにこ",\
      "category": "faces",\
      "unicode": "1f60a"\
    },\
    {\
      "moji": "😋",\
      "code": "face_savouring_delicious_food",\
      "code_ja": "うまい",\
      "category": "faces",\
      "unicode": "1f60b"\
    },\
    {\
      "moji": "😌",\
      "code": "relieved",\
      "code_ja": "ほっとした顔",\
      "category": "faces",\
      "unicode": "1f60c"\
    },\
    {\
      "moji": "😍",\
      "code": "heart_eyes",\
      "code_ja": "目がハート",\
      "category": "faces",\
      "unicode": "1f60d"\
    },\
    {\
      "moji": "😎",\
      "code": "smiling_face_with_sunglasses",\
      "code_ja": "キリッ",\
      "category": "faces",\
      "unicode": "1f60e"\
    },\
    {\
      "moji": "😏",\
      "code": "smirk",\
      "code_ja": "ふっ",\
      "category": "faces",\
      "unicode": "1f60f"\
    },\
    {\
      "moji": "😐",\
      "code": "neutral_face",\
      "code_ja": "普通の顔",\
      "category": "faces",\
      "unicode": "1f610"\
    },\
    {\
      "moji": "😑",\
      "code": "expressionless",\
      "code_ja": "ぼけーっとした顔",\
      "category": "faces",\
      "unicode": "1f611"\
    },\
    {\
      "moji": "😒",\
      "code": "unamused",\
      "code_ja": "横目",\
      "category": "faces",\
      "unicode": "1f612"\
    },\
    {\
      "moji": "😓",\
      "code": "sweat",\
      "code_ja": "困り顔",\
      "category": "faces",\
      "unicode": "1f613"\
    },\
    {\
      "moji": "😔",\
      "code": "pensive_face",\
      "code_ja": "しょんぼり",\
      "category": "faces",\
      "unicode": "1f614"\
    },\
    {\
      "moji": "😕",\
      "code": "confused",\
      "code_ja": "困る",\
      "category": "faces",\
      "unicode": "1f615"\
    },\
    {\
      "moji": "😖",\
      "code": "confounded_face",\
      "code_ja": "混乱",\
      "category": "faces",\
      "unicode": "1f616"\
    },\
    {\
      "moji": "😗",\
      "code": "kissing",\
      "code_ja": "チュー",\
      "category": "faces",\
      "unicode": "1f617"\
    },\
    {\
      "moji": "😘",\
      "code": "kissing_heart",\
      "code_ja": "投げキッス",\
      "category": "faces",\
      "unicode": "1f618"\
    },\
    {\
      "moji": "😙",\
      "code": "kissing_smiling_eyes",\
      "code_ja": "チューしよ",\
      "category": "faces",\
      "unicode": "1f619"\
    },\
    {\
      "moji": "😚",\
      "code": "kissing_closed_eyes",\
      "code_ja": "チュッ",\
      "category": "faces",\
      "unicode": "1f61a"\
    },\
    {\
      "moji": "😛",\
      "code": "stuck_out_tongue",\
      "code_ja": "べー",\
      "category": "faces",\
      "unicode": "1f61b"\
    },\
    {\
      "moji": "😜",\
      "code": "stuck_out_tongue_winking_eye",\
      "code_ja": "あっかんべー",\
      "category": "faces",\
      "unicode": "1f61c"\
    },\
    {\
      "moji": "😝",\
      "code": "stuck_out_tongue_closed_eyes",\
      "code_ja": "べーっ",\
      "category": "faces",\
      "unicode": "1f61d"\
    },\
    {\
      "moji": "😞",\
      "code": "disappointed_face",\
      "code_ja": "がっかり",\
      "category": "faces",\
      "unicode": "1f61e"\
    },\
    {\
      "moji": "😟",\
      "code": "worried",\
      "code_ja": "心配",\
      "category": "faces",\
      "unicode": "1f61f"\
    },\
    {\
      "moji": "😠",\
      "code": "angry_face",\
      "code_ja": "怒った顔",\
      "category": "faces",\
      "unicode": "1f620"\
    },\
    {\
      "moji": "😡",\
      "code": "pouting_face",\
      "code_ja": "ふくれっ面",\
      "category": "faces",\
      "unicode": "1f621"\
    },\
    {\
      "moji": "😢",\
      "code": "crying_face",\
      "code_ja": "涙",\
      "category": "faces",\
      "unicode": "1f622"\
    },\
    {\
      "moji": "😣",\
      "code": "persevering_face",\
      "code_ja": "がまん顔",\
      "category": "faces",\
      "unicode": "1f623"\
    },\
    {\
      "moji": "😤",\
      "code": "face_with_look_of_triumph",\
      "code_ja": "勝ち誇り",\
      "category": "faces",\
      "unicode": "1f624"\
    },\
    {\
      "moji": "😥",\
      "code": "disappointed_but_relieved_face",\
      "code_ja": "やれやれ",\
      "category": "faces",\
      "unicode": "1f625"\
    },\
    {\
      "moji": "😦",\
      "code": "frowning",\
      "code_ja": "しかめっ面",\
      "category": "faces",\
      "unicode": "1f626"\
    },\
    {\
      "moji": "😧",\
      "code": "anguished",\
      "code_ja": "悲しい顔",\
      "category": "faces",\
      "unicode": "1f627"\
    },\
    {\
      "moji": "😨",\
      "code": "fearful_face",\
      "code_ja": "青ざめ",\
      "category": "faces",\
      "unicode": "1f628"\
    },\
    {\
      "moji": "😩",\
      "code": "weary_face",\
      "code_ja": "うんざり",\
      "category": "faces",\
      "unicode": "1f629"\
    },\
    {\
      "moji": "😪",\
      "code": "sleepy_face",\
      "code_ja": "睡眠中",\
      "category": "faces",\
      "unicode": "1f62a"\
    },\
    {\
      "moji": "😫",\
      "code": "tired_face",\
      "code_ja": "疲れた",\
      "category": "faces",\
      "unicode": "1f62b"\
    },\
    {\
      "moji": "😬",\
      "code": "grimacing",\
      "code_ja": "いーっ",\
      "category": "faces",\
      "unicode": "1f62c"\
    },\
    {\
      "moji": "😭",\
      "code": "loudly_crying_face",\
      "code_ja": "大泣き",\
      "category": "faces",\
      "unicode": "1f62d"\
    },\
    {\
      "moji": "😮",\
      "code": "open_mouth",\
      "code_ja": "ぽかんと",\
      "category": "faces",\
      "unicode": "1f62e"\
    },\
    {\
      "moji": "😯",\
      "code": "hushed",\
      "code_ja": "しーん",\
      "category": "faces",\
      "unicode": "1f62f"\
    },\
    {\
      "moji": "😰",\
      "code": "face_with_open_mouth_and_cold_sweat",\
      "code_ja": "冷や汗2",\
      "category": "faces",\
      "unicode": "1f630"\
    },\
    {\
      "moji": "😱",\
      "code": "face_screaming_in_fear",\
      "code_ja": "ショッキング",\
      "category": "faces",\
      "unicode": "1f631"\
    },\
    {\
      "moji": "😲",\
      "code": "astonished_face",\
      "code_ja": "びっくり",\
      "category": "faces",\
      "unicode": "1f632"\
    },\
    {\
      "moji": "😳",\
      "code": "flushed",\
      "code_ja": "ぽっ",\
      "category": "faces",\
      "unicode": "1f633"\
    },\
    {\
      "moji": "😴",\
      "code": "sleeping",\
      "code_ja": "眠い",\
      "category": "faces",\
      "unicode": "1f634"\
    },\
    {\
      "moji": "😵",\
      "code": "dizzy_face",\
      "code_ja": "ふらふら",\
      "category": "faces",\
      "unicode": "1f635"\
    },\
    {\
      "moji": "😶",\
      "code": "face_without_mouth",\
      "code_ja": "無表情",\
      "category": "faces",\
      "unicode": "1f636"\
    },\
    {\
      "moji": "😷",\
      "code": "face_with_medical_mask",\
      "code_ja": "風邪ひき",\
      "category": "faces",\
      "unicode": "1f637"\
    },\
    {\
      "moji": "😸",\
      "code": "grinning_cat_face_with_smiling_eyes",\
      "code_ja": "うっしっし(ネコ)",\
      "category": "faces",\
      "unicode": "1f638"\
    },\
    {\
      "moji": "😹",\
      "code": "cat_face_with_tears_of_joy",\
      "code_ja": "泣き笑い(ネコ)",\
      "category": "faces",\
      "unicode": "1f639"\
    },\
    {\
      "moji": "😺",\
      "code": "smiling_cat_face_with_open_mouth",\
      "code_ja": "にこ(ネコ)",\
      "category": "faces",\
      "unicode": "1f63a"\
    },\
    {\
      "moji": "😻",\
      "code": "smiling_cat_face_with_heart_shaped_eyes",\
      "code_ja": "目がハート(ネコ)",\
      "category": "faces",\
      "unicode": "1f63b"\
    },\
    {\
      "moji": "😼",\
      "code": "cat_face_with_wry_smile",\
      "code_ja": "きりり(ネコ)",\
      "category": "faces",\
      "unicode": "1f63c"\
    },\
    {\
      "moji": "😽",\
      "code": "kissing_cat_face_with_closed_eyes",\
      "code_ja": "チュー(ネコ)",\
      "category": "faces",\
      "unicode": "1f63d"\
    },\
    {\
      "moji": "😾",\
      "code": "pouting_cat_face",\
      "code_ja": "ぷー(ネコ)",\
      "category": "faces",\
      "unicode": "1f63e"\
    },\
    {\
      "moji": "😿",\
      "code": "crying_cat_face",\
      "code_ja": "涙ぽろり(ネコ)",\
      "category": "faces",\
      "unicode": "1f63f"\
    },\
    {\
      "moji": "🙀",\
      "code": "weary_cat_face",\
      "code_ja": "ほえー(ネコ)",\
      "category": "faces",\
      "unicode": "1f640"\
    },\
    {\
      "moji": "🙅",\
      "code": "face_with_no_good_gesture",\
      "code_ja": "NG",\
      "category": "gestures",\
      "unicode": "1f645"\
    },\
    {\
      "moji": "🙆",\
      "code": "face_with_ok_gesture",\
      "code_ja": "OK",\
      "category": "gestures",\
      "unicode": "1f646"\
    },\
    {\
      "moji": "🙇",\
      "code": "person_bowing_deeply",\
      "code_ja": "平謝り",\
      "category": "gestures",\
      "unicode": "1f647"\
    },\
    {\
      "moji": "🙈",\
      "code": "see_no_evil_monkey",\
      "code_ja": "見ざる",\
      "category": "gestures",\
      "unicode": "1f648"\
    },\
    {\
      "moji": "🙉",\
      "code": "hear_no_evil_monkey",\
      "code_ja": "聞かざる",\
      "category": "gestures",\
      "unicode": "1f649"\
    },\
    {\
      "moji": "🙊",\
      "code": "speak_no_evil_monkey",\
      "code_ja": "言わざる",\
      "category": "gestures",\
      "unicode": "1f64a"\
    },\
    {\
      "moji": "🙋",\
      "code": "happy_person_raising_one_hand",\
      "code_ja": "キャラクター(挙手)",\
      "category": "gestures",\
      "unicode": "1f64b"\
    },\
    {\
      "moji": "🙌",\
      "code": "person_raising_both_hands_in_celebration",\
      "code_ja": "バンザイ",\
      "category": "gestures",\
      "unicode": "1f64c"\
    },\
    {\
      "moji": "🙍",\
      "code": "person_frowning",\
      "code_ja": "キャラクター(しょんぼり)",\
      "category": "gestures",\
      "unicode": "1f64d"\
    },\
    {\
      "moji": "🙎",\
      "code": "person_with_pouting_face",\
      "code_ja": "キャラクター(怒る)",\
      "category": "gestures",\
      "unicode": "1f64e"\
    },\
    {\
      "moji": "🙏",\
      "code": "person_with_folded_hands",\
      "code_ja": "お願い",\
      "category": "gestures",\
      "unicode": "1f64f"\
    },\
    {\
      "moji": "🚀",\
      "code": "rocket",\
      "code_ja": "ロケット",\
      "category": "transportation",\
      "unicode": "1f680"\
    },\
    {\
      "moji": "🚁",\
      "code": "helicopter",\
      "code_ja": "ヘリコプター",\
      "category": "transportation",\
      "unicode": "1f681"\
    },\
    {\
      "moji": "🚂",\
      "code": "steam_locomotive",\
      "code_ja": "蒸気機関車",\
      "category": "transportation",\
      "unicode": "1f682"\
    },\
    {\
      "moji": "🚃",\
      "code": "railway_car",\
      "code_ja": "鉄道車両",\
      "category": "transportation",\
      "unicode": "1f683"\
    },\
    {\
      "moji": "🚄",\
      "code": "high_speed_train",\
      "code_ja": "新幹線",\
      "category": "transportation",\
      "unicode": "1f684"\
    },\
    {\
      "moji": "🚅",\
      "code": "high_speed_train_with_bullet_nose",\
      "code_ja": "新幹線2",\
      "category": "transportation",\
      "unicode": "1f685"\
    },\
    {\
      "moji": "🚆",\
      "code": "train",\
      "code_ja": "電車",\
      "category": "transportation",\
      "unicode": "1f686"\
    },\
    {\
      "moji": "🚇",\
      "code": "metro",\
      "code_ja": "地下鉄",\
      "category": "transportation",\
      "unicode": "1f687"\
    },\
    {\
      "moji": "🚈",\
      "code": "light_rail",\
      "code_ja": "軽便鉄道",\
      "category": "transportation",\
      "unicode": "1f688"\
    },\
    {\
      "moji": "🚉",\
      "code": "station",\
      "code_ja": "駅",\
      "category": "transportation",\
      "unicode": "1f689"\
    },\
    {\
      "moji": "🚊",\
      "code": "tram",\
      "code_ja": "路面電車",\
      "category": "transportation",\
      "unicode": "1f68a"\
    },\
    {\
      "moji": "🚋",\
      "code": "tram_car",\
      "code_ja": "路面電車2",\
      "category": "transportation",\
      "unicode": "1f68b"\
    },\
    {\
      "moji": "🚌",\
      "code": "bus",\
      "code_ja": "バス",\
      "category": "transportation",\
      "unicode": "1f68c"\
    },\
    {\
      "moji": "🚍",\
      "code": "oncoming_bus",\
      "code_ja": "バス2",\
      "category": "transportation",\
      "unicode": "1f68d"\
    },\
    {\
      "moji": "🚎",\
      "code": "trolleybus",\
      "code_ja": "トロリーバス",\
      "category": "transportation",\
      "unicode": "1f68e"\
    },\
    {\
      "moji": "🚏",\
      "code": "bus_stop",\
      "code_ja": "バス停",\
      "category": "transportation",\
      "unicode": "1f68f"\
    },\
    {\
      "moji": "🚐",\
      "code": "minibus",\
      "code_ja": "マイクロバス",\
      "category": "transportation",\
      "unicode": "1f690"\
    },\
    {\
      "moji": "🚑",\
      "code": "ambulance",\
      "code_ja": "救急車",\
      "category": "transportation",\
      "unicode": "1f691"\
    },\
    {\
      "moji": "🚒",\
      "code": "fire_engine",\
      "code_ja": "消防車",\
      "category": "transportation",\
      "unicode": "1f692"\
    },\
    {\
      "moji": "🚓",\
      "code": "police_car",\
      "code_ja": "パトカー",\
      "category": "transportation",\
      "unicode": "1f693"\
    },\
    {\
      "moji": "🚔",\
      "code": "oncoming_police_car",\
      "code_ja": "パトカー2",\
      "category": "transportation",\
      "unicode": "1f694"\
    },\
    {\
      "moji": "🚕",\
      "code": "taxi",\
      "code_ja": "タクシー",\
      "category": "transportation",\
      "unicode": "1f695"\
    },\
    {\
      "moji": "🚖",\
      "code": "oncoming_taxi",\
      "code_ja": "タクシー2",\
      "category": "transportation",\
      "unicode": "1f696"\
    },\
    {\
      "moji": "🚗",\
      "code": "car",\
      "code_ja": "車",\
      "category": "transportation",\
      "unicode": "1f697"\
    },\
    {\
      "moji": "🚘",\
      "code": "oncoming_automobile",\
      "code_ja": "車2",\
      "category": "transportation",\
      "unicode": "1f698"\
    },\
    {\
      "moji": "🚙",\
      "code": "RV",\
      "code_ja": "RV車",\
      "category": "transportation",\
      "unicode": "1f699"\
    },\
    {\
      "moji": "🚚",\
      "code": "delivery_truck",\
      "code_ja": "トラック",\
      "category": "transportation",\
      "unicode": "1f69a"\
    },\
    {\
      "moji": "🚛",\
      "code": "articulated_lorry",\
      "code_ja": "トレーラートラック",\
      "category": "transportation",\
      "unicode": "1f69b"\
    },\
    {\
      "moji": "🚜",\
      "code": "tractor",\
      "code_ja": "トラクター",\
      "category": "transportation",\
      "unicode": "1f69c"\
    },\
    {\
      "moji": "🚝",\
      "code": "monorail",\
      "code_ja": "モノレール",\
      "category": "transportation",\
      "unicode": "1f69d"\
    },\
    {\
      "moji": "🚞",\
      "code": "mountain_railway",\
      "code_ja": "登山鉄道",\
      "category": "transportation",\
      "unicode": "1f69e"\
    },\
    {\
      "moji": "🚟",\
      "code": "suspension_railway",\
      "code_ja": "高架鉄道",\
      "category": "transportation",\
      "unicode": "1f69f"\
    },\
    {\
      "moji": "🚠",\
      "code": "mountain_cableway",\
      "code_ja": "ロープウェイ",\
      "category": "transportation",\
      "unicode": "1f6a0"\
    },\
    {\
      "moji": "🚡",\
      "code": "aerial_tramway",\
      "code_ja": "ロープウェイ2",\
      "category": "transportation",\
      "unicode": "1f6a1"\
    },\
    {\
      "moji": "🚢",\
      "code": "ship",\
      "code_ja": "船",\
      "category": "transportation",\
      "unicode": "1f6a2"\
    },\
    {\
      "moji": "🚣",\
      "code": "rowboat",\
      "code_ja": "ボート",\
      "category": "transportation",\
      "unicode": "1f6a3"\
    },\
    {\
      "moji": "🚤",\
      "code": "speedboat",\
      "code_ja": "モーターボート",\
      "category": "transportation",\
      "unicode": "1f6a4"\
    },\
    {\
      "moji": "🚥",\
      "code": "horizontal_traffic_light",\
      "code_ja": "信号(横)",\
      "category": "objects",\
      "unicode": "1f6a5"\
    },\
    {\
      "moji": "🚦",\
      "code": "vertical_traffic_light",\
      "code_ja": "信号(縦)",\
      "category": "objects",\
      "unicode": "1f6a6"\
    },\
    {\
      "moji": "🚧",\
      "code": "construction_sign",\
      "code_ja": "工事中",\
      "category": "objects",\
      "unicode": "1f6a7"\
    },\
    {\
      "moji": "🚨",\
      "code": "police_cars_revolving_light",\
      "code_ja": "パトカーのランプ",\
      "category": "objects",\
      "unicode": "1f6a8"\
    },\
    {\
      "moji": "🚩",\
      "code": "triangular_flag_on_post",\
      "code_ja": "位置情報",\
      "category": "symbols",\
      "unicode": "1f6a9"\
    },\
    {\
      "moji": "🚪",\
      "code": "door",\
      "code_ja": "ドア",\
      "category": "objects",\
      "unicode": "1f6aa"\
    },\
    {\
      "moji": "🚫",\
      "code": "no_entry_sign",\
      "code_ja": "禁止",\
      "category": "abstract",\
      "unicode": "1f6ab"\
    },\
    {\
      "moji": "🚬",\
      "code": "smoking_symbol",\
      "code_ja": "喫煙",\
      "category": "symbols",\
      "unicode": "1f6ac"\
    },\
    {\
      "moji": "🚭",\
      "code": "no_smoking_symbol",\
      "code_ja": "禁煙",\
      "category": "symbols",\
      "unicode": "1f6ad"\
    },\
    {\
      "moji": "🚮",\
      "code": "put_litter_in_its_place_symbol",\
      "code_ja": "ゴミ箱",\
      "category": "symbols",\
      "unicode": "1f6ae"\
    },\
    {\
      "moji": "🚯",\
      "code": "do_not_litter_symbol",\
      "code_ja": "ポイ捨て禁止",\
      "category": "symbols",\
      "unicode": "1f6af"\
    },\
    {\
      "moji": "🚰",\
      "code": "potable_water_symbol",\
      "code_ja": "飲料水",\
      "category": "symbols",\
      "unicode": "1f6b0"\
    },\
    {\
      "moji": "🚱",\
      "code": "non_potable_water_symbol",\
      "code_ja": "非飲料水",\
      "category": "symbols",\
      "unicode": "1f6b1"\
    },\
    {\
      "moji": "🚲",\
      "code": "bicycle",\
      "code_ja": "自転車",\
      "category": "transportation",\
      "unicode": "1f6b2"\
    },\
    {\
      "moji": "🚳",\
      "code": "no_bicycles",\
      "code_ja": "駐輪禁止",\
      "category": "symbols",\
      "unicode": "1f6b3"\
    },\
    {\
      "moji": "🚴",\
      "code": "bicyclist",\
      "code_ja": "自転車乗り",\
      "category": "people",\
      "unicode": "1f6b4"\
    },\
    {\
      "moji": "🚵",\
      "code": "mountain_bicyclist",\
      "code_ja": "ロードレーサー",\
      "category": "people",\
      "unicode": "1f6b5"\
    },\
    {\
      "moji": "🚶",\
      "code": "pedestrian",\
      "code_ja": "歩く人",\
      "category": "people",\
      "unicode": "1f6b6"\
    },\
    {\
      "moji": "🚷",\
      "code": "no_pedestrains",\
      "code_ja": "歩行者通行止め",\
      "category": "symbols",\
      "unicode": "1f6b7"\
    },\
    {\
      "moji": "🚸",\
      "code": "children_crossing",\
      "code_ja": "通学路",\
      "category": "symbols",\
      "unicode": "1f6b8"\
    },\
    {\
      "moji": "🚹",\
      "code": "mens_symbol",\
      "code_ja": "男性マーク",\
      "category": "symbols",\
      "unicode": "1f6b9"\
    },\
    {\
      "moji": "🚺",\
      "code": "womens_symbol",\
      "code_ja": "女性マーク",\
      "category": "symbols",\
      "unicode": "1f6ba"\
    },\
    {\
      "moji": "🚻",\
      "code": "restroom",\
      "code_ja": "公衆トイレ",\
      "category": "symbols",\
      "unicode": "1f6bb"\
    },\
    {\
      "moji": "🚼",\
      "code": "baby_symbol",\
      "code_ja": "赤ちゃんマーク",\
      "category": "symbols",\
      "unicode": "1f6bc"\
    },\
    {\
      "moji": "🚽",\
      "code": "toilet",\
      "code_ja": "トイレ",\
      "category": "objects",\
      "unicode": "1f6bd"\
    },\
    {\
      "moji": "🚾",\
      "code": "water_closet",\
      "code_ja": "トイレマーク",\
      "category": "symbols",\
      "unicode": "1f6be"\
    },\
    {\
      "moji": "🚿",\
      "code": "shower",\
      "code_ja": "シャワー",\
      "category": "objects",\
      "unicode": "1f6bf"\
    },\
    {\
      "moji": "🛀",\
      "code": "bath",\
      "code_ja": "入浴",\
      "category": "objects",\
      "unicode": "1f6c0"\
    },\
    {\
      "moji": "🛁",\
      "code": "bathtub",\
      "code_ja": "お風呂",\
      "category": "objects",\
      "unicode": "1f6c1"\
    },\
    {\
      "moji": "🛂",\
      "code": "passport_control",\
      "code_ja": "入国審査",\
      "category": "symbols",\
      "unicode": "1f6c2"\
    },\
    {\
      "moji": "🛃",\
      "code": "customs",\
      "code_ja": "税関",\
      "category": "symbols",\
      "unicode": "1f6c3"\
    },\
    {\
      "moji": "🛄",\
      "code": "baggage_claim",\
      "code_ja": "手荷物受取所",\
      "category": "symbols",\
      "unicode": "1f6c4"\
    },\
    {\
      "moji": "🛅",\
      "code": "left_luggage",\
      "code_ja": "一時預かり手荷物",\
      "category": "symbols",\
      "unicode": "1f6c5"\
    },\
    {\
      "moji": "#️⃣",\
      "code": "hash_key",\
      "code_ja": "#",\
      "category": "symbols",\
      "unicode": "002320e3"\
    },\
    {\
      "moji": "️1️⃣",\
      "code": "keycap_1",\
      "code_ja": "1",\
      "category": "symbols",\
      "unicode": "003120e3"\
    },\
    {\
      "moji": "️2️⃣",\
      "code": "keycap_2",\
      "code_ja": "2",\
      "category": "symbols",\
      "unicode": "003220e3"\
    },\
    {\
      "moji": "️3️⃣",\
      "code": "keycap_3",\
      "code_ja": "3",\
      "category": "symbols",\
      "unicode": "003320e3"\
    },\
    {\
      "moji": "️4️⃣",\
      "code": "keycap_4",\
      "code_ja": "4",\
      "category": "symbols",\
      "unicode": "003420e3"\
    },\
    {\
      "moji": "️5️⃣",\
      "code": "keycap_5",\
      "code_ja": "5",\
      "category": "symbols",\
      "unicode": "003520e3"\
    },\
    {\
      "moji": "️6️⃣",\
      "code": "keycap_6",\
      "code_ja": "6",\
      "category": "symbols",\
      "unicode": "003620e3"\
    },\
    {\
      "moji": "️7️⃣",\
      "code": "keycap_7",\
      "code_ja": "7",\
      "category": "symbols",\
      "unicode": "003720e3"\
    },\
    {\
      "moji": "️8️⃣",\
      "code": "keycap_8",\
      "code_ja": "8",\
      "category": "symbols",\
      "unicode": "003820e3"\
    },\
    {\
      "moji": "️9️⃣",\
      "code": "keycap_9",\
      "code_ja": "9",\
      "category": "symbols",\
      "unicode": "003920e3"\
    },\
    {\
      "moji": "️0️⃣",\
      "code": "keycap_0",\
      "code_ja": "0",\
      "category": "symbols",\
      "unicode": "003020e3"\
    },\
    {\
      "moji": "©",\
      "code": "copyright_sign",\
      "code_ja": "コピーライトマーク",\
      "category": "symbols",\
      "unicode": "00a9"\
    },\
    {\
      "moji": "®",\
      "code": "registered_sign",\
      "code_ja": "レジスタードマーク",\
      "category": "symbols",\
      "unicode": "00ae"\
    },\
    {\
      "moji": "‼",\
      "code": "double_exclamation_mark",\
      "code_ja": "！！",\
      "category": "abstract",\
      "unicode": "203c"\
    },\
    {\
      "moji": "⁉",\
      "code": "exclamation_question_mark",\
      "code_ja": "！？",\
      "category": "abstract",\
      "unicode": "2049"\
    },\
    {\
      "moji": "™",\
      "code": "trade_mark_sign",\
      "code_ja": "トレードマーク",\
      "category": "symbols",\
      "unicode": "2122"\
    },\
    {\
      "moji": "ℹ",\
      "code": "information_source",\
      "code_ja": "インフォメーション",\
      "category": "symbols",\
      "unicode": "2139"\
    },\
    {\
      "moji": "↔",\
      "code": "left_right_arrow",\
      "code_ja": "左右向き矢印",\
      "category": "abstract",\
      "unicode": "2194"\
    },\
    {\
      "moji": "↕",\
      "code": "up_down_arrow",\
      "code_ja": "上下向き矢印",\
      "category": "abstract",\
      "unicode": "2195"\
    },\
    {\
      "moji": "↖",\
      "code": "north_west_arrow",\
      "code_ja": "左斜め上向き矢印",\
      "category": "abstract",\
      "unicode": "2196"\
    },\
    {\
      "moji": "↗",\
      "code": "north_east_arrow",\
      "code_ja": "右斜め上向き矢印",\
      "category": "abstract",\
      "unicode": "2197"\
    },\
    {\
      "moji": "↘",\
      "code": "south_east_arrow",\
      "code_ja": "右斜め下向き矢印",\
      "category": "abstract",\
      "unicode": "2198"\
    },\
    {\
      "moji": "↙",\
      "code": "south_west_arrow",\
      "code_ja": "左斜め下向き矢印",\
      "category": "abstract",\
      "unicode": "2199"\
    },\
    {\
      "moji": "↩",\
      "code": "leftwards_arrow_with_hook",\
      "code_ja": "回り矢印",\
      "category": "abstract",\
      "unicode": "21a9"\
    },\
    {\
      "moji": "↪",\
      "code": "rightwards_arrow_with_hook",\
      "code_ja": "回り矢印2",\
      "category": "abstract",\
      "unicode": "21aa"\
    },\
    {\
      "moji": "⌚️",\
      "code": "watch",\
      "code_ja": "腕時計",\
      "category": "objects",\
      "unicode": "231a"\
    },\
    {\
      "moji": "⌛",\
      "code": "hourglass",\
      "code_ja": "砂時計",\
      "category": "objects",\
      "unicode": "231b"\
    },\
    {\
      "moji": "⏩",\
      "code": "black_right_pointing_double_triangle",\
      "code_ja": "右向き三角2",\
      "category": "abstract",\
      "unicode": "23e9"\
    },\
    {\
      "moji": "⏪",\
      "code": "black_left_pointing_double_triangle",\
      "code_ja": "左向き三角2",\
      "category": "abstract",\
      "unicode": "23ea"\
    },\
    {\
      "moji": "⏫",\
      "code": "black_up_pointing_double_triangle",\
      "code_ja": "上向き三角2",\
      "category": "abstract",\
      "unicode": "23eb"\
    },\
    {\
      "moji": "⏬",\
      "code": "black_down_pointing_double_triangle",\
      "code_ja": "下向き三角2",\
      "category": "abstract",\
      "unicode": "23ec"\
    },\
    {\
      "moji": "⏰",\
      "code": "alarm_clock",\
      "code_ja": "目覚まし時計",\
      "category": "objects",\
      "unicode": "23f0"\
    },\
    {\
      "moji": "⏳",\
      "code": "hourglass_with_flowing_sand",\
      "code_ja": "砂時計2",\
      "category": "objects",\
      "unicode": "23f3"\
    },\
    {\
      "moji": "Ⓜ️",\
      "code": "circled_latin_capital_letter_m",\
      "code_ja": "Mマーク",\
      "category": "symbols",\
      "unicode": "24c2"\
    },\
    {\
      "moji": "▪",\
      "code": "black_small_square",\
      "code_ja": "小四角(黒)",\
      "category": "abstract",\
      "unicode": "25aa"\
    },\
    {\
      "moji": "▫",\
      "code": "white_small_square",\
      "code_ja": "小四角(白)",\
      "category": "abstract",\
      "unicode": "25ab"\
    },\
    {\
      "moji": "▶",\
      "code": "black_right_pointing_triangle",\
      "code_ja": "右向き三角",\
      "category": "abstract",\
      "unicode": "25b6"\
    },\
    {\
      "moji": "◀",\
      "code": "black_left_pointing_triangle",\
      "code_ja": "左向き三角",\
      "category": "abstract",\
      "unicode": "25c0"\
    },\
    {\
      "moji": "◻",\
      "code": "white_medium_square",\
      "code_ja": "大四角(白)",\
      "category": "abstract",\
      "unicode": "25fb"\
    },\
    {\
      "moji": "◼",\
      "code": "black_medium_square",\
      "code_ja": "大四角(黒)",\
      "category": "abstract",\
      "unicode": "25fc"\
    },\
    {\
      "moji": "◽",\
      "code": "white_medium_small_square",\
      "code_ja": "中四角(白)",\
      "category": "abstract",\
      "unicode": "25fd"\
    },\
    {\
      "moji": "◾",\
      "code": "black_medium_small_square",\
      "code_ja": "中四角(黒)",\
      "category": "abstract",\
      "unicode": "25fe"\
    },\
    {\
      "moji": "☀",\
      "code": "sun",\
      "code_ja": "晴れ",\
      "category": "nature",\
      "unicode": "2600"\
    },\
    {\
      "moji": "☁",\
      "code": "cloud",\
      "code_ja": "曇り",\
      "category": "nature",\
      "unicode": "2601"\
    },\
    {\
      "moji": "☎",\
      "code": "black_telephone",\
      "code_ja": "黒電話",\
      "category": "objects",\
      "unicode": "260e"\
    },\
    {\
      "moji": "☑",\
      "code": "ballot_box_with_check",\
      "code_ja": "チェックボックス",\
      "category": "abstract",\
      "unicode": "2611"\
    },\
    {\
      "moji": "☔",\
      "code": "umbrella_with_rain_drops",\
      "code_ja": "雨",\
      "category": "nature",\
      "unicode": "2614"\
    },\
    {\
      "moji": "☕",\
      "code": "hot_beverage",\
      "code_ja": "コーヒー",\
      "category": "objects",\
      "unicode": "2615"\
    },\
    {\
      "moji": "☝",\
      "code": "white_up_pointing_index",\
      "code_ja": "指さし",\
      "category": "gestures",\
      "unicode": "261d"\
    },\
    {\
      "moji": "☺",\
      "code": "white_smiling_face",\
      "code_ja": "スマイルフェイス",\
      "category": "faces",\
      "unicode": "263a"\
    },\
    {\
      "moji": "♈",\
      "code": "Aries",\
      "code_ja": "牡羊座",\
      "category": "symbols",\
      "unicode": "2648"\
    },\
    {\
      "moji": "♉",\
      "code": "Taurus",\
      "code_ja": "牡牛座",\
      "category": "symbols",\
      "unicode": "2649"\
    },\
    {\
      "moji": "♊",\
      "code": "Gemini",\
      "code_ja": "双子座",\
      "category": "symbols",\
      "unicode": "264a"\
    },\
    {\
      "moji": "♋",\
      "code": "Cancer",\
      "code_ja": "蟹座",\
      "category": "symbols",\
      "unicode": "264b"\
    },\
    {\
      "moji": "♌",\
      "code": "Leo",\
      "code_ja": "獅子座",\
      "category": "symbols",\
      "unicode": "264c"\
    },\
    {\
      "moji": "♍",\
      "code": "Virgo",\
      "code_ja": "乙女座",\
      "category": "symbols",\
      "unicode": "264d"\
    },\
    {\
      "moji": "♎",\
      "code": "Libra",\
      "code_ja": "天秤座",\
      "category": "symbols",\
      "unicode": "264e"\
    },\
    {\
      "moji": "♏",\
      "code": "Scorpio",\
      "code_ja": "蠍座",\
      "category": "symbols",\
      "unicode": "264f"\
    },\
    {\
      "moji": "♐",\
      "code": "Sagittarius",\
      "code_ja": "射手座",\
      "category": "symbols",\
      "unicode": "2650"\
    },\
    {\
      "moji": "♑",\
      "code": "Capricorn",\
      "code_ja": "山羊座",\
      "category": "symbols",\
      "unicode": "2651"\
    },\
    {\
      "moji": "♒",\
      "code": "Aquarius",\
      "code_ja": "水瓶座",\
      "category": "symbols",\
      "unicode": "2652"\
    },\
    {\
      "moji": "♓",\
      "code": "Pisces",\
      "code_ja": "魚座",\
      "category": "symbols",\
      "unicode": "2653"\
    },\
    {\
      "moji": "♠",\
      "code": "black_spade_suit",\
      "code_ja": "スペード",\
      "category": "symbols",\
      "unicode": "2660"\
    },\
    {\
      "moji": "♣",\
      "code": "black_club_suit",\
      "code_ja": "クラブ",\
      "category": "symbols",\
      "unicode": "2663"\
    },\
    {\
      "moji": "♥",\
      "code": "black_heart_suit",\
      "code_ja": "ハート",\
      "category": "symbols",\
      "unicode": "2665"\
    },\
    {\
      "moji": "♦",\
      "code": "black_diamond_suit",\
      "code_ja": "ダイヤ",\
      "category": "symbols",\
      "unicode": "2666"\
    },\
    {\
      "moji": "♨",\
      "code": "hot_springs",\
      "code_ja": "温泉",\
      "category": "places",\
      "unicode": "2668"\
    },\
    {\
      "moji": "♻",\
      "code": "black_universal_recycling_symbol",\
      "code_ja": "リサイクルマーク",\
      "category": "symbols",\
      "unicode": "267b"\
    },\
    {\
      "moji": "♿",\
      "code": "wheelchair",\
      "code_ja": "車椅子マーク",\
      "category": "symbols",\
      "unicode": "267f"\
    },\
    {\
      "moji": "⚓",\
      "code": "anchor",\
      "code_ja": "いかり",\
      "category": "transportation",\
      "unicode": "2693"\
    },\
    {\
      "moji": "⚠",\
      "code": "warning_sign",\
      "code_ja": "注意",\
      "category": "symbols",\
      "unicode": "26a0"\
    },\
    {\
      "moji": "⚡",\
      "code": "high_voltage_sign",\
      "code_ja": "イナズマ",\
      "category": "nature",\
      "unicode": "26a1"\
    },\
    {\
      "moji": "⚪",\
      "code": "medium_white_circle",\
      "code_ja": "中丸(白)",\
      "category": "abstract",\
      "unicode": "26aa"\
    },\
    {\
      "moji": "⚫",\
      "code": "medium_black_circle",\
      "code_ja": "中丸(黒)",\
      "category": "abstract",\
      "unicode": "26ab"\
    },\
    {\
      "moji": "⚽",\
      "code": "soccer_ball",\
      "code_ja": "サッカー",\
      "category": "objects",\
      "unicode": "26bd"\
    },\
    {\
      "moji": "⚾",\
      "code": "baseball",\
      "code_ja": "野球",\
      "category": "objects",\
      "unicode": "26be"\
    },\
    {\
      "moji": "⛄",\
      "code": "snowman_without_snow",\
      "code_ja": "雪だるま",\
      "category": "nature",\
      "unicode": "26c4"\
    },\
    {\
      "moji": "⛅",\
      "code": "sun_behind_cloud",\
      "code_ja": "晴れときどき曇り",\
      "category": "nature",\
      "unicode": "26c5"\
    },\
    {\
      "moji": "⛎",\
      "code": "Ophiuchus",\
      "code_ja": "蛇遣い座",\
      "category": "symbols",\
      "unicode": "26ce"\
    },\
    {\
      "moji": "⛔",\
      "code": "no_entry",\
      "code_ja": "立ち入り禁止",\
      "category": "abstract",\
      "unicode": "26d4"\
    },\
    {\
      "moji": "⛪",\
      "code": "church",\
      "code_ja": "教会",\
      "category": "places",\
      "unicode": "26ea"\
    },\
    {\
      "moji": "⛲",\
      "code": "fountain",\
      "code_ja": "噴水",\
      "category": "places",\
      "unicode": "26f2"\
    },\
    {\
      "moji": "⛳",\
      "code": "flag_in_hole",\
      "code_ja": "ゴルフ",\
      "category": "objects",\
      "unicode": "26f3"\
    },\
    {\
      "moji": "⛵",\
      "code": "sailboat",\
      "code_ja": "ボート",\
      "category": "transportation",\
      "unicode": "26f5"\
    },\
    {\
      "moji": "⛺",\
      "code": "tent",\
      "code_ja": "テント",\
      "category": "objects",\
      "unicode": "26fa"\
    },\
    {\
      "moji": "⛽",\
      "code": "fuel_pump",\
      "code_ja": "ガソリンスタンド",\
      "category": "places",\
      "unicode": "26fd"\
    },\
    {\
      "moji": "✂",\
      "code": "black_scissors",\
      "code_ja": "はさみ",\
      "category": "objects",\
      "unicode": "2702"\
    },\
    {\
      "moji": "✅",\
      "code": "white_heavy_check_mark",\
      "code_ja": "チェックマーク2",\
      "category": "abstract",\
      "unicode": "2705"\
    },\
    {\
      "moji": "✈",\
      "code": "airplane",\
      "code_ja": "飛行機",\
      "category": "transportation",\
      "unicode": "2708"\
    },\
    {\
      "moji": "✉",\
      "code": "envelope",\
      "code_ja": "封筒",\
      "category": "objects",\
      "unicode": "2709"\
    },\
    {\
      "moji": "✊",\
      "code": "raised_fist",\
      "code_ja": "グー",\
      "category": "gestures",\
      "unicode": "270a"\
    },\
    {\
      "moji": "✋",\
      "code": "raised_hand",\
      "code_ja": "パー",\
      "category": "gestures",\
      "unicode": "270b"\
    },\
    {\
      "moji": "✌",\
      "code": "victory_hand",\
      "code_ja": "チョキ",\
      "category": "gestures",\
      "unicode": "270c"\
    },\
    {\
      "moji": "✏",\
      "code": "pencil",\
      "code_ja": "鉛筆",\
      "category": "objects",\
      "unicode": "270f"\
    },\
    {\
      "moji": "✒",\
      "code": "black_nib",\
      "code_ja": "ペン",\
      "category": "objects",\
      "unicode": "2712"\
    },\
    {\
      "moji": "✔",\
      "code": "heavy_check_mark",\
      "code_ja": "チェックマーク",\
      "category": "abstract",\
      "unicode": "2714"\
    },\
    {\
      "moji": "✖",\
      "code": "heavy_multiplication_x",\
      "code_ja": "×",\
      "category": "abstract",\
      "unicode": "2716"\
    },\
    {\
      "moji": "✨",\
      "code": "sparkles",\
      "code_ja": "キラキラ",\
      "category": "abstract",\
      "unicode": "2728"\
    },\
    {\
      "moji": "✳",\
      "code": "eight_spoked_asterisk",\
      "code_ja": "キラリ",\
      "category": "abstract",\
      "unicode": "2733"\
    },\
    {\
      "moji": "✴",\
      "code": "eight_pointed_black_star",\
      "code_ja": "キラリ2",\
      "category": "abstract",\
      "unicode": "2734"\
    },\
    {\
      "moji": "❄",\
      "code": "snowflake",\
      "code_ja": "雪の結晶",\
      "category": "nature",\
      "unicode": "2744"\
    },\
    {\
      "moji": "❇",\
      "code": "sparkle",\
      "code_ja": "スパーク",\
      "category": "abstract",\
      "unicode": "2747"\
    },\
    {\
      "moji": "❌",\
      "code": "cross_mark",\
      "code_ja": "×",\
      "category": "abstract",\
      "unicode": "274c"\
    },\
    {\
      "moji": "❎",\
      "code": "negative_squared_cross_mark",\
      "code_ja": "×2",\
      "category": "abstract",\
      "unicode": "274e"\
    },\
    {\
      "moji": "❓",\
      "code": "black_question_mark_ornament",\
      "code_ja": "？2",\
      "category": "abstract",\
      "unicode": "2753"\
    },\
    {\
      "moji": "❔",\
      "code": "white_question_mark_ornament",\
      "code_ja": "？",\
      "category": "abstract",\
      "unicode": "2754"\
    },\
    {\
      "moji": "❕",\
      "code": "white_exclamation_mark_ornament",\
      "code_ja": "！",\
      "category": "abstract",\
      "unicode": "2755"\
    },\
    {\
      "moji": "❗",\
      "code": "heavy_exclamation_mark_symbol",\
      "code_ja": "！2",\
      "category": "abstract",\
      "unicode": "2757"\
    },\
    {\
      "moji": "❤",\
      "code": "heart",\
      "code_ja": "ハート",\
      "category": "abstract",\
      "unicode": "2764"\
    },\
    {\
      "moji": "➕",\
      "code": "heavy_plus_sign",\
      "code_ja": "＋",\
      "category": "abstract",\
      "unicode": "2795"\
    },\
    {\
      "moji": "➖",\
      "code": "heavy_minus_sign",\
      "code_ja": "−",\
      "category": "abstract",\
      "unicode": "2796"\
    },\
    {\
      "moji": "➗",\
      "code": "heavy_division_sign",\
      "code_ja": "÷",\
      "category": "abstract",\
      "unicode": "2797"\
    },\
    {\
      "moji": "➡",\
      "code": "black_rightwards_arrow",\
      "code_ja": "右向き矢印",\
      "category": "abstract",\
      "unicode": "27a1"\
    },\
    {\
      "moji": "➰",\
      "code": "curly_loop",\
      "code_ja": "くるり",\
      "category": "abstract",\
      "unicode": "27b0"\
    },\
    {\
      "moji": "➿",\
      "code": "double_curly_loop",\
      "code_ja": "フリーダイヤル",\
      "category": "symbols",\
      "unicode": "27bf"\
    },\
      {\
      "moji": "⤴",\
      "code": "arrow_pointing_rightwards_then_curving_upwards",\
      "code_ja": "上向きカーブ矢印",\
      "category": "abstract",\
      "unicode": "2934"\
    },\
    {\
      "moji": "⤵",\
      "code": "arrow_pointing_rightwards_then_curving_downwards",\
      "code_ja": "下向きカーブ矢印",\
      "category": "abstract",\
      "unicode": "2935"\
    },\
    {\
      "moji": "⬅",\
      "code": "leftwards_black_arrow",\
      "code_ja": "左向き矢印",\
      "category": "abstract",\
      "unicode": "2b05"\
    },\
    {\
      "moji": "⬆",\
      "code": "upwards_black_arrow",\
      "code_ja": "上向き矢印",\
      "category": "abstract",\
      "unicode": "2b06"\
    },\
    {\
      "moji": "⬇",\
      "code": "downwards_black_arrow",\
      "code_ja": "下向き矢印",\
      "category": "abstract",\
      "unicode": "2b07"\
    },\
    {\
      "moji": "⬛",\
      "code": "black_large_square",\
      "code_ja": "特大四角(黒)",\
      "category": "abstract",\
      "unicode": "2b1b"\
    },\
    {\
      "moji": "⬜",\
      "code": "white_large_square",\
      "code_ja": "特大四角(白)",\
      "category": "abstract",\
      "unicode": "2b1c"\
    },\
    {\
      "moji": "⭐",\
      "code": "white_medium_star",\
      "code_ja": "中星(白)",\
      "category": "abstract",\
      "unicode": "2b50"\
    },\
    {\
      "moji": "⭕",\
      "code": "heavy_large_circle",\
      "code_ja": "○",\
      "category": "abstract",\
      "unicode": "2b55"\
    },\
    {\
      "moji": "〰",\
      "code": "wavy_dash",\
      "code_ja": "波線",\
      "category": "abstract",\
      "unicode": "3030"\
    },\
    {\
      "moji": "〽️",\
      "code": "part_alternation_mark",\
      "code_ja": "パート交代マーク",\
      "category": "symbols",\
      "unicode": "303d"\
    },\
    {\
      "moji": "㊗",\
      "code": "circled_ideograph_congratulation",\
      "code_ja": "祝マーク",\
      "category": "symbols",\
      "unicode": "3297"\
    },\
    {\
      "moji": "㊙",\
      "code": "circled_ideograph_secret",\
      "code_ja": "マル秘",\
      "category": "symbols",\
      "unicode": "3299"\
    }\
  ]';

    return EmojisData;

  })();

}).call(this);

(function(){!function(a){return"function"==typeof define&&define.amd?define(["jquery"],a):a(window.jQuery)}(function(a){var b,c,d,e,f,g,h,i,j,k=[].slice;d=function(){function b(b){this.current_flag=null,this.controllers={},this.alias_maps={},this.$inputor=a(b),this.iframe=null,this.setIframe(),this.listen()}return b.prototype.setIframe=function(a){var b;if(a)return this.window=a.contentWindow,this.document=a.contentDocument||this.window.document,this.iframe=a,this;this.document=this.$inputor[0].ownerDocument,this.window=this.document.defaultView||this.document.parentWindow;try{return this.iframe=this.window.frameElement}catch(c){b=c}},b.prototype.controller=function(a){return this.controllers[this.alias_maps[a]||a||this.current_flag]},b.prototype.set_context_for=function(a){return this.current_flag=a,this},b.prototype.reg=function(a,b){var c,d;return c=(d=this.controllers)[a]||(d[a]=new f(this,a)),b.alias&&(this.alias_maps[b.alias]=a),c.init(b),this},b.prototype.listen=function(){return this.$inputor.on("keyup.atwhoInner",function(a){return function(b){return a.on_keyup(b)}}(this)).on("keydown.atwhoInner",function(a){return function(b){return a.on_keydown(b)}}(this)).on("scroll.atwhoInner",function(a){return function(){var b;return null!=(b=a.controller())?b.view.hide():void 0}}(this)).on("blur.atwhoInner",function(a){return function(){var b;return(b=a.controller())?b.view.hide(b.get_opt("display_timeout")):void 0}}(this))},b.prototype.shutdown=function(){var a,b,c;c=this.controllers;for(b in c)a=c[b],a.destroy(),delete this.controllers[b];return this.$inputor.off(".atwhoInner")},b.prototype.dispatch=function(){return a.map(this.controllers,function(a){return function(b){return b.look_up()?a.set_context_for(b.at):void 0}}(this))},b.prototype.on_keyup=function(b){var c;switch(b.keyCode){case h.ESC:b.preventDefault(),null!=(c=this.controller())&&c.view.hide();break;case h.DOWN:case h.UP:case h.CTRL:a.noop();break;case h.P:case h.N:b.ctrlKey||this.dispatch();break;default:this.dispatch()}},b.prototype.on_keydown=function(b){var c,d;if(c=null!=(d=this.controller())?d.view:void 0,c&&c.visible())switch(b.keyCode){case h.ESC:b.preventDefault(),c.hide();break;case h.UP:b.preventDefault(),c.prev();break;case h.DOWN:b.preventDefault(),c.next();break;case h.P:if(!b.ctrlKey)return;b.preventDefault(),c.prev();break;case h.N:if(!b.ctrlKey)return;b.preventDefault(),c.next();break;case h.TAB:case h.ENTER:if(!c.visible())return;b.preventDefault(),c.choose();break;default:a.noop()}},b}(),f=function(){function c(c,d){this.app=c,this.at=d,this.$inputor=this.app.$inputor,this.id=this.$inputor[0].id||this.uid(),this.setting=null,this.query=null,this.pos=0,this.cur_rect=null,this.range=null,b.append(this.$el=a("<div id='atwho-ground-"+this.id+"'></div>")),this.model=new i(this),this.view=new j(this)}return c.prototype.uid=function(){return(Math.random().toString(16)+"000000000").substr(2,8)+(new Date).getTime()},c.prototype.init=function(b){return this.setting=a.extend({},this.setting||a.fn.atwho["default"],b),this.view.init(),this.model.reload(this.setting.data)},c.prototype.destroy=function(){return this.trigger("beforeDestroy"),this.model.destroy(),this.view.destroy(),this.$el.remove()},c.prototype.call_default=function(){var b,c,d;d=arguments[0],b=2<=arguments.length?k.call(arguments,1):[];try{return g[d].apply(this,b)}catch(e){return c=e,a.error(""+c+" Or maybe At.js doesn't have function "+d)}},c.prototype.trigger=function(a,b){var c,d;return null==b&&(b=[]),b.push(this),c=this.get_opt("alias"),d=c?""+a+"-"+c+".atwho":""+a+".atwho",this.$inputor.trigger(d,b)},c.prototype.callbacks=function(a){return this.get_opt("callbacks")[a]||g[a]},c.prototype.get_opt=function(a){var b;try{return this.setting[a]}catch(c){return b=c,null}},c.prototype.content=function(){return this.$inputor.is("textarea, input")?this.$inputor.val():this.$inputor.text()},c.prototype.catch_query=function(){var a,b,c,d,e,f;return b=this.content(),a=this.$inputor.caret("pos"),f=b.slice(0,a),d=this.callbacks("matcher").call(this,this.at,f,this.get_opt("start_with_space")),"string"==typeof d&&d.length<=this.get_opt("max_len",20)?(e=a-d.length,c=e+d.length,this.pos=e,d={text:d.toLowerCase(),head_pos:e,end_pos:c},this.trigger("matched",[this.at,d.text])):this.view.hide(),this.query=d},c.prototype.rect=function(){var a,b;if(a=this.$inputor.caret({iframe:this.app.iframe}).caret("offset",this.pos-1))return"true"===this.$inputor.attr("contentEditable")&&(a=this.cur_rect||(this.cur_rect=a)||a),b=this.app.document.selection?0:2,{left:a.left,top:a.top,bottom:a.top+a.height+b}},c.prototype.reset_rect=function(){return"true"===this.$inputor.attr("contentEditable")?this.cur_rect=null:void 0},c.prototype.mark_range=function(){return"true"===this.$inputor.attr("contentEditable")&&(this.app.window.getSelection&&(this.range=this.app.window.getSelection().getRangeAt(0)),this.app.document.selection)?this.ie8_range=this.app.document.selection.createRange():void 0},c.prototype.insert_content_for=function(b){var c,d,e;return d=b.data("value"),e=this.get_opt("insert_tpl"),this.$inputor.is("textarea, input")||!e?d:(c=a.extend({},b.data("item-data"),{"atwho-data-value":d,"atwho-at":this.at}),this.callbacks("tpl_eval").call(this,e,c))},c.prototype.insert=function(b,c){var d,e,f,g,h,i,j,k,l,m,n;return d=this.$inputor,"true"===d.attr("contentEditable")&&(f="atwho-view-flag atwho-view-flag-"+(this.get_opt("alias")||this.at),g=""+b+"<span contenteditable='false'>&nbsp;<span>",h="<span contenteditable='false' class='"+f+"'>"+g+"</span>",e=a(h,this.app.document).data("atwho-data-item",c.data("item-data")),this.app.document.selection&&(e=a("<span contenteditable='true'></span>",this.app.document).html(e))),d.is("textarea, input")?(b=""+b,l=d.val(),m=l.slice(0,Math.max(this.query.head_pos-this.at.length,0)),n=""+m+b+" "+l.slice(this.query.end_pos||0),d.val(n),d.caret("pos",m.length+b.length+1)):(j=this.range)?(i=j.startOffset-(this.query.end_pos-this.query.head_pos)-this.at.length,j.setStart(j.endContainer,Math.max(i,0)),j.setEnd(j.endContainer,j.endOffset),j.deleteContents(),j.insertNode(e[0]),j.collapse(!1),k=this.app.window.getSelection(),k.removeAllRanges(),k.addRange(j)):(j=this.ie8_range)&&(j.moveStart("character",this.query.end_pos-this.query.head_pos-this.at.length),j.pasteHTML(g),j.collapse(!1),j.select()),d.is(":focus")||d.focus(),d.change()},c.prototype.render_view=function(a){var b;return b=this.get_opt("search_key"),a=this.callbacks("sorter").call(this,this.query.text,a.slice(0,1001),b),this.view.render(a.slice(0,this.get_opt("limit")))},c.prototype.look_up=function(){var b,c;if(b=this.catch_query())return c=function(a){return a&&a.length>0?this.render_view(a):this.view.hide()},this.model.query(b.text,a.proxy(c,this)),b},c}(),i=function(){function b(a){this.context=a,this.at=this.context.at,this.storage=this.context.$inputor}return b.prototype.destroy=function(){return this.storage.data(this.at,null)},b.prototype.saved=function(){return this.fetch()>0},b.prototype.query=function(a,b){var c,d,e;return c=this.fetch(),d=this.context.get_opt("search_key"),c=this.context.callbacks("filter").call(this.context,a,c,d)||[],e=this.context.callbacks("remote_filter"),c.length>0||!e&&0===c.length?b(c):e.call(this.context,a,b)},b.prototype.fetch=function(){return this.storage.data(this.at)||[]},b.prototype.save=function(a){return this.storage.data(this.at,this.context.callbacks("before_save").call(this.context,a||[]))},b.prototype.load=function(a){return!this.saved()&&a?this._load(a):void 0},b.prototype.reload=function(a){return this._load(a)},b.prototype._load=function(b){return"string"==typeof b?a.ajax(b,{dataType:"json"}).done(function(a){return function(b){return a.save(b)}}(this)):this.save(b)},b}(),j=function(){function b(b){this.context=b,this.$el=a("<div class='atwho-view'><ul class='atwho-view-ul'></ul></div>"),this.timeout_id=null,this.context.$el.append(this.$el),this.bind_event()}return b.prototype.init=function(){var a;return a=this.context.get_opt("alias")||this.context.at.charCodeAt(0),this.$el.attr({id:"at-view-"+a})},b.prototype.destroy=function(){return this.$el.remove()},b.prototype.bind_event=function(){var b;return b=this.$el.find("ul"),b.on("mouseenter.atwho-view","li",function(c){return b.find(".cur").removeClass("cur"),a(c.currentTarget).addClass("cur")}).on("click",function(a){return function(b){return a.choose(),b.preventDefault()}}(this))},b.prototype.visible=function(){return this.$el.is(":visible")},b.prototype.choose=function(){var a,b;return a=this.$el.find(".cur"),b=this.context.insert_content_for(a),this.context.insert(this.context.callbacks("before_insert").call(this.context,b,a),a),this.context.trigger("inserted",[a]),this.hide()},b.prototype.reposition=function(b){var c,d;return b.bottom+this.$el.height()-a(window).scrollTop()>a(window).height()&&(b.bottom=b.top-this.$el.height()),c={left:b.left,top:b.bottom},null!=(d=this.context.callbacks("before_reposition"))&&d.call(this.context,c),this.$el.offset(c),this.context.trigger("reposition",[c])},b.prototype.next=function(){var a,b;return a=this.$el.find(".cur").removeClass("cur"),b=a.next(),b.length||(b=this.$el.find("li:first")),b.addClass("cur")},b.prototype.prev=function(){var a,b;return a=this.$el.find(".cur").removeClass("cur"),b=a.prev(),b.length||(b=this.$el.find("li:last")),b.addClass("cur")},b.prototype.show=function(){var a;return this.context.mark_range(),this.visible()||(this.$el.show(),this.context.trigger("shown")),(a=this.context.rect())?this.reposition(a):void 0},b.prototype.hide=function(a){var b;return isNaN(a&&this.visible())?(this.context.reset_rect(),this.$el.hide(),this.context.trigger("hidden")):(b=function(a){return function(){return a.hide()}}(this),clearTimeout(this.timeout_id),this.timeout_id=setTimeout(b,a))},b.prototype.render=function(b){var c,d,e,f,g,h,i;if(!(a.isArray(b)&&b.length>0))return void this.hide();for(this.$el.find("ul").empty(),d=this.$el.find("ul"),g=this.context.get_opt("tpl"),h=0,i=b.length;i>h;h++)e=b[h],e=a.extend({},e,{"atwho-at":this.context.at}),f=this.context.callbacks("tpl_eval").call(this.context,g,e),c=a(this.context.callbacks("highlighter").call(this.context,f,this.context.query.text)),c.data("item-data",e),d.append(c);return this.show(),d.find("li:first").addClass("cur")},b}(),h={DOWN:40,UP:38,ESC:27,TAB:9,ENTER:13,CTRL:17,P:80,N:78},g={before_save:function(b){var c,d,e,f;if(!a.isArray(b))return b;for(f=[],d=0,e=b.length;e>d;d++)c=b[d],f.push(a.isPlainObject(c)?c:{name:c});return f},matcher:function(a,b,c){var d,e;return a=a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&"),c&&(a="(?:^|\\s)"+a),e=new RegExp(a+"([A-Za-z0-9_+-]*)$|"+a+"([^\\x00-\\xff]*)$","gi"),d=e.exec(b),d?d[2]||d[1]:null},filter:function(a,b,c){var d,e,f,g;for(g=[],e=0,f=b.length;f>e;e++)d=b[e],~d[c].toLowerCase().indexOf(a)&&g.push(d);return g},remote_filter:null,sorter:function(a,b,c){var d,e,f,g;if(!a)return b;for(g=[],e=0,f=b.length;f>e;e++)d=b[e],d.atwho_order=d[c].toLowerCase().indexOf(a),d.atwho_order>-1&&g.push(d);return g.sort(function(a,b){return a.atwho_order-b.atwho_order})},tpl_eval:function(a,b){var c;try{return a.replace(/\$\{([^\}]*)\}/g,function(a,c){return b[c]})}catch(d){return c=d,""}},highlighter:function(a,b){var c;return b?(c=new RegExp(">\\s*(\\w*)("+b.replace("+","\\+")+")(\\w*)\\s*<","ig"),a.replace(c,function(a,b,c,d){return"> "+b+"<strong>"+c+"</strong>"+d+" <"})):a},before_insert:function(a){return a}},c={load:function(a,b){var c;return(c=this.controller(a))?c.model.load(b):void 0},getInsertedItemsWithIDs:function(b){var c,d,e;return(c=this.controller(b))?(b&&(b="-"+(c.get_opt("alias")||c.at)),d=[],e=a.map(this.$inputor.find("span.atwho-view-flag"+(b||"")),function(b){var c;return c=a(b).data("atwho-data-item"),d.indexOf(c.id)>-1?void 0:(c.id&&(d.push=c.id),c)}),[d,e]):[null,null]},getInsertedItems:function(a){return c.getInsertedItemsWithIDs.apply(this,[a])[1]},getInsertedIDs:function(a){return c.getInsertedItemsWithIDs.apply(this,[a])[0]},setIframe:function(a){return this.setIframe(a)},run:function(){return this.dispatch()},destroy:function(){return this.shutdown(),this.$inputor.data("atwho",null)}},e={init:function(b){var c,e;return e=(c=a(this)).data("atwho"),e||c.data("atwho",e=new d(this)),e.reg(b.at,b),this}},b=a("<div id='atwho-container'></div>"),a.fn.atwho=function(d){var f,g;return g=arguments,a("body").append(b),f=null,this.filter("textarea, input, [contenteditable=true]").each(function(){var b;return"object"!=typeof d&&d?c[d]?(b=a(this).data("atwho"))?f=c[d].apply(b,Array.prototype.slice.call(g,1)):void 0:a.error("Method "+d+" does not exist on jQuery.caret"):e.init.apply(this,g)}),f||this},a.fn.atwho["default"]={at:void 0,alias:void 0,data:null,tpl:"<li data-value='${atwho-at}${name}'>${name}</li>",insert_tpl:"<span>${atwho-data-value}</span>",callbacks:g,search_key:"name",start_with_space:!0,limit:5,max_len:20,display_timeout:300}})}).call(this);
/*! jquery.caret 2014-04-04 */
(function(){!function(a){return"function"==typeof define&&define.amd?define(["jquery"],a):a(window.jQuery)}(function(a){"use strict";var b,c,d,e,f,g,h,i,j,k,l;return k="caret",b=function(){function b(a){this.$inputor=a,this.domInputor=this.$inputor[0]}return b.prototype.setPos=function(){return this.domInputor},b.prototype.getIEPosition=function(){return a.noop()},b.prototype.getPosition=function(){return a.noop()},b.prototype.getOldIEPos=function(){var a,b;return b=h.selection.createRange(),a=h.body.createTextRange(),a.moveToElementText(this.domInputor),a.setEndPoint("EndToEnd",b),a.text.length},b.prototype.getPos=function(){var a,b,c;return(c=this.range())?(a=c.cloneRange(),a.selectNodeContents(this.domInputor),a.setEnd(c.endContainer,c.endOffset),b=a.toString().length,a.detach(),b):h.selection?this.getOldIEPos():void 0},b.prototype.getOldIEOffset=function(){var a,b;return a=h.selection.createRange().duplicate(),a.moveStart("character",-1),b=a.getBoundingClientRect(),{height:b.bottom-b.top,left:b.left,top:b.top}},b.prototype.getOffset=function(){var b,c,d,e;if(j.getSelection&&(d=this.range())){if(d.endOffset-1<0)return null;b=d.cloneRange(),b.setStart(d.endContainer,d.endOffset-1),b.setEnd(d.endContainer,d.endOffset),e=b.getBoundingClientRect(),c={height:e.height,left:e.left+e.width,top:e.top},b.detach()}else h.selection&&(c=this.getOldIEOffset());return c&&!i&&(c.top+=a(j).scrollTop(),c.left+=a(j).scrollLeft()),c},b.prototype.range=function(){var a;if(j.getSelection)return a=j.getSelection(),a.rangeCount>0?a.getRangeAt(0):null},b}(),c=function(){function b(a){this.$inputor=a,this.domInputor=this.$inputor[0]}return b.prototype.getIEPos=function(){var a,b,c,d,e,f,g;return b=this.domInputor,f=h.selection.createRange(),e=0,f&&f.parentElement()===b&&(d=b.value.replace(/\r\n/g,"\n"),c=d.length,g=b.createTextRange(),g.moveToBookmark(f.getBookmark()),a=b.createTextRange(),a.collapse(!1),e=g.compareEndPoints("StartToEnd",a)>-1?c:-g.moveStart("character",-c)),e},b.prototype.getPos=function(){return h.selection?this.getIEPos():this.domInputor.selectionStart},b.prototype.setPos=function(a){var b,c;return b=this.domInputor,h.selection?(c=b.createTextRange(),c.move("character",a),c.select()):b.setSelectionRange&&b.setSelectionRange(a,a),b},b.prototype.getIEOffset=function(a){var b,c,d,e;return c=this.domInputor.createTextRange(),a||(a=this.getPos()),c.move("character",a),d=c.boundingLeft,e=c.boundingTop,b=c.boundingHeight,{left:d,top:e,height:b}},b.prototype.getOffset=function(b){var c,d,e;return c=this.$inputor,h.selection?(d=this.getIEOffset(b),d.top+=a(j).scrollTop()+c.scrollTop(),d.left+=a(j).scrollLeft()+c.scrollLeft(),d):(d=c.offset(),e=this.getPosition(b),d={left:d.left+e.left-c.scrollLeft(),top:d.top+e.top-c.scrollTop(),height:e.height})},b.prototype.getPosition=function(a){var b,c,e,f,g,h;return b=this.$inputor,e=function(a){return a.replace(/</g,"&lt").replace(/>/g,"&gt").replace(/`/g,"&#96").replace(/"/g,"&quot").replace(/\r\n|\r|\n/g,"<br />")},void 0===a&&(a=this.getPos()),h=b.val().slice(0,a),f="<span>"+e(h)+"</span>",f+="<span id='caret'>|</span>",g=new d(b),c=g.create(f).rect()},b.prototype.getIEPosition=function(a){var b,c,d,e,f;return d=this.getIEOffset(a),c=this.$inputor.offset(),e=d.left-c.left,f=d.top-c.top,b=d.height,{left:e,top:f,height:b}},b}(),d=function(){function b(a){this.$inputor=a}return b.prototype.css_attr=["overflowY","height","width","paddingTop","paddingLeft","paddingRight","paddingBottom","marginTop","marginLeft","marginRight","marginBottom","fontFamily","borderStyle","borderWidth","wordWrap","fontSize","lineHeight","overflowX","text-align"],b.prototype.mirrorCss=function(){var b,c=this;return b={position:"absolute",left:-9999,top:0,zIndex:-2e4,"white-space":"pre-wrap"},a.each(this.css_attr,function(a,d){return b[d]=c.$inputor.css(d)}),b},b.prototype.create=function(b){return this.$mirror=a("<div></div>"),this.$mirror.css(this.mirrorCss()),this.$mirror.html(b),this.$inputor.after(this.$mirror),this},b.prototype.rect=function(){var a,b,c;return a=this.$mirror.find("#caret"),b=a.position(),c={left:b.left,top:b.top,height:a.height()},this.$mirror.remove(),c},b}(),e={contentEditable:function(a){return!(!a[0].contentEditable||"true"!==a[0].contentEditable)}},g={pos:function(a){return a||0===a?this.setPos(a):this.getPos()},position:function(a){return h.selection?this.getIEPosition(a):this.getPosition(a)},offset:function(b){var c,d;return d=this.getOffset(b),i&&(c=a(i).offset(),d.top+=c.top,d.left+=c.left),d}},h=null,j=null,i=null,l=function(a){return i=a,j=a.contentWindow,h=a.contentDocument||j.document},f=function(b,c){var d,e;if(a.isPlainObject(c)&&(e=c.iframe))return b.data("caret-iframe",e),l(e);if(e=b.data("caret-iframe"))return l(e);h=b[0].ownerDocument,j=h.defaultView||h.parentWindow;try{return i=j.frameElement}catch(f){d=f}},a.fn.caret=function(d){var h;return"object"==typeof d?(f(this,d),this):g[d]?(f(this),h=e.contentEditable(this)?new b(this):new c(this),g[d].apply(h,Array.prototype.slice.call(arguments,1))):a.error("Method "+d+" does not exist on jQuery.caret")},a.fn.caret.EditableCaret=b,a.fn.caret.InputCaret=c,a.fn.caret.Utils=e,a.fn.caret.apis=g})}).call(this);