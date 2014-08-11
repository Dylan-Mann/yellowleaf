ftp = require './ftp'
rest = require './rest'

Drive = require './filesystem'

module.exports = (ftpport, webport) ->
  if ftpport?
    server = ftp (user, password) ->
      if user is 'jonathan' and password is 'wigancoldstream13'
        new Drive "/home/sclc"
      else if user is 'ryan' and password is 'minecraft100'
        new Drive "/home/server"
      else if user is 'dylan' and password is 'dylan'
        new Drive "/home/skylegendsmc.com/"
      else if user is 'admin@hullerdesigns.co.uk' and password is 'Lujh2222'
        new Drive "/home/hullerdesigns/"
    , ftpport
    console.log 'FTP listening on', ftpport

  if webport?
    console.log 'Web?!'
    #rest (req) ->
    #  req
    #, 8484

  ->
    if server?
      server.close()


if not module.parent?
  module.exports 8021
