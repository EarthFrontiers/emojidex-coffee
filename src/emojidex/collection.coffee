class Emojidex::Collection
  emoji
  category
  constructor: (emoji_list = null) ->
    @emoji = Hash.new
    @category = Hash.new
    if emoji_list
      @push(emoji_list)

  # load emoji from the emoji.json found at the path
  # can be used to load local or remote assets
  load: (path) ->

  # push emoji or a list of emoji into the collection emoji
  # collisions are overwritten and emoji are re-categorizes after addition
  push: (list) ->
    for moji in list
      @emoji[moji.code] = moji
    @_categorize()

  concat: (list) ->
    for key, value of list
      @emoji[key] = value

  find_by_code: (code) ->
    @emoji[code]

  find_by_moji: (moji) ->
    for code, emoji of @emoji
      return emoji if emoji.moji == moji

  _categorize: ->
    @category = {}
    for moji in @emoji
      @category[emoji.category].push emoji.code

 # palettize: ->
 #   if @emojis_data_array.length is 2
 #     @setAutoComplete @options
 #     
 #     @pallet = new Emojidex::Palette @emojis_data_array, $("#ep"), @options
 #     @pallet.setPallet()
