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
    asset_path: "http://assets.emojidex.com/emoji/"
    local_asset_path: null
    emojiarea:
      plaintext: "emojidex-plaintext"
      wysiwyg: "emojidex-wysiwyg"
      rawtext: "emojidex-rawtext"

  $.fn[pluginName] = (options) ->
    @each ->
      if !$.data(@, "plugin_#{pluginName}")
        $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

  class Plugin
    constructor: (@element, options) ->
      @options = $.extend {}, defaults, options
      @_defaults = defaults
      @_name = pluginName

      @collection = Emojidex::Collection.new

      if opts['local_asset_path']
        @collection.load opts['local_asset_path']

    #  @api = new Emojidex::API @element, @options
    #  @api.load =>
    #    @emoji.push @api.emoji

   # setAutoComplete: (options) ->
   #   at_config =
   #     at: ":"
   #     data: emoji
   #     tpl: "<li data-value=':${key}:'><img src='${img_url}' height='20' width='20' /> ${name}</li>"
   #     insert_tpl: "<img src='${img_url}' height='20' width='20' />"
   #   options.emojiarea["plaintext"].atwho(at_config)
   #   options.emojiarea["wysiwyg"].atwho(at_config)
   #   cke.atwho at_config

   # setEmojiarea: (options) ->
   #   options.emojiarea["plaintext"].emojiarea wysiwyg: false
   #   # options.emojiarea["wysiwyg"].emojiarea wysiwyg: true
   #   options.emojiarea["wysiwyg"].on "change", ->
   #     console.dir @
   #     # console.dir options.emojiarea["rawtext"].text
   #     options.emojiarea["rawtext"].text $(this).val()
   #   options.emojiarea["wysiwyg"].trigger "change"
