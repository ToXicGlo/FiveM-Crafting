fx_version 'cerulean'
game 'gta5'
version '1.1.0'

shared_script 'config.lua'
dependency 'oxmysql'

client_scripts  {
    'client/client.lua',
}

server_scripts  {
    '@vrp/lib/utils.lua',
    'server/server.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/script.js',
    'html/success.mp3',
    'html/images/*.png'
}
  