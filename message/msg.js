"use strict";
const {
	downloadContentFromMessage
} = require("@adiwajshing/baileys-md")
const { color, bgcolor } = require('../lib/color')
const { getBuffer, fetchJson, fetchText, getRandom, getGroupAdmins, runtime, sleep } = require("../lib/myfunc");
const { webp2mp4File } = require("../lib/convert")

const fs = require ("fs")
const moment = require("moment-timezone");
const util = require("util")
const { exec, spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const xfar = require('xfarr-api');
const axios = require('axios')
const hxz = require("hxz-api")
const yts = require("yt-search")
const speed = require("performance-now")

// Database
let mess = JSON.parse(fs.readFileSync('./message/response.json'));

moment.tz.setDefault("Asia/Colombo").locale("id");

module.exports = async(conn, msg, m, setting) => {
	try {
		let { ownerNumber, botName } = setting
		let { allmenu } = require('./help')
		const jam = moment.tz('asia/colombo').format('HH:mm:ss')
		let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
		const ucapanWaktu = "Selamat "+dt.charAt(0).toUpperCase() + dt.slice(1)
		const type = Object.keys(msg.message)[0]
		const content = JSON.stringify(msg.message)
		const fromMe = msg.key.fromMe
		const from = msg.key.remoteJid
		const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : ''
		const toJSON = j => JSON.stringify(j, null,'\t')
		if (conn.multi) {
			var prefix = /^[°•><π÷×¶∆£¢€¥®™✓Z=|~!?#$%^&.\/\\©^]/.test(chats) ? chats.match(/^[°•><π÷×¶∆£¢€¥®™✓Z=|~!?#$%^&.\/\\©^]/gi)[0] : '-'
		} else {
			if (conn.nopref) {
				prefix = ''
			} else {
				prefix = conn.prefa
			}
		}
		const args = chats.split(' ')
		const command = chats.toLowerCase().split(' ')[0] || ''
		const isCmd = command.startsWith(prefix)
		const isGroup = msg.key.remoteJid.endsWith('@g.us')
		const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
		const isOwner = ownerNumber.includes(sender)
		const pushname = msg.pushName
		const q = chats.slice(command.length + 1, chats.length)
		const body = chats.startsWith(prefix) ? chats : ''
		const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
		const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
		const groupName = isGroup ? groupMetadata.subject : ''
		const groupId = isGroup ? groupMetadata.id : ''
		const groupMembers = isGroup ? groupMetadata.participants : ''
		const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
		const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
		const isGroupAdmins = groupAdmins.includes(sender)
		
		async function downloadAndSaveMediaMessage (type_file, path_file) {
			if (type_file === 'image') {
				var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
				let buffer = Buffer.from([])
				for await(const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				fs.writeFileSync(path_file, buffer)
			} else if (type_file === 'video') {
				var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
				let buffer = Buffer.from([])
				for await(const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				fs.writeFileSync(path_file, buffer)
			} else if (type_file === 'sticker') {
				var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
				let buffer = Buffer.from([])
				for await(const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				fs.writeFileSync(path_file, buffer)
			} else if (type_file === 'audio') {
				var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
				let buffer = Buffer.from([])
				for await(const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				fs.writeFileSync(path_file, buffer)
			}
		}
		const sendFileFromUrl = async (from, url, caption, options = {}) => {
		    let mime = '';
		    let res = await axios.head(url)
		    mime = res.headerd["content-type"]
		    let type = mime.split("/")[0]+"Message"
		    if (mime.split("/")[0] === "image") {
		       var img = await getBuffer(url)
		       return conn.sendMessage(from, { image: img, caption: caption }, options)
		    } else if (mime.split("/")[0] === "video") {
		       var vid = await getBuffer(url)
		       return conn.sendMessage(from, { video: vid, caption: caption }, options)
		    } else if (mime.split("/")[0] === "audio") {
		       var aud = await getBuffer(url)
		       return conn.sendMessage(from, { audio: aud, mimetype: 'audio/mp3' }, options)
		    } else {
		       var doc = await getBuffer(url)
		       return conn.sendMessage(from, { document: doc, mimetype: mime, caption: caption }, options)
		    }
		}
                async function sendPlay(from, query) {
                  var url = await yts(query)
                  url = url.videos[0].url
                  hxz.youtube(url).then(async(data) => {
                  var button = [{ buttonId: `!ytmp3 ${url}`, buttonText: { displayText: `🎵 Audio (${data.size_mp3})` }, type: 1 }, { buttonId: `!ytmp4 ${url}`, buttonText: { displayText: `🎥 Video (${data.size})` }, type: 1 }]
                  conn.sendMessage(from, { caption: `*Title :* ${data.title}\n*Quality :* ${data.quality}\n*Url :* https://youtu.be/${data.id}`, location: { jpegThumbnail: await getBuffer(data.thumb) }, buttons: button, footer: 'Pilih Salah Satu Button Dibawah⬇️', mentions: [sender] })
                  }).catch((e) => {
                    conn.sendMessage(from, { text: mess.error.api }, { quoted: msg })
                    ownerNumber.map( i => conn.sendMessage(from, { text: `Send Play Error : ${e}` }))
                  })
                }
		const isUrl = (url) => {
			return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
		}
		const reply = (teks) => {
			conn.sendMessage(from, { text: teks }, { quoted: msg })
		}
		const textImg = (teks) => {
			return conn.sendMessage(from, { text: teks, jpegThumbnail: fs.readFileSync(setting.pathimg) }, { quoted: msg })
		}
		const sendMess = (hehe, teks) => {
			conn.sendMessage(hehe, { text, teks })
		}
		const buttonWithText = (from, text, footer, buttons) => {
			return conn.sendMessage(from, { text: text, footer: footer, templateButtons: buttons })
		}
		const sendContact = (jid, numbers, name, quoted, mn) => {
			let number = numbers.replace(/[^0-9]/g, '')
			const vcard = 'BEGIN:VCARD\n' 
			+ 'VERSION:3.0\n' 
			+ 'FN:' + name + '\n'
			+ 'ORG:;\n'
			+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
			+ 'END:VCARD'
			return conn.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
		}
		
		const templateButtons = [
			{ callButton: {displayText: `Call Owner!`, phoneNumber: `+6285791458996`} },
			{ urlButton: { displayText: `Website!`, url : `https://irfanhariyanto.tk`} },
			{ quickReplyButton: { displayText: `🧑 Owner`, id: `${prefix}owner` } },
			{ quickReplyButton: { displayText: `👀 runtime`, id: `${prefix}ping` } },
			{ quickReplyButton: { displayText: `📋 All Menu`, id: `${prefix}allmenu` } }
		]
        
		const isImage = (type == 'imageMessage')
		const isVideo = (type == 'videoMessage')
		const isSticker = (type == 'stickerMessage')
		const isQuotedMsg = (type == 'extendedTextMessage')
		const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
		const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
		const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true : false : false
		const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
		const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false
		
		if (chats.startsWith('>') && isOwner) {
		  const ev = (sul) => {
                   var sat = JSON.stringify(sul, null, 2)
                   var bang = util.format(sat)
                    if (sat == undefined) {
                     bang = util.format(sul)
                    }
                   return textImg(bang)
                  }
                 try {
                  textImg(util.format(eval(`;(async () => { ${q} })()`)))
                 } catch (e) {
                  textImg(util.format(e))
                 }
		}
		
		// Logs;
		if (!isGroup && isCmd) console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
		if (isGroup && isCmd) console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(msg.messageTimestamp *1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
		
		switch(command) {
			case prefix+'menu':
			case prefix+'help':
				buttonWithText(from, `Hai ${pushname !== undefined ? pushname : 'Kak'} ${ucapanWaktu}, Aku adalah *${botName}*
				
Botkingdom ${prefix}owner`, `Botkingdom © 2021`, templateButtons)
				break
			case prefix+'allmenu':
			    textImg(allmenu(conn, prefix, pushname))
			    break
			case prefix+'test':
		            reply('Test, sukses respon!')
			    break
			case prefix+'runtime':
			    reply(runtime(process.uptime()))
			    break
			case prefix+'speed':
			    let timestamp = speed();
                            let latensi = speed() - timestamp
                            textImg(`${latensi.toFixed(4)} Second`)
		            break
			case prefix+'group':
			case prefix+'donasi':
			    reply(`──「 https://chat.whatsapp.com/CIDWlH7yzEsKombRDcTKcV─`)
			    break
			case prefix+'owner':
			    for (let x of ownerNumber) {
			      sendContact(from, x.split('94753943957@s.whatsapp.net')[0], 'Owner', msg)
			    }
			    break
	/*<------- Converter/Tools ------->*/
			case prefix+'sticker': case prefix+'stiker': case prefix+'s':
			    if (isImage || isQuotedImage) {
		               var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
			       var buffer = Buffer.from([])
			       for await(const chunk of stream) {
			          buffer = Buffer.concat([buffer, chunk])
			       }
			       var rand1 = 'sticker/'+getRandom('.jpg')
			       var rand2 = 'sticker/'+getRandom('.webp')
			       fs.writeFileSync(`./${rand1}`, buffer)
			       ffmpeg(`./${rand1}`)
				.on("error", console.error)
				.on("end", () => {
				  exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
				    conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
				    fs.unlinkSync(`./${rand1}`)
			            fs.unlinkSync(`./${rand2}`)
			          })
				 })
				.addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
				.toFormat('webp')
				.save(`${rand2}`)
			     } else if (isVideo || isQuotedVideo) {
				 var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
				 var buffer = Buffer.from([])
				 for await(const chunk of stream) {
				   buffer = Buffer.concat([buffer, chunk])
				 }
			         var rand1 = 'sticker/'+getRandom('.mp4')
				 var rand2 = 'sticker/'+getRandom('.webp')
			         fs.writeFileSync(`./${rand1}`, buffer)
			         ffmpeg(`./${rand1}`)
				  .on("error", console.error)
				  .on("end", () => {
				    exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
				      conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
				      fs.unlinkSync(`./${rand1}`)
				      fs.unlinkSync(`./${rand2}`)
				    })
				  })
				 .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
				 .toFormat('webp')
				 .save(`${rand2}`)
                              } else {
			        reply(`Kirim gambar/vidio dengan caption ${command} atau balas gambar/vidio yang sudah dikirim\nNote : Maximal vidio 10 detik!`)
			      }
                              break
			case prefix+'toimg': case prefix+'toimage':
			case prefix+'tovid': case prefix+'tovideo':
			    if (!isQuotedSticker) return reply(`Reply stikernya!`)
			    var stream = await downloadContentFromMessage(msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
			    var buffer = Buffer.from([])
			    for await(const chunk of stream) {
			       buffer = Buffer.concat([buffer, chunk])
			    }
			    var rand1 = 'sticker/'+getRandom('.webp')
			    var rand2 = 'sticker/'+getRandom('.png')
			    fs.writeFileSync(`./${rand1}`, buffer)
			    if (isQuotedSticker && msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.isAnimated !== true) {
			    exec(`ffmpeg -i ./${rand1} ./${rand2}`, (err) => {
			      fs.unlinkSync(`./${rand1}`)
			      if (err) return reply(mess.error.api)
			      conn.sendMessage(from, { image: { url: `./${rand2}` }}, { quoted: msg })
			      fs.unlinkSync(`./${rand2}`)
			    })
			    } else {
			    reply(mess.wait)
		            webp2mp4File(`./${rand1}`).then( data => {
			      fs.unlinkSync(`./${rand1}`)
			      conn.sendMessage(from, { video: { url: data.result }}, { quoted: msg })
			    })
			    }
			    break
	/*<-------- Downloader ------->*/
			case prefix+'tiktok':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('tiktok')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    xfar.Tiktok(args[1]).then( data => {
			      conn.sendMessage(from, {
				 video: { url: data.medias[0].url },
				 caption: `${data.title}\n\nඅවශ්‍ය මාධ්‍ය තෝරන්න`,
				 buttons: [{buttonId: `${prefix}tiktoknowm ${args[1]}`, buttonText: { displayText: "Without Watermark" }, type: 1 },
					   {buttonId: `${prefix}tiktokaudio ${args[1]}`, buttonText: { displayText: "Audio" }, type: 1 }],
				 footer: "Create by ᳆⃞✪⃟⃟𝐬𝐮𝐩𝐮𝐧★᭄_"
			      }, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
			    break
			case prefix+'tiktoknowm':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('tiktok')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    hxz.ttdownloader(args[1]).then( data => {
			      conn.sendMessage(from, { video: { url: data.nowm }}, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
			    break
			case prefix+'tiktokaudio':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('tiktok')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    hxz.ttdownloader(args[1]).then( data => {
			      conn.sendMessage(from, { audio: { url: data.nowm }, mimetype: 'audio/mp4' }, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
		            break
                        case prefix+'song':
                            if (args.length < 2) return reply(`Kirim perintah ${command} query\nContoh : ${command} monokrom`)
                            reply(mess.wait)
                            await sendPlay(from, q)
                            break
			case prefix+'ytmp4': case prefix+'video':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('youtu.be') && !args[1].includes('youtube.com')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    xfar.Youtube(args[1]).then( data => {
			      var teks = `*Youtube Video Downloader*\n\n*≻ Title :* ${data.title}\n*≻ Quality :* ${data.medias[1].quality}\n*≻ Size :* ${data.medias[1].formattedSize}\n*≻ Url Source :* ${data.url}\n\n_wait a minute sending media..._`
			      conn.sendMessage(from, { video: { url: data.medias[1].url }, caption: teks }, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
			    break
			case prefix+'ytmp3': case prefix+'mp3':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('youtu.be') && !args[1].includes('youtube.com')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    xfar.Youtube(args[1]).then( data => {
			      var teks = `*Youtube Audio Downloader*\n\n*≻ Title :* ${data.title}\n*≻ Quality :* ${data.medias[7].quality}\n*≻ Size :* ${data.medias[7].formattedSize}\n*≻ Url Source :* ${data.url}\n\n_wait a minute sending media..._`
			      conn.sendMessage(from, { image: { url: data.thumbnail }, caption: teks }, { quoted: msg })
			      conn.sendMessage(from, { document: { url: data.medias[7].url }, fileName: `${data.title}.mp3`, mimetype: 'audio/mp3' }, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
			    break
			case prefix+'igdl': case prefix+'instagram': case prefix+'ig':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('instagram.com')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    xfar.Instagram(args[1]).then( data => {
			      var teks = `*Instagram Downloader*\n\n*≻ Title :* ${data.title}\n*≻ Jumlah Media :* ${data.medias.length}\n*≻ Url Source :* ${data.url}\n\n_wait a minute sending media..._`
			      reply(teks)
			       for (let i of data.medias) {
				 if (i.extension === "mp4") {
				   conn.sendMessage(from, { video: { url: i.url }})
				 } else if (i.extension === "jpg") {
				   conn.sendMessage(from, { image: { url: i.url }})
			         }
			       }
			    }).catch(() => reply(mess.error.api))
			    break
			case prefix+'facebook': case prefix+'fbdl':
			    if (args.length < 2) return reply(`Kirim perintah ${command} link`)
			    if (!isUrl(args[1])) return reply(mess.error.Iv)
			    if (!args[1].includes('facebook.com')) return reply(mess.error.Iv)
			    reply(mess.wait)
			    xfar.Facebook(args[1]).then( data => {
			      conn.sendMessage(from, { video: { url: data.medias[0].url }, caption: data.title }, { quoted: msg })
			    }).catch(() => reply(mess.error.api))
			    break
			default:
			if (!isGroup && isCmd) {
				reply(`Command belum tersedia, coba beberapa hari kedepan yaa! _^`)
			}
		}
	} catch (e) {
		console.log('Error : %s', color(e, 'red'))
	}
}
