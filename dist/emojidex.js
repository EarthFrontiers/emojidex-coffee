/*
 *  jQuery Emojidex - v0.1.0
 *  emojidex coffee plugin for jQuery/Zepto and compatible
 *  https://github.com/Genshin/emojidex-coffee#emojidex-coffee
 *
 *  Made by Genshin
 *  Under LGPL License
 */
(function() {
  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "emojidex";
    defaults = {
      emojiarea: {
        plaintext: "emojidex-plaintext",
        wysiwyg: "emojidex-wysiwyg",
        value_output: "emojidex-rawtext"
      }
    };
    Plugin = (function() {
      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.loadEmojidexJSON(this.element, this.options);
        this.setEmojiarea(this.options);
      }

      Plugin.prototype.loadEmojidexJSON = function(element, options) {
        $.emojiarea.path = options.path_img;
        return $.getJSON(options.path_json, function(emojis_data) {
          var emoji_regexps;
          emojis_data = Plugin.prototype.getCategorizedData(emojis_data);
          $.emojiarea.icons = emojis_data;
          emoji_regexps = Plugin.prototype.setEmojiCSS_getEmojiRegexps(emojis_data);
          return Plugin.prototype.setEmojiIcon(emojis_data, element, emoji_regexps);
        });
      };

      Plugin.prototype.getCategorizedData = function(emojis_data) {
        var emoji, new_emojis_data, _i, _len;
        new_emojis_data = {};
        for (_i = 0, _len = emojis_data.length; _i < _len; _i++) {
          emoji = emojis_data[_i];
          if (new_emojis_data[emoji.category] == null) {
            new_emojis_data[emoji.category] = [emoji];
          } else {
            new_emojis_data[emoji.category].push(emoji);
          }
        }
        return new_emojis_data;
      };

      Plugin.prototype.setEmojiCSS_getEmojiRegexps = function(emojis_data) {
        var base64, category, emoji, emojis_css, emojis_in_category, regexp_for_code, regexp_for_utf, _i, _len;
        regexp_for_utf = "";
        regexp_for_code = ":(";
        emojis_css = $('<style type="text/css" />');
        for (category in emojis_data) {
          emojis_in_category = emojis_data[category];
          for (_i = 0, _len = emojis_in_category.length; _i < _len; _i++) {
            emoji = emojis_in_category[_i];
            regexp_for_utf += emoji.moji + "|";
            regexp_for_code += emoji.code + "|";
            base64 = Plugin.prototype.loadImageFromLocalStorage(emoji.code);
            if (base64) {
              emojis_css.append("i.emojidex-" + emoji.moji + " {background-image: url('" + base64 + "')}");
            } else {
              emojis_css.append("i.emojidex-" + emoji.moji + " {background-image: url('" + $.emojiarea.path + emoji.code + ".svg')}");
            }
          }
        }
        $("head").append(emojis_css);
        return [regexp_for_utf.slice(0, -1), regexp_for_code.slice(0, -1) + "):"];
      };

      Plugin.prototype.loadImageFromLocalStorage = function(key) {
        var base64;
        if (!localStorage) {
          return null;
        } else {
          base64 = localStorage.getItem(key);
          if (base64) {
            return base64;
          } else {
            Plugin.prototype.setImageToLocalStorage(key);
            return null;
          }
        }
      };

      Plugin.prototype.setImageToLocalStorage = function(key) {
        var canvas, image;
        canvas = document.createElement("canvas");
        if (!canvas || !canvas.getContext || !canvas.getContext("2d")) {
          return;
        }
        image = new Image();
        image.src = $.emojiarea.path + key + ".svg";
        return image.onload = function() {
          var base64;
          canvas = document.createElement("canvas");
          canvas.width = this.width;
          canvas.height = this.height;
          canvas.getContext("2d").drawImage(this, 0, 0);
          base64 = canvas.toDataURL();
          localStorage.setItem(key, base64);
        };
      };

      Plugin.prototype.setEmojiIcon = function(emojis_data, element, emoji_regexps) {
        var getEmojiTag, replaceForCode, replaceForUTF;
        getEmojiTag = function(emoji_utf) {
          return '<i class="emojidex-' + emoji_utf + '"></i>';
        };
        replaceForUTF = function(replaced_string, emoji_regexp) {
          return replaced_string = replaced_string.replace(new RegExp(emoji_regexp, "g"), function(matched_string) {
            return getEmojiTag(matched_string);
          });
        };
        replaceForCode = function(replaced_string, emoji_regexp, emojis_data) {
          return replaced_string = replaced_string.replace(new RegExp(emoji_regexp, "g"), function(matched_string) {
            var category, emoji, _i, _len, _ref;
            matched_string = matched_string.replace(/:/g, "");
            for (category in emojis_data) {
              _ref = emojis_data[category];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                emoji = _ref[_i];
                if (emoji.code === matched_string) {
                  return getEmojiTag(emoji.moji);
                }
              }
            }
          });
        };
        return $(element).find(":not(iframe,textarea,script)").andSelf().contents().filter(function() {
          return this.nodeType === Node.TEXT_NODE;
        }).each(function() {
          var replaced_string;
          replaced_string = this.textContent;
          replaced_string = replaceForUTF(replaced_string, emoji_regexps[0]);
          replaced_string = replaceForCode(replaced_string, emoji_regexps[1], emojis_data);
          return $(this).replaceWith(replaced_string);
        });
      };

      Plugin.prototype.setEmojiarea = function(options) {
        options.emojiarea["plaintext"].emojiarea({
          wysiwyg: false
        });
        options.emojiarea["wysiwyg"].on("change", function() {
          return options.emojiarea["value_output"].text($(this).val());
        });
        return options.emojiarea["wysiwyg"].trigger("change");
      };

      Plugin.prototype.prepareAutoComplete = function(emojis_data, options) {
        var category, emoji, emoji_config, emojis, _i, _len, _ref;
        emojis = [];
        for (category in emojis_data) {
          _ref = emojis_data[category];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            emoji = _ref[_i];
            emojis.push(emoji.code);
          }
        }
        emojis = $.map(emojis, function(value, i) {
          return {
            key: value,
            name: value
          };
        });
        emoji_config = {
          at: ":",
          data: emojis,
          tpl: "<li data-value=':${key}:'><img src='../src/assets/img/utf/${name}.svg'  height='20' width='20' /> ${name}</li>",
          insert_tpl: "<img src='../src/assets/img/utf/${name}.svg' height='20' width='20' />"
        };
        options.emojiarea["plaintext"].atwho(emoji_config);
        return options.emojiarea["wysiwyg"].atwho(emoji_config);
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

}).call(this);
