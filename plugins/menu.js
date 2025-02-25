let fs = require('fs')
let path = require('path')
let moment = require('moment-timezone')
const defaultMenu = {
  before: `
╭──────〔 *%me* 〕
│ Hai, %name!
│ 
│ Date: %date
│ Time: *%time*
│
│ Uptime: *%uptime*
│ Github: %github
│
╰─────〔 *%me* 〕
`.trimStart(),
  header: '┌─〔 %category 〕',
  body: '├ %cmd',
  footer: '└────\n',
  after: `*%npmname@^%version*
${'```%npmdesc```'}
`,
}
  let anuplug = async (m, anubis, {  usedPrefix, args, command }) => {
    let tags
    let teks = `${args[0]}`.toLowerCase()
    let arrayMenu = ['all', 'sticker', 'inject', 'downloader', 'group', 'tools', 'main', 'owner' ]
    if (!arrayMenu.includes(teks)) teks = 'null'
    if (teks == 'all') tags = {
      'sticker': 'Sticker',
      'inject': 'Inject Tools',
      'downloader': 'Downloader',
      'group': 'Group',
      'main': 'Main',
      'owner': 'Owner',
      'tools': 'Tools',
    }
    if (teks == 'main') tags = { 'main': 'Main' }
    if (teks == 'inject') tags = { 'inject': 'Inject Tools' }
    if (teks == 'sticker') tags = { 'sticker': 'Sticker' }
    if (teks == 'tools') tags = { 'tools': 'Tools' }
    if (teks == 'owner') tags = { 'owner': 'Owner' }
    if (teks == 'downloader') tags = { 'downloader': 'Downloader' }
    if (teks == 'group') tags = { 'group': 'Group' }
    
    try {
      let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
      let name = anubis.db.data.users[m.sender].name ? anubis.getName(m.sender) : ''
      let time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
      let date = moment.tz('Asia/Jakarta').format('DD/MM/YY')
      let uptime = clockString(process.uptime() * 1000)
      let totalreg = Object.keys(anubis.db.data.users).length
      let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
        return {
          help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
          tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
          prefix: 'customPrefix' in plugin,
          enabled: !plugin.disabled,
        }
      })
      if (teks == 'null') {
        let rows = []
        arrayMenu.splice(arrayMenu.length, arrayMenu.length);
        arrayMenu.forEach((xres, i) => {
          rows.push(
              { title: xres, description: ``, rowId: `${usedPrefix}menu ${xres}` }
            )
        })
        let secs = [
          {
            title: 'MENU',
            rows: rows
          }
        ]
        return anubis.sendList(m.chat, 'MENU', `${ucapan()} ${name}`, 'MENU', secs, {quoted: m})
      }

      let groups = {}
      for (let tag in tags) {
        groups[tag] = []
        for (let plugin of help)
          if (plugin.tags && plugin.tags.includes(tag))
            if (plugin.help) groups[tag].push(plugin)
      }

      anubis.menu = anubis.menu ? anubis.menu : {}
      let before = anubis.menu.before || defaultMenu.before
      let header = anubis.menu.before || defaultMenu.header
      let body = anubis.menu.before || defaultMenu.body
      let footer = anubis.menu.before || defaultMenu.footer
      let after = anubis.menu.after || (anubis.user.id ? '' : `Powered by https://wa.me/${anubis.user.id.split(`@`)[0]}`) + defaultMenu.after
      
      let _text = [
        before,
        ...Object.keys(tags).map(tag => {
          return header.replace(/%category/g, tags[tag]) + '\n' + [
            ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
              return menu.help.map(help => {
                return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .trim()
              }).join('\n')
            }),
            footer
          ].join('\n')
        }),
        after
      ].join('\n')
      pesen = typeof anubis.menu == 'string' ? anubis.menu : typeof anubis.menu == 'object' ? _text : ''
      let replace = {
        '%': '%',
        p: usedPrefix, uptime,
        me: anubis.user.name,
        npmname: package.name,
        npmdesc: package.description,
        version: package.version,
        github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
        name, time, date, totalreg, readmore: readMore
      }
      pesen = pesen.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])
      let buttons = [
        { buttonId: `${usedPrefix}ping`, buttonText: { displayText: "Status Bot" }, type: 1 },
        { buttonId: `${usedPrefix}owner`, buttonText: { displayText: "Contact Owner" }, type: 1 },
        { buttonId: `${usedPrefix}changelog`, buttonText: { displayText: "Change Logs" }, type: 1 },
      ];
      let buttonMessage = {
        image: global.thumb,
        caption: pesen.trim(),
        footer: anuFooter,
        buttons: buttons,
      };
      anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
    } catch (err) {
      console.log(err)
    }
   
  }
  anuplug.help = ['menu', 'help', '?']
  anuplug.tags = ['main']
  anuplug.command = /^(menu|help|\?)$/i
  module.exports = anuplug
  
  const more = String.fromCharCode(8206)
  const readMore = more.repeat(4001)
  
  function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }

  function ucapan() {
    const time = moment.tz('Asia/Jakarta').format('HH')
    res = "Selamat dinihari"
    if (time >= 4) {
      res = "Selamat pagi"
    }
    if (time > 10) {
      res = "Selamat siang"
    }
    if (time >= 15) {
      res = "Selamat sore"
    }
    if (time >= 18) {
      res = "Selamat malam"
    }
    return res
  }