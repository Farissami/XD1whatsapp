/**
 * @ Author: XD1 Team Team
 * @ Create Time: 2021-02-01 19:29:50
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Modified time: 2021-08-04 00:16:16
 * @ Description: Handling message
 */

/* #region Import */
import { removeBackgroundFromImageBase64 } from 'remove.bg'
import { decryptMedia, Client } from '@open-wa/wa-automate'
import { exec, spawn } from 'child_process'
import { scheduleJob } from 'node-schedule'
// eslint-disable-next-line no-unused-vars
import { translate } from 'free-translate'
import moment from 'moment-timezone'
import appRoot from 'app-root-path'
import Ffmpeg from 'fluent-ffmpeg'
import { evaluate } from 'mathjs'
import toPdf from 'office-to-pdf'
import { inspect } from 'util'
import fetch from 'node-fetch'
import ytdl from 'ytdl-core'
import Crypto from 'crypto'
import jimp from 'jimp'
import fs from 'fs-extra'
import https from 'https'
import axios from 'axios'
import gTTS from 'gtts'

//Common-Js
const { existsSync, writeFileSync, readdirSync, readFileSync, writeFile, unlinkSync, createWriteStream } = fs
const { get } = axios
const { read } = jimp
/* #endregion */

/* #region LowDb */
import { LowSync, JSONFileSync } from 'lowdb'
import lodash from 'lodash'
const { sample, sampleSize } = lodash
const adapter = new JSONFileSync(appRoot + '/data/denda.json')
const db = new LowSync(adapter)
db.read()
db.data || (db.data = { groups: [] })
db.write()
db.chain = lodash.chain(db.data)
/* #endregion */

/* #region File Modules */
import {
    createReadFileSync, processTime, commandLog, receivedLog, formatin, inArray, last,
    unlinkIfExists, isFiltered, webpToPng, addFilter, isUrl, sleep, lolApi, prev
} from './utils/index.js'
import { getLocationData, urlShortener, cariKasar, schedule, canvas, cekResi, tebak, scraper, menuId, sewa, list, note, api } from './lib/index.js'
import { uploadImages } from './utils/fetcher.js'
import { cariNsfw } from './lib/kataKotor.js'
/* #endregion */

/* #region Load user data */
if (!existsSync('./data/stat.json')) {
    writeFileSync('./data/stat.json', `{ "todayHits" : 0, "received" : 0 }`)
}
// settings
// eslint-disable-next-line no-unused-vars
let { stickerHash, ownerNumber, memberLimit, groupLimit, prefix, groupOfc } = JSON.parse(readFileSync('./settings/setting.json'))
const { apiNoBg } = JSON.parse(readFileSync('./settings/api.json'))
const kataKasar = JSON.parse(readFileSync('./settings/katakasar.json'))
// database
const banned = JSON.parse(createReadFileSync('./data/banned.json'))
const welcome = JSON.parse(createReadFileSync('./data/welcome.json'))
const antiKasar = JSON.parse(createReadFileSync('./data/ngegas.json'))
const antiKasarKick = JSON.parse(createReadFileSync('./data/ngegaskick.json'))
const antiLinkGroup = JSON.parse(createReadFileSync('./data/antilinkgroup.json'))
const antiLink = JSON.parse(createReadFileSync('./data/antilink.json'))
const antiVirtex = JSON.parse(createReadFileSync('./data/antivirtex.json'))
const antiDelete = JSON.parse(createReadFileSync('./data/antidelete.json'))
const disableBot = JSON.parse(createReadFileSync('./data/disablebot.json'))
const groupPrem = JSON.parse(createReadFileSync('./data/premiumgroup.json'))
const groupBanned = JSON.parse(createReadFileSync('./data/groupbanned.json'))
const ownerBotOnly = JSON.parse(createReadFileSync('./data/ownerbotonly.json'))
// src
const Surah = JSON.parse(readFileSync('./src/json/surah.json'))
const httpsAgent = new https.Agent({ rejectUnauthorized: false })
/* #endregion */

/* #region Helper functions */
moment.tz.setDefault('Asia/Jakarta').locale('id')

/* #endregion */

/* #region Stats */
let { todayHits, received } = JSON.parse(readFileSync('./data/stat.json'))
// Save stats in json every 5 minutes
scheduleJob('*/5 * * * *', () => {
    receivedLog(received)
    commandLog(todayHits)
})

// Reset today hits at 00:01
scheduleJob('1 0 * * *', () => {
    received = 0
    todayHits = 0
})
/* #endregion */

/* #region Main Function */
const HandleMsg = async (message, browser, client = new Client()) => {
    received++ //Count msg received
    /* #region Default response message */
    const resMsg = {
        wait: sample([
            '⏳ حسنًا ، جاهز ، جارٍ المعالجة!',
            '⏳ حسنا اهدأ انتظر دقيقة!',
            '⏳ حسنًا ، انتظر دقيقة...',
            '⏳ هناك ضغط شديد انتظر!',
            '⏳ حسنًا ، تحلى بالصبر!',
            '⏳ يتم معالجتها!',
            '⏳ اوك!'
        ]),
        error: {
            norm: '❌ عذرا، هناك خطأ ما! حاول مرة أخرى بعد بضع دقائق.',
            admin: '⛔ هذا الأمر مخصص فقط لمسؤولي المجموعة!',
            owner: '⛔ هذا الأمر مخصص فقط لأصحاب الروبوتات!',
            group: `⛔ عذرًا ، لا يمكن استخدام هذا الأمر إلا في مجموعات!${groupOfc ? `\nJoin sini ${groupOfc}` : ''}`,
            botAdm: '⛔ لا يمكن استخدام هذا الأمر إلا عندما يصبح الروبوت المسؤول',
            join: '💣 يفشل! يبدو أنه تم طرد روبوت من تلك المجموعة ، أليس كذلك؟ حسنًا ، لا يمكن لبرامج الروبوت تسجيل الدخول مرة أخرى'
        },
        success: {
            join: '✅ انضم بنجاح إلى المجموعة عبر الرابط!',
            sticker: 'تم انشاء الملصق بنجاح 🎉',
            greeting: `مرحبا بكم جميعا انا 
			XD1 Team
			لمشاهدة الاوامر اكتب 
			/help`
        },
        badw: sample([
            'كلمة ممنوعة  😒',
            'كلمة ممنوعة  😠',
            'كلمة ممنوعة ! 😉',
            'كلمة ممنوعة  😀',
            'كلمة ممنوعة  🤔',
            'كلمة ممنوعة... ',
            'كلمة ممنوعة... '
        ])
    }
    /* #endregion */

    try {
        /* #region Variable Declarations */
        if (message.body === '..' && message.quotedMsg && ['chat', 'image', 'video'].includes(message.quotedMsg.type)) {
            // inject quotedMsg as Msg
            let _t = message.t
            message = message.quotedMsg
            message.t = _t
        }
        let { body, type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList, filehash } = message
        var { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const pengirim = sender.id
        const isBotGroupAdmin = groupAdmins.includes(botNumber) || false
        const stickerMetadata = { pack: '𝓕𝓞𝓞𝓡𝓨', author: 'XD1 Team', keepScale: true }
        const stickerMetadataCircle = { pack: '𝓕𝓞𝓞𝓡𝓨', author: 'XD1 Team', circle: true }
        const stickerMetadataCrop = { pack: '𝓕𝓞𝓞𝓡𝓨', author: 'XD1 Team', cropPosition: 'center' }
        // Bot Prefix Aliases
        const regex = /^[\\/!$^%&+.,-](?=\w+)/
        let chats = '' // whole chats body
        if (type === 'chat') chats = body
        else chats = (type === 'image' && caption || type === 'video' && caption) ? caption : ''
        prefix = regex.test(chats) ? chats.match(regex)[0] : '/'
        body = chats.startsWith(prefix) ? chats : '' // whole chats body contain commands
        const croppedChats = (chats?.length > 40) ? chats?.substring(0, 40) + '...' : chats
        // sticker menu
        for (let menu in stickerHash) {
            if (filehash == stickerHash[menu]) body = `${prefix + menu}`, chats = body
        }
        // Respon to button
        if (type === 'buttons_response') body = message.selectedButtonId, chats = body
        if (prev.hasPrevCmd(pengirim)) {
            body = `${prev.getPrevCmd(pengirim)} ${chats}`
            prev.delPrevCmd(pengirim)
        }
        const command = body.trim().replace(prefix, '').split(/\s/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const arg1 = arg.trim().substring(arg.indexOf(' ') + 1)
        const args = body.trim().split(/\s/).slice(1)
        const sfx = readdirSync('./src/sfx/').map(item => {
            return item.replace('.mp3', '')
        })
        /* #endregion */

        client.sendSeen(chatId) // Read chat

        /* #region Avoid Bug */
        // Avoid order/vcard type msg (bug troli/slayer) gatau work apa kgk 
        if (type === 'order' || quotedMsg?.type === 'order' || type === 'vcard' || quotedMsg?.type === 'vcard') {
            let _whenGroup = ''
            if (isGroupMsg) _whenGroup = `in ${color(name || formattedTitle)}`
            console.log(color('[ORDR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(croppedChats, 'grey'), 'from', color(pushname), _whenGroup)
            return client.deleteMessage(from, id, true)
        }

        // Avoid large body
        if (chats?.length > 2500) {
            let _whenGroup = ''
            if (isGroupMsg) _whenGroup = `in ${color(name || formattedTitle)}`
            console.log(color('[LARG]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(croppedChats, 'grey'), 'from', color(pushname), _whenGroup)
            return client.deleteMessage(from, id, true)
        }

        const isAntiVirtex = antiVirtex.includes(chatId)
        if (chats?.length > 10000 && isAntiVirtex) {
            client.sendTextWithMentions(from, `💣 عضو @${pengirim.replace(/@c\.us/, '')} اكتشاف إرسال رسالة طويلة جدًا! ركلة تلقائية!`)
            client.removeParticipant(from, pengirim)
            client.sendText(from, `💣 حذار VIRTEX! ضع إشارة مقروء 💣💣💣\n` + `\n`.repeat(200) + `Pengirim: ${pushname} -> ${pengirim}`)
        }
        /* #endregion */

        /* #region [IDENTIFY] */
        var isKasar = false
        const isCmd = body.startsWith(prefix)
        const isGroupAdmin = groupAdmins.includes(sender.id) || false
        const isQuotedImage = quotedMsg?.type === 'image'
        const isQuotedVideo = quotedMsg?.type === 'video'
        const isQuotedChat = quotedMsg?.type === 'chat'
        const isQuotedLocation = quotedMsg?.type === 'location'
        const isQuotedDocs = quotedMsg?.type === 'document'
        const isQuotedAudio = quotedMsg?.type === 'audio'
        const isQuotedPtt = quotedMsg?.type === 'ptt'
        const isQuotedSticker = quotedMsg?.type === 'sticker'
        const isQuotedPng = isQuotedDocs && quotedMsg.filename.includes('.png')
        const isQuotedWebp = isQuotedDocs && quotedMsg.filename.includes('.webp')
        const isGroupOwnerBotOnly = ownerBotOnly.includes(chatId)
        const isAntiLinkGroup = antiLinkGroup.includes(chatId)
        const isAntiLink = antiLink.includes(chatId)
        const isOwnerBot = ownerNumber.includes(pengirim)
        const isBanned = banned.includes(pengirim)
        const isNgegas = antiKasar.includes(chatId)
        const isNgegasKick = antiKasarKick.includes(chatId)
        const isDisabled = disableBot.includes(chatId)
        const isWelcome = welcome.includes(chatId)
        const isAntiDelete = antiDelete.includes(chatId)
        /* #endregion */

        if (isGroupOwnerBotOnly && !isOwnerBot) return null

        /* #region Helper Functions */
        const sendText = async (txt) => {
            return client.sendText(from, txt)
                .catch(e => {
                    console.log(e)
                })
        }

        const reply = async (txt, qId = id) => {
            return client.reply(from, txt, qId)
                .catch(e => {
                    console.log(e)
                })
        }

        const printError = (e, sendToOwner = true, sendError = true) => {
            if (sendError) sendText(resMsg.error.norm)
            let errMsg = `${e.name} ${e.message}`
            let cropErr = errMsg.length > 100 ? errMsg.substr(0, 100) + '...' : errMsg
            console.log(color('[ERR>]', 'red'), "{ " + croppedChats + " }\n", e)
            if (sendToOwner) client.sendText(ownerNumber, `{ ${chats} }\n${cropErr}`)
            return null
        }

        const sendFFU = async (url, capt = '', sendWait = true) => {
            if (sendWait) sendText(resMsg.wait)
            if (!capt) capt = ''
            return client.sendFileFromUrl(from, url, '', capt, id)
                .catch(e => { return printError(e) })
        }

        const sendSFU = async (url, sendWait = true) => {
            if (sendWait) sendText(resMsg.wait)
            return client.sendStickerfromUrl(from, url, null, stickerMetadata).then((r) => (!r && r != undefined)
                ? sendText('عذرًا ، الرابط الذي أرسلته لا يحتوي على صورة.')
                : sendText(resMsg.success.sticker)).then(() => console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثواني`))
        }

        const sendJSON = (txt) => sendText(JSON.stringify(txt, null, 2))

        // eslint-disable-next-line no-unused-vars
        const sendJFU = async (url) => {
            try {
                let { data } = await get(url)
                return data && sendJSON(data)
            } catch (e) {
                sendText(e.toString())
            }
        }

        const audioConverter = async (complexFilter, filterName) => {
            let durs = quotedMsg ? quotedMsg.duration : message.duration
            reply(resMsg.wait + `\nEstimasi ± ${(+durs / 100).toFixed(0)} menit.`)
            const _inp = await decryptMedia(quotedMsg)
            let inpath = `./media/in_${filterName}_${t}.mp3`
            let outpath = `./media/out_${filterName}_${t}.mp3`
            writeFileSync(inpath, _inp)

            Ffmpeg(inpath)
                .setFfmpegPath('./bin/ffmpeg')
                .complexFilter(complexFilter)
                .on('error', (err) => {
                    console.log('An error occurred: ' + err.message)
                    if (filterName === 'custom') reply(err.message + '\nContohnya bisa dilihat disini https://www.vacing.com/ffmpeg_audio_filters/index.html')
                    else reply(resMsg.error.norm)
                    unlinkIfExists(inpath, outpath)
                })
                .on('end', () => {
                    client.sendFile(from, outpath, `${filterName}.mp3`, '', id)
                        .then(console.log(color('[LOGS]', 'grey'), `معالجة الصوت لـ ${processTime(t, moment())} ثانية`))
                    unlinkIfExists(inpath, outpath)
                })
                .saveToFile(outpath)
        }

        const startTebakRoomTimer = (ثانية, answer) => {
            const hint = answer.replace(/\s/g, '\t').replace(/[^aeiou\t]/gi, '_ ')
            sleep(ثانية * 1000 / 4).then(async () => {
                const ans = await tebak.getAns(from)
                if (ans === false) return true
                else sendText(`⏳ ${((ثانية * 1000) - (ثانية * 1000 / 4 * 1)) / 1000} detik lagi`)
                sleep(ثانية * 1000 / 4).then(async () => {
                    const ans1 = await tebak.getAns(from)
                    if (ans1 === false) return true
                    else sendText(`⏳ ${((ثانية * 1000) - (ثانية * 1000 / 4 * 2)) / 1000} detik lagi\nHint: ${hint}`)
                    sleep(ثانية * 1000 / 4).then(async () => {
                        const ans2 = await tebak.getAns(from)
                        if (ans2 === false) return true
                        else sendText(`⏳ ${((ثانية * 1000) - (ثانية * 1000 / 4 * 3)) / 1000} detik lagi`)
                        sleep(ثانية * 1000 / 4).then(async () => {
                            const ans3 = await tebak.getAns(from)
                            if (ans3 === false) return true
                            else sendText(`⌛ انتهى الوقت!\nJawabannya adalah: *${answer}*`)
                            tebak.delRoom(from)
                        })
                    })
                })
            })
        }

        const doSimi = async (inp) => {
            let apiSimi // set default simi di /utils/index.js
            if (simi == 0) return null
            if (simi == 1) apiSimi = (q) => api.simiLol(q)
            if (simi == 2) apiSimi = (q) => api.simiPais(q)
            if (simi == 3) apiSimi = (q) => api.simiZeks(q)
            if (simi == 4) apiSimi = (q) => api.simiSumi(q)
            let respon = await apiSimi(inp.replace(/\b(sero)\b/ig, 'simi')).catch(e => { return console.log(color('[ERR>]', 'red'), e) })
            if (respon) {
                console.log(color('[LOGS] Simi respond:', 'grey'), respon)
                reply('▸ ' + respon.replace(/\b(simi|simsim|simsimi)\b/ig, 'sero'))
            }
        }
        /* #endregion helper functions */

        /* #region Command that banned people can access */
        if (isCmd) {
            // Typing
            client.simulateTyping(chatId, true)
            switch (command) {
                case 'owner':
                    return await client.sendContact(from, ownerNumber)
                        .then(() => sendText('إذا كانت لديك أسئلة حول برامج الروبوت ، فيرجى الدردشة مع الرقم أعلاه ⬆\الشات غير واضح سيتم تجاهله.'))
                case 'rules':
                case 'tnc':
                    return await sendText(menuId.textTnC())
                case 'donate':
                case 'donasi':
                    return await sendText(menuId.textDonasi())
                default:
                    break
            }
        }
        /* #endregion */

        /* #region Enable or Disable bot */
        if (isDisabled && command != 'enablebot') {
            if (isCmd) sendText('⛔ عاجز!')
            if (isGroupAdmin && isCmd) sendText(`يرسل *${prefix}enablebot* untuk mengaktifkan!`)
            return null
        }

        if (isCmd) {
            client.simulateTyping(chatId, true)
            switch (command) {
                case 'enablebot': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin && !isOwnerBot) return reply(resMsg.error.admin)
                    let pos = disableBot.indexOf(chatId)
                    if (pos === -1) return reply('البوت لا يزال نشط.')
                    disableBot.splice(pos, 1)
                    writeFileSync('./data/disablebot.json', JSON.stringify(disableBot))
                    return reply('✅ تم إعادة تنشيط روبوت المجموعة.')
                }
                case 'disablebot': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin && !isOwnerBot) return reply(resMsg.error.admin)
                    let pos = disableBot.indexOf(chatId)
                    if (pos != -1) return reply('البوت خارج الخدمة.')
                    disableBot.push(chatId)
                    writeFileSync('./data/disablebot.json', JSON.stringify(disableBot))
                    return reply('❌ تم ايقاف البوت.')
                }
                default:
                    break
            }
        }
        /* #endregion */

        /* #region Filter banned people */
        if (isBanned && !isGroupMsg && isCmd) {
            return sendText(`آسف لقد تم حظرك من قبل الروبوت لانتهاك القواعد أو الشروط والأحكام (${prefix}tnc).\nSilakan الدردشة / مالك لحذف.`).then(() => {
                console.log(color('[BANd]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command}[${args.length}]`), 'from', color(pushname))
            })
        }
        else if (isBanned && isCmd) {
            return console.log(color('[BANd]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command}[${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))
        }
        else if (isBanned) return null
        /* #endregion Banned */

        if ((isNgegas || isNgegasKick) && !isCmd) isKasar = await cariKasar(chats)

        /* #region Spam and Logging */
        if (isCmd && isFiltered(chatId)) {
            let _whenGroup = ''
            if (isGroupMsg) _whenGroup = `in ${color(name || formattedTitle)}`
            console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(`${command}[${args.length}]`), 'from', color(pushname), _whenGroup)
            return reply('طلب إيقاف الطلب مؤقتًا!')
        }

        // Spam cooldown
        if (isFiltered(chatId + 'isCooldown')) {
            if (isCmd) return reply(`لا يسمح لك بالارسال`)
            else return null
        }
        // Notify repetitive msg
        if (chats != "" && isFiltered(chatId + croppedChats) && croppedChats != undefined) {
            let _whenGroup = ''
            if (isGroupMsg) _whenGroup = `in ${color(name || formattedTitle)}`
            console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(croppedChats, 'grey'), 'from', color(pushname), _whenGroup)
            client.sendText(ownerNumber,
                `Ada yang spam cuy:\n` +
                `-> ${q3}القروب :${q3} ${groupId}\n` +
                `-> ${q3}الاسم  :${q3} ${isGroupMsg ? name || formattedTitle : 'none'}\n` +
                `-> ${q3}العدد   :${q3} ${pengirim.replace('@c.us', '')}\n` +
                `-> ${q3}الرابط    :${q3} wa.me/${pengirim.replace('@c.us', '')}\n` +
                `-> ${q3}الرقم   :${q3} ${pushname}\n\n` +
                `-> ${croppedChats}`)
            addFilter(chatId + 'isCooldown', 60000)
            return reply(`تم اكتشاف رسائل متكرره`)
        }

        // Avoid repetitive sender spam
        if (isFiltered(pengirim) && !isCmd && chats != "") {
            let _whenGroup = ''
            if (isGroupMsg) _whenGroup = `in ${color(name || formattedTitle)}`
            console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(croppedChats, 'grey'), 'from', color(pushname), _whenGroup)
            return null
        }

        // Avoid kata kasar spam
        if (isFiltered(from) && isGroupMsg && isKasar) {
            console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(`${command}[${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))
            return reply('لا ترسل كلمات وقحة!')
        }

        // Log Kata kasar
        if (!isCmd && isKasar && isGroupMsg) {
            console.log(color('[BADW]', 'orange'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                'from', color(pushname), 'in', color(name || formattedTitle))
        }

        // Log Commands
        let argsLog = ''
        if (args.length === 0) argsLog = color('with no args', 'grey')
        else argsLog = (arg.length > 30) ? `${arg.substring(0, 30)}...` : arg

        if (isCmd && !isGroupMsg) {
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(`${command}[${args.length}]`), ':', color(argsLog, 'magenta'), 'from', color(pushname))
        }
        if (isCmd && isGroupMsg) {
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
                color(`${command}[${args.length}]`), ':', color(argsLog, 'magenta'), 'from', color(pushname), 'in', color(name || formattedTitle))
        }

        //[BETA] Avoid Spam Message
        if (isCmd) addFilter(chatId, 2000) // 2 sec delay before proessing commands
        if (chats != "") addFilter(pengirim, 300) // 0.3 sec delay before receiving message from same sender
        if (chats != "" && croppedChats != undefined) addFilter(chatId + croppedChats, 700) // 0.7 sec delay repetitive msg
        /* #endregion Spam and Logging */

        /* #region Handle default msg */
        switch (true) {
            case /^\b(hi|hy|halo|hai|hei|hello)\b/i.test(chats): {
                await reply(`مرحبا ${pushname} 👋`)
                break
            }
            case /^p$/i.test(chats): {
                return !isGroupMsg ? sendText(`لعرض القائمة ، أرسل رسالة *${prefix}menu*`) : null
            }
            case /^(menu|start|help)$/i.test(chats): {
                return await sendText(`لعرض القائمة ، أرسل رسالة *${prefix}menu*`)
            }
            case /assalamualaikum|assalamu'alaikum|asalamualaikum|assalamu'alaykum/i.test(chats): {
                await reply('Wa\'alaikumussalam Wr. Wb.')
                break
            }
            case /^=/.test(chats): {
                try {
                    await reply(`${evaluate(chats.slice(1).replace(/x/ig, '*')
                        .replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100'))}`)
                } catch (e) {
                    reply(`${e.name} ${e.message}`)
                }
                break
            }
            case /\bping\b/i.test(chats): {
                return await sendText(`Pong!!!\nSpeed: _${processTime(t, moment())} ثانية_`)
            }
            case new RegExp(`\\b(${sfx.join("|")})\\b`).test(chats?.toLowerCase()): {
                const theSFX = chats?.toLowerCase().match(new RegExp(sfx.join("|")))
                const path = `./src/sfx/${theSFX}.mp3`
                const _id = (quotedMsg != null) ? quotedMsgObj.id : id
                await client.sendPtt(from, path, _id).catch(e => { return printError(e) })
                break
            }
            case /^#\S*$/ig.test(chats): {
                let res = await note.getNoteData(from, chats.slice(1))
                if (!res) return reply(`الملاحظات / الملاحظات غير موجودة ، يرجى إنشائها أولاً. \nGunakan perintah: *${prefix}createnote ${chats.slice(1)} (tulis isinya)* \nMohon hanya gunakan 1 kata untuk nama note`)

                let respon = `✪〘 ${chats.slice(1).toUpperCase()} 〙✪`
                respon += `\n\n${res.content}`
                await reply(respon)
                break
            }
            case /\b(bot|sero|XD1 Team)\b/ig.test(chats): {
                if (!isCmd) {
                    let txt = chats.replace(/@\d+/g, '')
                    return doSimi(txt)
                }
                break
            }
            case /^>/.test(chats): {
                if (!isOwnerBot) return null
                client.simulateTyping(from, false)
                try {
                    let evaled = eval(`(async() => {
                            try {
                                ${chats.slice(2)}
                            } catch (e) {
                                console.log(e)
                                sendText(e.toString())
                            }
                        })()`)
                    if (typeof evaled !== 'string') evaled = inspect(evaled)
                    if (chats.includes('return')) sendText(`${evaled}`)
                    else reply(`✅ حسنا!`)
                } catch (err) {
                    console.log(err)
                    sendText(`${err}`)
                }
                break
            }

            case /^\$/.test(chats): {
                if (!isOwnerBot) return null
                client.simulateTyping(from, false)
                exec(chats.slice(2), (err, stdout, stderr) => {
                    if (err) {
                        sendText(err)
                        console.error(err)
                    } else {
                        sendText(stdout + stderr)
                        console.log(stdout, stderr)
                    }
                })
                break
            }
            default:
        }

        // Jika bot dimention maka akan merespon pesan
        if (message?.mentionedJidList?.length == 1 && message?.mentionedJidList?.includes(botNumber)) {
            let txt = chats.replace(/@\d+/g, '')
            if (txt.length === 0) {
                reply(`نعم ، هناك شيء ما?`)
            } else {
                doSimi(txt)
            }
        }
        if (quotedMsg?.fromMe && !isCmd && type === `chat`) tebak.getAns(from).then(res => {
            if (!res) return doSimi(chats)
        })
        /* #endregion */

        /* #region Handle command message */
        if (isCmd) {
            todayHits++ // Command hits count
            client.simulateTyping(chat.id, true)
            switch (command) {
                /* #region Menu, stats and info sewa*/
                case 'menu':
                case 'help':
                case 'start': {
                    await sendText(menuId.textMenu(pushname, t, prefix))
                    if ((isGroupMsg) && (isGroupAdmin)) sendText(`قائمة إدارة المجموعة: *${prefix}menuadmin*`)
                    if (isOwnerBot) sendText(`مالك القائمة: *${prefix}menuowner*`)
                    break
                }
                case 'menuadmin': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    await sendText(menuId.textAdmin(prefix))
                    break
                }
                case 'menuowner': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    await sendText(menuId.textOwner(prefix))
                    break
                }
                case 'join':
                case 'sewa': {
                    if (args.length == 0) return reply(
                        `يجب عليك كتابة الامر مرفقا رابط المجموعة الخاصة بك للانضمام او اضافة في جهت الاتصال و ادخالة`
                    )
                    const linkGroup = args[0]
                    const isLinkGroup = linkGroup.match(/(https:\/\/chat\.whatsapp\.com)/gi)
                    if (!isLinkGroup) return reply('عذرا رابط المجموعة خاطئ! الرجاء ارسال الرابط الصحيح')
                    let groupInfo = await client.inviteInfo(linkGroup).catch(e => { return printError(e) })
                    if (groupBanned.includes(groupInfo.id)) return reply(`⛔ المجموعة المحظورة`)
                    if (isOwnerBot) {
                        await client.joinGroupViaLink(linkGroup)
                            .then(async () => {
                                await sendText(resMsg.success.join)
                                if (args[1] != 'owneronly') {
                                    setTimeout(async () => {
                                        await client.sendText(groupInfo.id, resMsg.success.greeting)
                                    }, 2000)
                                } else {
                                    // silently join group with owneronly mode. Add 'owneronly' after grouplink
                                    let pos = ownerBotOnly.indexOf(groupInfo.id)
                                    if (pos == -1) {
                                        ownerBotOnly.push(groupInfo.id)
                                        writeFileSync('./data/ownerbotonly.json', JSON.stringify(ownerBotOnly))
                                    }
                                }
                            }).catch(async () => {
                                return reply(resMsg.error.join)
                            })
                    } else {
                        let allGroup = await client.getAllGroups()
                        if (allGroup.length > groupLimit) return reply(
                        `يجب عليك كتابة الامر مرفقا رابط المجموعة الخاصة بك للانضمام او اضافة في جهت الاتصال و ادخالة`
                    )
                        if (groupInfo?.size < memberLimit) return reply(`عذرا المجموعة التي لا تزيد عن ${memberLimit} لن يدخل البوت لها`)
                        reply(`⌛ حسنًا ، انتظر حتى تتم معالجتها من قبل المالك ، `)
                        client.sendText(ownerNumber, `لطلب رابط المجموعة` +
                            `${q3}Pushname  :${q3} ${pushname}\n` +
                            `${q3}Pemohon   :${q3} ${pengirim}\n` +
                            `${q3}GroupLink :${q3} ${args[0]}\n`
                        )
                        client.sendText(ownerNumber, `${prefix}trial ${pengirim} ${args[0]}`)
                    }
                    break
                }
                case 'trial': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length != 2) return reply(`صيغة خاطئة. للمطالبة باستخدام المحاكمة.${prefix}trial <senderid> <linkg>`)
                    await sewa.trialSewa(client, args[1]).then(res => {
                        if (res) {
                            reply(`✅ طالب بأستأجار البوت لمدة 7 ايام.`)
                            client.sendText(args[0], `✅ طالب بأستأجار البوت لمدة 7 ايام.`)
                        }
                        else {
                            reply(`💣 انتظر !`)
                            client.sendText(args[0], `💣 انتظر!`)
                        }
                    }).catch(e => {
                        printError(e, true, false)
                    })
                    break
                }
                case 'stat':
                case 'stats':
                case 'status':
                case 'botstat': {
                    let loadedMsg = await client.getAmountOfLoadedMessages()
                    let chatIds = await client.getAllChatIds()
                    let groups = await client.getAllGroups()
                    // eslint-disable-next-line no-undef
                    let time = process.uptime()
                    let uptime = (time + "").toDHms()
                    let statSewa = ''
                    if (isGroupMsg) {
                        let exp = sewa.getExp(from)
                        statSewa = (exp) ? `\n\nSewa expire at: _${exp.trim()}_` : ''
                    }
                    sendText(`Status :\n- *${loadedMsg}* Loaded Messages\n` +
                        `- *${groups.length}* Group Chats\n` +
                        `- *${chatIds.length - groups.length}* Personal Chats\n` +
                        `- *${chatIds.length}* Total Chats\n\n` +
                        `- *${todayHits}* Total Commands Today\n` +
                        `- *${received}* Total Received Msgs Today\n\n` +
                        `Speed: _${processTime(t, moment())} ثانية_\n` +
                        `Uptime: _${uptime}_ ${statSewa}`)
                    break
                }
            }
            /* #endregion Menu, stats and info sewa */

            switch (command) {
                /* #region Sticker */
                case 'getimage':
                case 'stikertoimg':
                case 'stickertoimg':
                case 'toimg': {
                    if (isQuotedSticker) {
                        let mediaData = await decryptMedia(quotedMsg)
                        reply(resMsg.wait)
                        let imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendFile(from, imageBase64, 'imgsticker.jpg', 'تم تحويل الملصق الى صورة!', id)
                            .then(() => {
                                console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق على الصورة من أجل ${processTime(t, moment())} ثانية`)
                            })
                    } else if (!quotedMsg) return reply(`يرجى وضع علامة / الرد على الملصق الذي تريد استخدامه كصورة مع الأمر!`)
                    break
                }

                // Sticker Creator
                case 'س':
                case 'ستكر':
                case 'sticker':
                case 'stiker':
                case 's': {
                    if (
                        ((isMedia && mimetype !== 'video/mp4') || isQuotedImage || isQuotedPng || isQuotedWebp)
                        &&
                        (args.length === 0 || args[0] === 'crop' || args[0] === 'circle' || args[0] !== 'nobg')
                    ) {
                        reply(resMsg.wait)
                        try {
                            const encryptMedia = (isQuotedImage || isQuotedDocs) ? quotedMsg : message
                            let _metadata = null
                            if (args[0] === 'crop') _metadata = stickerMetadataCrop
                            else _metadata = (args[0] === 'circle') ? stickerMetadataCircle : stickerMetadata
                            let mediaData = await decryptMedia(encryptMedia).catch(e => printError(e, false))
                            if (mediaData) {
                                if (isQuotedWebp) {
                                    await client.sendRawWebpAsSticker(from, mediaData.toString('base64'), true)
                                        .then(() => {
                                            sendText(resMsg.success.sticker)
                                            console.log(color('[LOGS]', 'grey'), `ملصق من webp تمت معالجته لـ ${processTime(t, moment())} ثانية`)
                                        }).catch(e => printError(e, false))
                                } else {
                                    await client.sendImageAsSticker(from, mediaData, _metadata)
                                        .then(() => {
                                            sendText(resMsg.success.sticker)
                                            console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                                        }).catch(e => printError(e, false))
                                }
                            }
                        } catch (err) {
                            printError(err)
                        }

                    } else if (args[0] === 'nobg') {
                        if (isMedia || isQuotedImage) {
                            reply(resMsg.wait)
                            try {
                                let encryptedMedia = isQuotedImage ? quotedMsg : message
                                let _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype

                                let mediaData = await decryptMedia(encryptedMedia)
                                    .catch(e => printError(e, false))
                                if (mediaData === undefined) return sendText(resMsg.error.norm)
                                let base64img = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                                let outFile = './media/noBg.png'
                                // kamu dapat mengambil api key dari website remove.bg dan ubahnya difolder settings/api.json
                                let selectedApiNoBg = sample(apiNoBg)
                                let resultNoBg = await removeBackgroundFromImageBase64({ base64img, apiKey: selectedApiNoBg, size: 'auto', type: 'auto', outFile })
                                await writeFile(outFile, resultNoBg.base64img)
                                await client.sendImageAsSticker(from, `data:${_mimetype};base64,${resultNoBg.base64img}`, stickerMetadata)
                                    .then(() => {
                                        sendText(resMsg.success.sticker)
                                        console.log(color('[LOGS]', 'grey'), `ملصق لم تتم معالجته من أجله ${processTime(t, moment())} ثانية`)
                                    }).catch(e => printError(e, false))
                            } catch (err) {
                                console.log(color('[ERR>]', 'red'), err)
                                if (err[0].code === 'unknown_foreground') reply('عذرًا ، حدود الكائن والخلفية غير واضحة!')
                                else await reply('عذرًا ، حدث خطأ أو تم الوصول إلى حد الاستخدام!')
                            }
                        }
                    } else if (args.length === 1 && isUrl(args[0])) {
                        sendSFU(args[0], false)
                    } else if ((isMedia && mimetype === 'video/mp4') || isQuotedVideo) {
                        reply(resMsg.wait)
                        let encryptedMedia = isQuotedVideo ? quotedMsg : message
                        let mediaData = await decryptMedia(encryptedMedia)
                            .catch(e => printError(e, false))
                        await client.sendMp4AsSticker(from, mediaData, { endTime: '00:00:09.0' }, stickerMetadata)
                            .then(() => {
                                sendText(resMsg.success.sticker)
                                console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                            })
                            .catch(() => {
                                return reply('عذرًا ، حدث خطأ أو أن الملف كبير جدًا!')
                            })
                    } else {
                        await reply(`يجب عليك الرد على الصورة او ارسال الصورة مع الامر مرفق في نفس الصورة
				`)
                    }
                    break
                }

                case 'stikergiphy':
                case 'stickergiphy': {
                    if (args.length != 1) return reply(`عذرا ، تنسيق رسالة خاطئ.\nKetik pesan dengan ${prefix}stickergiphy <link_giphy> (don't include <> symbol)`)
                    const isGiphy = args[0].match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
                    const isMediaGiphy = args[0].match(new RegExp(/https?:\/\/media\.giphy\.com\/media/, 'gi'))
                    if (isGiphy) {
                        const getGiphyCode = args[0].match(new RegExp(/(\/|-)(?:.(?!(\/|-)))+$/, 'gi'))
                        if (!getGiphyCode) { return reply('Gagal mengambil kode giphy') }
                        const giphyCode = getGiphyCode[0].replace(/[-/]/gi, '')
                        const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                        client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                            reply(resMsg.success.sticker)
                            console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                        }).catch(e => { return printError(e) })
                    } else if (isMediaGiphy) {
                        const gifUrl = args[0].match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                        if (!gifUrl) { return reply('Gagal mengambil kode giphy') }
                        const smallGifUrl = args[0].replace(gifUrl[0], 'giphy-downsized.gif')
                        client.sendGiphyAsSticker(from, smallGifUrl)
                            .then(() => {
                                reply(resMsg.success.sticker)
                                console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                            })
                            .catch(e => { return printError(e) })
                    } else {
                        await reply('Maaf, perintah sticker giphy hanya bisa menggunakan link dari giphy.  [Giphy Only]')
                    }
                    break
                }

                case 'take':
                case 'takestik':
                case 'takesticker': {
                    if (!isQuotedSticker && args.length == 0) return reply(`تحرير حزمة الملصقات والمؤلف.\n${prefix}take packname|author`)
                    reply(resMsg.wait)
                    client.sendImageAsSticker(from, (await decryptMedia(quotedMsg)), {
                        pack: arg.split('|')[0],
                        author: arg.split('|')[1],
                        keepScale: true
                    }).then(() => {
                        reply(resMsg.success.sticker)
                        console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                    })
                }
                /* #endregion Sticker */
            }

            switch (command) {
                /* #region Any Converter */
                case 'shortlink': {
                    if (args.length == 0) return reply(`ketik ${prefix}shortlink <url>`)
                    if (!isUrl(args[0])) return reply('الرابط الذي تم ارسالة غير صالح')
                    const shorted = await urlShortener(args[0])
                    await sendText(shorted).catch(e => { return printError(e) })
                    break
                }

                case 'hilih': {
                    if (args.length != 0 || isQuotedChat) {
                        const _input = isQuotedChat ? quotedMsg.body : arg
                        const _id = isQuotedChat ? quotedMsg.id : id
                        const _res = _input.replace(/[aiueo]/g, 'i')
                        reply(_res, _id)
                        const sUrl = api.memegen('https://memegenerator.net/img/images/11599566.jpg', '', _res)
                        client.sendFileFromUrl(from, sUrl, 'image.png', '', _id).catch(e => { return printError(e) })
                    }
                    else {
                        await reply(`يجب ان يحتوي الرابط على 
						http او https`)
                    }
                    break
                }

                case 'urltoimg':
                case 'ssweb':
                case 'gsearch':
                case 'gs': {
                    if (args.length === 0) return reply(`لقطة شاشة موقع الويب أو بحث Google. ${prefix}ssweb <url> atau ${prefix}gs <query>`)
                    sendText(resMsg.wait)
                    let urlzz = ''
                    if (!isUrl(arg)) urlzz = `https://www.google.com/search?q=${encodeURIComponent(arg)}`
                    else urlzz = arg
                    const path = './media/ssweb.png'
                    scraper.ssweb(browser, path, urlzz).then(async res => {
                        if (res === true) await client.sendImage(from, path, 'ssweb.png', `مأخوذ من ${urlzz}`, id).catch(e => { return printError(e) })
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'qr':
                case 'qrcode': {
                    if (args.length == 0) return reply(`لإنشاء رمز الاستجابة السريعة ، اكتب ${prefix}qrcode <kata>\nContoh:  ${prefix}qrcode nama saya XD1 Team`)
                    reply(resMsg.wait)
                    await client.sendFileFromUrl(from, `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(arg)}&size=500x500`, '', '', id)
                    break
                }

                case 'قلب': 
                case 'flip': {
                    if (!isMedia && args.length === 0 && !isQuotedImage) return reply(
                        `اقلب الصورة رأسيًا أو أفقيًا. أرسل صورة مع شرح:\n` +
                        `${prefix}flip h -> للتحويل للافقي\n` +
                        `${prefix}flip v -> للتحويل للعامودي`)
                    const _enc = isQuotedImage ? quotedMsg : message
                    const _img = await decryptMedia(_enc).catch(e => { return printError(e) })
                    let image = await read(_img)
                    let path = './media/flipped.png'
                    if (args[0] === 'v') image.flip(false, true).write(path)
                    else if (args[0] === 'h') image.flip(true, false).write(path)
                    else return reply(`حجة خاطئة.\n` +
                        `${prefix}flip h -> للتحويل للافقي` +
                        `${prefix}flip v -> للتحويل للعامودي`)

                    await client.sendImage(from, path, '', '', id).catch(e => { return printError(e) })
                    break
                }

                case 'memefy': {
                    if ((isMedia || isQuotedImage || isQuotedSticker) && args.length >= 1) {
                        try {
                            if (quotedMsg?.isAnimated) return reply(`خطأ! لا يدعم تحريك الملصقات.`)
                            reply(resMsg.wait)
                            let top = '', bottom = ''
                            if (!/\|/g.test(arg)) {
                                bottom = arg
                            } else {
                                top = arg.split('|')[0]
                                bottom = arg.split('|')[1]
                            }
                            let encryptMedia = (isQuotedImage || isQuotedSticker) ? quotedMsg : message
                            let mediaData = await decryptMedia(encryptMedia)
                            if (isQuotedSticker) mediaData = await webpToPng(mediaData)
                            let imgUrl = await uploadImages(mediaData, false)
                            let sUrl = api.memegen(imgUrl, top, bottom)
                            if (!isQuotedSticker) client.sendFileFromUrl(from, sUrl, 'image.png', 'Here you\'re', id).catch(e => { return printError(e) })
                            else await client.sendStickerfromUrl(from, sUrl, null, stickerMetadata)
                                .then(() => {
                                    sendText(resMsg.success.sticker)
                                    console.log(color('[LOGS]', 'grey'), `تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`)
                                }).catch(e => printError(e, false))
                        } catch (err) {
                            printError(err)
                        }
                    } else {
                        await reply(`لا توجد صورة / تنسيق خاطئ! الرجاء إرسال صورة مع شرح ${prefix}memefy <teks_atas> | <teks_bawah>\n` +
                            `مثال: ${prefix}memefy ini teks atas | ini teks bawah`)
                    }
                    break
                }

                case 'ocr': {
                    if (!isMedia && !isQuotedImage) return reply(`مسح النص من الصورة. الرد على الصورة أو إرسال صورة مع التسمية التوضيحية ${prefix}ocr`)
                    try {
                        sendText(resMsg.wait)
                        let enc = isQuotedImage ? quotedMsg : message
                        let mediaData = await decryptMedia(enc)
                        let _url = await uploadImages(mediaData, false)
                        let resu = await api.ocr(_url).catch(printError)
                        reply(resu)
                    } catch (err) {
                        printError(err)
                    }
                    break
                }

                case 'nulis': {
                    if (args.length == 0 && !isQuotedChat) return reply(`اجعل الروبوت يكتب النص المرسل في صورة\n` +
                        `إستعمال: ${prefix}nulis [teks]\n\ncontoh: ${prefix}nulis i love you 3000`)
                    const content = isQuotedChat ? quotedMsgObj.content.toString() : arg
                    const resu = await api.tulis(content)
                    await client.sendImage(from, resu, '', ``, id).catch(e => { return printError(e) })
                    break
                }

                //required to install libreoffice
                case 'doctopdf':
                case 'pdf': {
                    if (!isQuotedDocs) return reply(`هذه الانواع فقط مايمكنك تحويلها doc/docx/ppt/pptx `)
                    if (/\.docx|\.doc|\.pptx|\.ppt/g.test(quotedMsg.filename) && isQuotedDocs) {
                        sendText(resMsg.wait)
                        const encDocs = await decryptMedia(quotedMsg)
                        toPdf(encDocs).then(
                            (pdfBuffer) => {
                                writeFileSync("./media/result.pdf", pdfBuffer)
                                client.sendFile(from, "./media/result.pdf", quotedMsg.filename.replace(/\.docx|\.doc|\.pptx|\.ppt/g, '.pdf'), id)
                            }, (err) => { printError(err) }
                        )
                    } else {
                        reply('عذرا تنسيق الملف غير مطابق')
                    }
                    break
                }
                case 'tts':
                case 'say':
                    if (!isQuotedChat && args.length != 0) {
                        try {
                            if (arg1 === '') return reply('Apa teksnya syg..')
                            let gtts = new gTTS(arg1, args[0])
                            gtts.save('./media/tts.mp3', function () {
                                client.sendPtt(from, './media/tts.mp3', id)
                                    .catch(e => { return printError(e) })
                            })
                        } catch (err) {
                            console.log(color('[ERR>]', 'red'), err.name, err.message)
                            reply(err.name + '! ' + err.message + 'قائمة اللغات : https://anotepad.com/note/read/7fd833h4')
                        }
                    }
                    else if (isQuotedChat && args.length != 0) {
                        try {
                            const dataText = quotedMsgObj.content.toString()
                            let gtts = new gTTS(dataText, args[0])
                            gtts.save('./media/tts.mp3', function () {
                                client.sendPtt(from, './media/tts.mp3', quotedMsgObj.id).catch(e => { return printError(e) })
                            })
                        } catch (err) {
                            console.log(color('[ERR>]', 'red'), err.name, err.message)
                            reply(err.name + '! ' + err.message + 'قائمة اللغات : https://anotepad.com/note/read/7fd833h4')
                        }
                    }
                    else {
                        await reply(`/tts مرحبا 
						مثال:`)
                    }
                    break
                case 'trans':
                case 'translate': {
                    return reply('Feature disabled')
                    // if (args.length === 0 && !isQuotedChat) return reply(`Translate text ke kode bahasa, penggunaan: \n${prefix}trans <kode bahasa> <text>\nContoh : \n -> ${prefix}trans id some english or other language text here\n -> ${prefix}translate en beberapa kata bahasa indonesia atau bahasa lain. \n\nUntuk kode bahasa cek disini : https://anotepad.com/note/read/7fd833h4`)
                    // const lang = ['en', 'pt', 'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu',
                    //     'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-CN', 'co', 'hr', 'cs',
                    //     'da', 'nl', 'eo', 'et', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el',
                    //     'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga',
                    //     'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw', 'ko', 'ku', 'ky', 'lo', 'la', 'lv',
                    //     'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no',
                    //     'or', 'ps', 'fa', 'pl', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd',
                    //     'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'tt', 'te', 'th',
                    //     'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu', 'zh-TW']
                    // if (lang.includes(args[0])) {
                    //     translate(isQuotedChat ? quotedMsgObj.content.toString() : arg.trim().substring(arg.indexOf(' ') + 1), {
                    //         from: 'auto', to: args[0]
                    //     }).then(n => {
                    //         reply(n)
                    //     }).catch(e => { return printError(e) })
                    // } else {
                    //     reply(`Kode bahasa tidak valid`)
                    // }
                    // break
                }

                // TODO implement text pro
                case 'textpro': {
                    sendText(`Feature coming soon`)
                    break
                }

                /* #endregion Any Converter */
            }

            switch (command) {
                /* #region Islam Commands */
                case 'listsurah': {
                    try {
                        let listsrh = '╔══✪〘 قائمة السورة 〙✪\n'
                        Surah.data.forEach((dataSurah) => {
                            listsrh += `╠ ${dataSurah.number}. `
                            listsrh += dataSurah.name.transliteration.id.toLowerCase() + '\n'
                        })
                        listsrh += '╚═〘 *XD1 Team* 〙'
                        sendText(listsrh)
                    } catch (err) { printError(err) }
                    break
                }

                case 'infosurah': {
                    if (args.length == 0) return reply(`*_${prefix}infosurah <nama surah>_*\nMenampilkan معلومات كاملة عن سورة معينة. أمثلة على الاستخدام: ${prefix}infosurah al-baqarah`)
                    let { data } = Surah
                    let idx = data.findIndex(function (post) {
                        if ((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                            return true
                    })
                    if (data[idx] === undefined) return reply(`عذرًا ، التنسيق غير صحيح أو اسم السورة غير مطابق`)
                    let pesan = ""
                    pesan = pesan +
                        "اسم : " + data[idx].name.transliteration.id + "\n" +
                        "أزمة : " + data[idx].name.short + "\n" +
                        "المعنى : " + data[idx].name.translation.id + "\n" +
                        "عدد الآيات : " + data[idx].numberOfVerses + "\n" +
                        "رقم السورة : " + data[idx].number + "\n" +
                        "نوع : " + data[idx].revelation.id + "\n" +
                        "معلومة : " + data[idx].tafsir.id
                    reply(pesan)
                    break
                }

                case 'surah': {
                    if (args.length == 0) return reply(
                        `*_${prefix}surah <nama surah> <ayat>_*\n` +
                        `Menampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Indonesia.\n` +
                        `Contoh penggunaan : ${prefix}surah al-baqarah 1\n\n` +
                        `*_${prefix}surah <nama/nomor surah> <ayat> en/id_*\n` +
                        `Menampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Inggris / Indonesia.\n` +
                        `Contoh penggunaan : ${prefix}surah al-baqarah 1 id\n` +
                        `${prefix}surah 1 1 id`)
                    let nmr = 0
                    if (isNaN(args[0])) {
                        let { data } = Surah
                        let idx = data.findIndex(function (post) {
                            if ((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                                return true
                        })
                        if (data[idx] === undefined) return reply(`آسف الشكل خاطئ أو اسم السورة غير مطابق`)
                        nmr = data[idx].number
                    } else {
                        nmr = args[0]
                    }
                    let ayat = args[1] || 1

                    if (!isNaN(nmr)) {
                        let resSurah = await get('https://api.quran.sutanlab.id/surah/' + nmr + "/" + ayat)
                            .catch(e => { return printError(e) })
                        if (resSurah === undefined) return reply(`آسف للخطأ / شكل خاطئ`)
                        let { data } = resSurah.data
                        let bhs = last(args)
                        let pesan = ""
                        pesan = pesan + data.text.arab + "\n\n"
                        if (bhs == "en") {
                            pesan = pesan + data.translation.en
                        } else {
                            pesan = pesan + data.translation.id
                        }
                        pesan = pesan + "\n\n(Q.S. " + data.surah.name.transliteration.id + ":" + ayat + ")"
                        await reply(pesan.trim())
                    }
                    break
                }

                case 'tafsir': {
                    if (args.length == 0) return reply(`*_${prefix}tafsir <nama/nomor surah> <ayat>_*\n` +
                        `يعرض آيات قرآنية معينة مع ترجماتها وتفسيراتها باللغة الإندونيسية. أمثلة على الاستخدام : ${prefix}tafsir al-baqarah 1`)
                    let nmr = 0
                    if (isNaN(args[0])) {
                        let { data } = Surah
                        let idx = data.findIndex(function (post) {
                            if ((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                                return true
                        })
                        if (data[idx] === undefined) return reply(`Maaf format salah atau nama surah tidak sesuai`)
                        nmr = data[idx].number
                    } else {
                        nmr = args[0]
                    }
                    let ayat = args[1] || 1
                    console.log(nmr)
                    if (!isNaN(nmr)) {
                        let resSurah = await get('https://api.quran.sutanlab.id/surah/' + nmr + "/" + ayat)
                            .catch(e => { return printError(e) })
                        let { data } = resSurah.data
                        let pesan = ""
                        pesan = pesan + "Tafsir Q.S. " + data.surah.name.transliteration.id + ":" + ayat + "\n\n"
                        pesan = pesan + data.text.arab + "\n\n"
                        pesan = pesan + "_" + data.translation.id + "_" + "\n\n" + data.tafsir.id.long
                        reply(pesan)
                    }
                    break
                }

                case 'alaudio': {
                    if (args.length == 0) return reply(`*_${prefix}ALaudio <nama/nomor surah>_*\nMenampilkan tautan dari audio surah tertentu.\n` +
                        `Contoh penggunaan : ${prefix}ALaudio al-fatihah\n\n*_${prefix}ALaudio <nama/nomor surah> <ayat>_*\n` +
                        `Mengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1\n\n` +
                        `*_${prefix}ALaudio <nama/nomor surah> <ayat> en_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Inggris. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1 en`)
                    let nmr = 0
                    if (isNaN(args[0])) {
                        let { data } = Surah
                        let idx = data.findIndex(function (post) {
                            if ((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                                return true
                        })
                        if (data[idx] === undefined) return reply(`Maaf format salah atau nama surah tidak sesuai`)
                        nmr = data[idx].number
                    } else {
                        nmr = args[0]
                    }
                    let ayat = args[1]
                    console.log(nmr)
                    if (!isNaN(nmr)) {
                        if (args.length > 2) {
                            ayat = args[1]
                        }
                        if (args.length == 2) {
                            ayat = last(args)
                        }
                        if (isNaN(ayat)) {
                            let pesan = ""
                            let resSurah = await get('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/islam/surah/' + nmr + '.json')
                                .catch(e => { return printError(e) })
                            let { name: surahName, name_translations, number_of_ayah, number_of_surah, recitations } = resSurah.data
                            pesan = pesan + "Audio Quran Surah ke-" + number_of_surah + " " + surahName + " (" + name_translations.ar + ") " + "dengan jumlah " + number_of_ayah + " ayat\n"
                            pesan = pesan + "Dilantunkan oleh " + recitations[0].name + " :\n" + recitations[0].audio_url + "\n"
                            pesan = pesan + "Dilantunkan oleh " + recitations[1].name + " :\n" + recitations[1].audio_url + "\n"
                            pesan = pesan + "Dilantunkan oleh " + recitations[2].name + " :\n" + recitations[2].audio_url + "\n"
                            reply(pesan)
                        } else {
                            let resSurah = await get('https://api.quran.sutanlab.id/surah/' + nmr + "/" + ayat)
                                .catch(() => {
                                    return reply(`Surah atau ayat tidak ditemukan.`)
                                })
                            let { data } = resSurah.data
                            let bhs = last(args)
                            let pesan = ""
                            pesan = pesan + data.text.arab + "\n\n"
                            if (bhs == "en") {
                                pesan = pesan + data.translation.en
                            } else {
                                pesan = pesan + data.translation.id
                            }
                            pesan = pesan + "\n\n(Q.S. " + data.surah.name.transliteration.id + ":" + args[1] + ")"
                            await client.sendFileFromUrl(from, data.audio.primary, '', '', id, { httpsAgent: httpsAgent })
                            await reply(pesan)
                        }
                    }
                    break
                }

                case 'jsholat':
                case 'jsolat': {
                    if (args.length === 0) return reply(`ketik *${prefix}jsholat <nama kabupaten>* untuk melihat jadwal sholat\n` +
                        `Contoh: *${prefix}jsholat sleman*\nUntuk melihat daftar daerah, ketik *${prefix}jsholat daerah*`)
                    if (args[0] == 'daerah') {
                        let { data: semuaKota } = await get('https://api.myquran.com/v1/sholat/kota/semua')
                            .catch(e => { return printError(e) })
                        let hasil = '╔══✪〘 Daftar Kota 〙✪\n'
                        for (let kota of semuaKota) {
                            hasil += '╠➥ '
                            hasil += `${kota.lokasi}\n`
                        }
                        hasil += '╚═〘 *XD1 Team* 〙'
                        await reply(hasil)
                    } else {
                        let { data: cariKota } = await get('https://api.myquran.com/v1/sholat/kota/cari/' + arg)
                            .catch(e => { return printError(e) })
                        try {
                            var kodek = cariKota.data[0].id
                        } catch (err) {
                            return reply('Kota tidak ditemukan')
                        }
                        var tgl = moment(t * 1000).format('YYYY/MM/DD')
                        let { data: jadwalData } = await get(`https://api.myquran.com/v1/sholat/jadwal/${kodek}/${tgl}`)
                        if (jadwalData.status === 'false') return reply('Internal server error')
                        var jadwal = jadwalData.data.jadwal
                        let jadwalMsg = `╔══✪〘 أوقات الصلاة في ${jadwalData.data.lokasi} 〙✪\n`
                        jadwalMsg += `╠> ${jadwal.tanggal}\n`
                        jadwalMsg += `╠> ${q3}إمساك    : ${jadwal.imsak}${q3}\n`
                        jadwalMsg += `╠> ${q3}فجر    : ${jadwal.subuh}${q3}\n`
                        jadwalMsg += `╠> ${q3}الظهر   : ${jadwal.dzuhur}${q3}\n`
                        jadwalMsg += `╠> ${q3}العصر    : ${jadwal.ashar}${q3}\n`
                        jadwalMsg += `╠> ${q3}المغرب  : ${jadwal.maghrib}${q3}\n`
                        jadwalMsg += `╠> ${q3}العشاء'    : ${jadwal.isya}${q3}\n`
                        jadwalMsg += '╚═〘 *XD1 Team* 〙'
                        reply(jadwalMsg)
                    }
                    break
                }
                /* #endregion Islam Commands */
            }

            switch (command) {
                /* #region Maker */
                case 'attp': {
                    if (args.length == 0) return reply(`نص متحرك للصورة. مثال ${prefix}attp Halo sayang`)
                    reply(resMsg.wait)
                    let txt = isQuotedChat ? quotedMsg.body : arg
                    sendSFU(`https://api.xteam.xyz/attp?file&text=${txt}`, false)
                    break
                }

                case 'ttp':
                case 'ttpc': {
                    if (args.length == 0) return reply(
                        `Text to picture. Contoh:\n` +
                        `${prefix}ttp Halo sayang\n` +
                        `${prefix}ttpc red Halo (warna merah)\n` +
                        `${prefix}ttpc red+blue Halo (warna merah stroke biru)\n` +
                        `${prefix}ttpc red-blue Halo (warna gradasi merah-biru)\n` +
                        `${prefix}ttpc red-blue+white Halo (warna gradasi merah-biru stroke putih)\n`
                    )
                    reply(resMsg.wait)
                    let ttpBuff
                    if (command == `ttpc`) {
                        let col1 = args[0].split(`-`)[0].split(`+`)[0]
                        let col2 = args[0].split(`+`)[0].split(`-`)[1]
                        let strk = args[0].split(`+`)[1]
                        let txt = isQuotedChat ? quotedMsg.body : arg1
                        ttpBuff = await canvas.ttp(txt, col1, col2, strk).catch(e => { return printError(e) })
                    } else {
                        let txt = isQuotedChat ? quotedMsg.body : arg
                        ttpBuff = await canvas.ttp(txt).catch(e => { return printError(e) })
                    }
                    client.sendImageAsSticker(from, ttpBuff, stickerMetadata)
                    break
                }

                case 'trigger':
                case 'trigger2': {
                    if (!isLolApiActive) return sendText(`❌ آسف الميزة غير نشطة!`)
                    if (!isMedia && !isQuotedImage && !isQuotedSticker) return reply(`مشغلات الصورة. الرد على الصورة أو إرسال صورة مع التسمية التوضيحية ${prefix}trigger atau ${prefix}trigger2`)
                    try {
                        if (quotedMsg?.isAnimated) return reply(`خطأ! لا يدعم تحريك الملصقات.`)
                        reply(resMsg.wait)
                        let enc = (isQuotedImage || isQuotedSticker) ? quotedMsg : message
                        let mediaData = await decryptMedia(enc)
                        if (isQuotedSticker) mediaData = await webpToPng(mediaData)
                        let _url = await uploadImages(mediaData, true)
                        let resu = (command === 'trigger') ? lolApi(`creator1/trigger`, { img: _url }) : lolApi(`editor/triggered`, { img: _url })
                        sendSFU(resu, false)
                    } catch (err) { printError(err) }
                    break
                }

                case 'wasted': {
                    if (!isMedia && !isQuotedImage && !isQuotedSticker) return reply(`أضف تأثيرًا ضائعًا إلى الصورة. الرد على الصورة أو إرسال صورة مع التسمية التوضيحية ${prefix}wasted`)
                    try {
                        if (quotedMsg?.isAnimated) return reply(`خطأ! لا يدعم تحريك الملصقات.`)
                        reply(resMsg.wait)
                        let enc = (isQuotedImage || isQuotedSticker) ? quotedMsg : message
                        let mediaData = await decryptMedia(enc)
                        if (isQuotedSticker) mediaData = await webpToPng(mediaData)
                        const inp = './media/wasted.png'
                        const path = './media/wastedres.mp4'
                        writeFileSync(inp, mediaData)
                        Ffmpeg(inp)
                            .addInput('./src/mov/wasted.mov')
                            .setFfmpegPath('./bin/ffmpeg.exe')
                            .complexFilter('[0:v]scale=512:512,eq=saturation=0.3,overlay=0:0')
                            .save(path)
                            .on('end', async () => {
                                await client.sendMp4AsSticker(from, path, undefined, stickerMetadata)
                                    .then(console.log(color('[LOGS]', 'grey'), `Wasted تمت معالجة الملصق لـ ${processTime(t, moment())} ثانية`))
                                if (existsSync(path)) unlinkSync(path)
                                sendText(resMsg.success.sticker)
                            })
                            .on('error', (e) => {
                                console.log('An error occurred: ' + e.message)
                                if (existsSync(path)) unlinkSync(path)
                                return reply(resMsg.error.norm)
                            })
                    } catch (err) { printError(err) }
                    break
                }

                // TODO add more maker
                /* #endregion */
            }

            switch (command) {
                /* #region Media Downloader */
                case 'ytmp3': {
                    if (args.length == 0) return reply(`ضع الرابط مع الامر `)
                    if (arg.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/) === null) return reply(`رابط يوتيوب غير صالح.`)
                    sendText(resMsg.wait)
                    let ytid = args[0].substr((args[0].indexOf('=')) != -1 ? (args[0].indexOf('=') + 1) : (args[0].indexOf('be/') + 3))
                    try {
                        ytid = ytid.replace(/&.+/g, '').replace(/>/g, '')
                        let path = `./media/temp_${t}.mp3`

                        let { videoDetails: inf } = await ytdl.getInfo(ytid)
                        if (inf.lengthثانية > 900) return reply(`خطأ. مدة الفيديو أكثر من 15 دقيقة!`)
                        let dur = `${('0' + (inf.lengthثانية / 60).toFixed(0)).slice(-2)}:${('0' + (inf.lengthثانية % 60)).slice(-2)}`
                        let estimasi = inf.lengthثانية / 200
                        let est = estimasi.toFixed(0)
                        client.sendFileFromUrl(from, `${inf.thumbnails[3].url}`, ``,
                            `معلومات الفيديو` +
                            `${q3}عنوان المقطع    :${q3} ${inf.title}\n` +
                            `${q3}القناة :${q3} ${inf.ownerChannelName}\n` +
                            `${q3}مدة  :${q3} ${dur}\n` +
                            `${q3}تريخ التنزيل:${q3} ${inf.uploadDate}\n` +
                            `${q3}المشاهدات    :${q3} ${inf.viewCount}\n\n` +
                            ``, id)

                        let stream = ytdl(ytid, { quality: 'highestaudio' })

                        Ffmpeg({ source: stream })
                            .setFfmpegPath('./bin/ffmpeg')
                            .on('error', (err) => {
                                console.log('An error occurred: ' + err.message)
                                reply(resMsg.error.norm)
                                if (existsSync(path)) unlinkSync(path)
                            })
                            .on('end', () => {
                                client.sendFile(from, path, `${ytid}.mp3`, '', id).then(console.log(color('[LOGS]', 'grey'), `معالجة الصوت لـ ${processTime(t, moment())} ثانية`))
                                if (existsSync(path)) unlinkSync(path)
                            })
                            .saveToFile(path)
                    } catch (err) {
                        console.log(err)
                        reply(resMsg.error.norm)
                    }
                    break
                }

                case 'ytmp4': {
                    if (args.length == 0) return reply(`ضع الرابط مع الامر قبل الارسال`)
                    if (arg.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/) === null) return reply(`رابط يوتيوب غير صالح.`)
                    sendText(resMsg.wait)
                    let ytid = args[0].substr((args[0].indexOf('=')) != -1 ? (args[0].indexOf('=') + 1) : (args[0].indexOf('be/') + 3))
                    try {
                        ytid = ytid.replace(/&.+/g, '').replace(/>/g, '')
                        let path = `./media/temp_${t}.mp4`

                        let { videoDetails: inf } = await ytdl.getInfo(ytid)
                        if (inf.lengthثانية > 900) return reply(`خطأ. مدة الفيديو أكثر من 15 دقيقة!`)
                        let dur = `${('0' + (inf.lengthثانية / 60).toFixed(0)).slice(-2)}:${('0' + (inf.lengthثانية % 60)).slice(-2)}`
                        let estimasi = inf.lengthثانية / 100
                        let est = estimasi.toFixed(0)
                        client.sendFileFromUrl(from, `${inf.thumbnails[3].url}`, ``,
                            `معلومات الفيديو` +
                            `${q3}الموضوع   :${q3} ${inf.title}\n` +
                            `${q3}القناة :${q3} ${inf.ownerChannelName}\n` +
                            `${q3}مدة  :${q3} ${dur}\n` +
                            `${q3}تاريخ التنزيل:${q3} ${inf.uploadDate}\n` +
                            `${q3}المشاهدات    :${q3} ${inf.viewCount}\n\n` +
                            ``, id)

                        ytdl(ytid, { quality: 'highest' }).pipe(createWriteStream(path))
                            .on('error', (err) => {
                                printError(err, false)
                                if (existsSync(path)) unlinkSync(path)
                            })
                            .on('finish', () => {
                                client.sendFile(from, path, `${ytid}.mp4`, inf.title, id).then(console.log(color('[LOGS]', 'grey'), `تمت معالجة الفيديو لـ ${processTime(t, moment())} ثانية`))
                                if (existsSync(path)) unlinkSync(path)
                            })
                    } catch (err) {
                        console.log(err)
                        reply(resMsg.error.norm)
                    }
                    break
                }

                case 'play': { //Silakan kalian custom sendiri jika ada yang ingin diubah
                    if (args.length == 0) return reply(`للبحث عن الأغاني من youtube \ n \ n الاستخدام: ${prefix}play <judul lagu>\nContoh: ${prefix}play radioactive but im waking up`)
                    let _ytresult = await api.ytsearch(arg).catch(e => { return printError(e) })
                    let ytresult = _ytresult[0]
                    const hasDurationProperty = Object.prototype.hasOwnProperty.call(ytresult, 'duration')
                    if (!hasDurationProperty) return reply(`آسف الميزة قيد الإصلاح`)

                    try {
                        if (ytresult.ثانية > 600) return reply(`خطأ. مدة الفيديو أكثر من 15 دقيقة!`)
                        let estimasi = ytresult.ثانية / 200
                        let est = estimasi.toFixed(0)
                        await client.sendFileFromUrl(from, `${ytresult.thumbnail}`, ``,
                            `تم العثور على مقاطع فيديو!\n\n` +
                            `${q3}عنوان   :${q3} ${ytresult.title}\n` +
                            `${q3}قناة :${q3} ${ytresult.author.name}\n` +
                            `${q3}مدة  :${q3} ${ytresult.timestamp}\n` +
                            `${q3}تم الرفع:${q3} ${ytresult.ago}\n` +
                            `${q3}رأي    :${q3} ${ytresult.views}\n` +
                            `${q3}عنوان Url     :${q3} ${ytresult.url}\n\n` +
                            `يتم إرسال الصوت ± ${est} menit`, id)

                        //Download video and save as MP3 file
                        let path = `./media/temp_${t}.mp3`

                        let stream = ytdl(ytresult.videoId, { quality: 'highestaudio' })
                        Ffmpeg({ source: stream })
                            .setFfmpegPath('./bin/ffmpeg')
                            .on('error', (err) => {
                                if (existsSync(path)) unlinkSync(path)
                                printError(err, true)
                            })
                            .on('end', () => {
                                client.sendFile(from, path, `audio.mp3`, '', id).then(console.log(color('[LOGS]', 'grey'), `معالجة الصوت لـ ${processTime(t, moment())} ثانية`))
                                sleep(2000).then(() => { if (existsSync(path)) unlinkSync(path) })
                            })
                            .saveToFile(path)
                    } catch (err) {
                        console.log(err)
                        reply(resMsg.error.norm)
                    }
                    break
                }

                case 'tiktok': case 'tt':
                case 'tiktok1': case 'tt1':
                case 'tiktok2': case 'tt2': {
                    if (args.length === 0 && !isQuotedChat) return reply(`اكتب الامر ثم ضع رابط المقطع ثم قم بالارسال `)
                    let urls = isQuotedChat ? quotedMsg.body : arg
                    if (!isUrl(urls)) { return reply('عذرا ، الرابط الذي أرسلته غير صالح.') }
                    let _id = quotedMsg != null ? quotedMsg.id : id
                    await sendText(resMsg.wait)
                    try {
                        let _mp4Url
                        if (!/\d/.test(command)) {
                            let result = await scraper.snaptik(browser, urls)
                            _mp4Url = result?.source
                        }
                        if (command.endsWith('1')) {
                            let result = await scraper.snaptik(browser, urls)
                            _mp4Url = result?.server1
                        }
                        if (command.endsWith('2')) {
                            let ress = await scraper.ssstik(browser, urls)
                            _mp4Url = ress?.mp4
                        }
                        if (_mp4Url != undefined) {
                            await client.sendFileFromUrl(from, _mp4Url, '', '', _id)
                        }
                    } catch (err) {
                        console.log(err)
                        return reply(resMsg.error.norm + `حدث خطاء`)
                    }
                    break
                }

                case 'tiktokmp3':
                case 'ttmp3': {
                    if (args.length === 0 && !isQuotedChat) return reply(`للحتميل من التك توك اكتب الامر ثم ضع الرابط ثم ارسل`)
                    let urls = isQuotedChat ? quotedMsg.body : arg
                    if (!isUrl(urls)) { return reply('عذرا ، الرابط الذي أرسلته غير صالح.') }
                    sendText(resMsg.wait)
                    let result = await scraper.ssstik(browser, urls).catch(e => { return printError(e) })
                    let _id = quotedMsg != null ? quotedMsg.id : id
                    if (result.mp3) client.sendFileFromUrl(from, result.mp3, '', '', _id).catch(e => { return printError(e) })
                    else reply('عذرا ، الرابط الذي أرسلته غير صالح.')
                    break
                }

                case 'fbdl':
                case 'twdl': {
                    if (args.length === 0 && !isQuotedChat && command == 'fbdl') return reply(`قم بتنزيل منشور فيديو Facebook. How?\n${prefix}fbdl (alamat video Facebook)\nTanpa tanda kurung`)
                    if (args.length === 0 && !isQuotedChat && command == 'twdl') return reply(`تنزيل مشاركات فيديو Twitter. كيف?\n${prefix}twdl (alamat video Twitter)\nTanpa tanda kurung`)
                    let urls = isQuotedChat ? quotedMsg.body : arg
                    if (!urls.includes('facebook') && !urls.includes('twitter')) { return reply('عذرا ، الرابط الذي أرسلته غير صالح. تأكد من أنه رابط Facebook أو Twitter فقط') }
                    sendText(resMsg.wait)
                    let res = await scraper.saveFrom(browser, urls).catch(n => {
                        return printError(n)
                    })
                    let _id = quotedMsg != null ? quotedMsg.id : id
                    let msg = `روابط صالحة. انتظر الفيديو أو قم بتنزيل الدليل باستخدام الارتباط التالي. \ n`
                    for (let u of res) {
                        msg += `جودة: ${u.quality} : ` + await urlShortener(u.url) + '\n'
                    }
                    if (res[0]?.url) sendText(msg)
                    let uls
                    if (command == 'fbdl') uls = lodash.find(res, { quality: '4' }).url || lodash.find(res, { quality: '6' }).url
                    if (command == 'twdl') uls = res[1].url || res[0].url
                    if (uls) client.sendFileFromUrl(from, uls, '', '', _id)
                    else sendText(`طلب مهلات. روابط خاصة! تأكد من أن الرابط عام.`)
                    break
                }

                case 'igdl': {
                    if (args.length === 0 && !isQuotedChat) return reply(`اكتب المر ثم ضع الرابط و ارسل `)
                    let urls = isQuotedChat ? quotedMsg.body : arg
                    if (!urls.includes('instagram')) { return reply('الرابط غير صالح تاكد من انه ليس من قناة خاصة او معطل') }
                    sendText(resMsg.wait)
                    let result = await scraper.saveFrom(browser, urls.replace(/[?&]utm_medium=[^&]+/, ''), true).catch(e => { return printError(e) })
                    let _id = quotedMsg != null ? quotedMsg.id : id
                    if (result) client.sendFileFromUrl(from, result, '', '', _id)
                    else reply(`خطأ! غير موجود`)
                    break
                }

                case 'igstory': {
                    if (args.length !== 2) return reply(
                        `ضع الامر ثم اسم المستخدم في الانستقرام  ليقوم بتنزيل القصة الخاصة به`)
                    sendText(resMsg.wait)
                    let data = await scraper.saveFromStory(browser, args[0].replace(/@/, '')).catch(e => printError(e, false))
                    if (!data) return reply(`❌ لم يتم العثور على القصص.`)
                    if (data?.length < args[1]) return reply(`❌ لم يتم العثور على القصص. عدد القصص المتاحة: ${data.length}`)
                    sendFFU(data[+args[1] - 1], '', false)
                    break
                }
                /* #endregion End of Media Downloader */
            }

            switch (command) {
                /* #region Audio Converter */
                case 'tomp3': {
                    if (!isQuotedVideo && !isMedia) return reply(`تحويل mp4 / الفيديو إلى mp3 / الصوت. ${prefix}tomp3`)
                    audioConverter('atempo=1', 'tomp3')
                    break
                }

                case 'earrape': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`قم بزيادة حجم الصوت العالي. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}earrape`)
                    let complexFilter = `acrusher=level_in=2:level_out=6:bits=8:mode=log:aa=1,lowpass=f=3500`
                    audioConverter(complexFilter, 'earrape')
                    break
                }

                case 'robot': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`تغيير الصوت مثل الروبوت. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}robot`)
                    let complexFilter = `afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75`
                    audioConverter(complexFilter, 'robot')
                    break
                }

                case 'reverse': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`يعيد تشغيل الصوت. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}reverse`)
                    let complexFilter = `areverse`
                    audioConverter(complexFilter, 'reverse')
                    break
                }

                case 'samarkan': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`تمويه أسلوب التحقيق. يرجى الرد على الملاحظات الصوتية أو الصوتية باستخدام الأمر ${prefix}samarkan`)
                    let complexFilter = `rubberband=pitch=1.5`
                    audioConverter(complexFilter, 'samarkan')
                    break
                }

                case 'vibrato': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`تغيير الصوت ليهتز. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}vibrato`)
                    let complexFilter = `vibrato=f=8`
                    audioConverter(complexFilter, 'vibrato')
                    break
                }

                case 'nightcore': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`قم بتغيير صوت أسلوب nightcore. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}nightcore`)
                    let complexFilter = `asetrate=44100*1.25,bass=g=3'`
                    audioConverter(complexFilter, 'nightcore')
                    break
                }

                case 'deepslow': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`تغيير الصوت إلى عميق ومنخفض. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}deepslow`)
                    let complexFilter = `atempo=1.1,asetrate=44100*0.7,bass=g=5'`
                    audioConverter(complexFilter, 'deepslow')
                    break
                }

                case '8d': {
                    if (!isQuotedPtt && !isQuotedAudio) return reply(`تغيير صوت تأثير الصوت المحيطي 8d. يرجى اقتباس / الرد على الملاحظات الصوتية أو الصوتية مع الأوامر ${prefix}8d`)
                    let complexFilter = `apulsator=hz=1/16`
                    audioConverter(complexFilter, 'pulsator')
                    break
                }

                case 'cf': {
                    if (!isQuotedPtt && !isQuotedAudio && args.length === 0) return reply(`قم بتغيير المؤثرات الصوتية باستخدام المرشحات المعقدة المخصصة (للمستخدمين ذوي الخبرة فقط). Silakan quote/balas audio atau voice notes dengan perintah ${prefix}cf <args>\nContoh bisa diliat disini https://www.vacing.com/ffmpeg_audio_filters/index.html`)
                    audioConverter(arg, 'custom')
                    break
                }
                /* #endregion End of Audio Converter */
            }

            switch (command) {
                /* #region Primbon */
                case 'artinama': {
                    if (args.length == 0) return reply(`لمعرفة معنى اسم شخص ما \ n نوع ${prefix}artinama nama kamu`)
                    api.artinama(arg)
                        .then(res => {
                            reply(res)
                        })
                        .catch(e => { return printError(e) })
                    break
                }
                /* #endregion */
            }

            switch (command) {
                /* #region Random Kata */
                case 'fakta':
                    fetch('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/random/faktaunix.txt')
                        .then(res => res.text())
                        .then(faktaBody => {
                            let splitnix = faktaBody.split('\n')
                            let randomnix = sample(splitnix)
                            reply(randomnix)
                        })
                        .catch(e => { return printError(e) })
                    break
                case 'katabijak':
                    fetch('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/random/katabijax.txt')
                        .then(res => res.text())
                        .then(kataBody => {
                            let splitbijak = kataBody.split('\n')
                            let randombijak = sample(splitbijak)
                            reply(randombijak)
                        })
                        .catch(e => { return printError(e) })
                    break
                case 'pantun':
                    fetch('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/random/pantun.txt')
                        .then(res => res.text())
                        .then(pantunBody => {
                            let splitpantun = pantunBody.split('\n')
                            let randompantun = sample(splitpantun)
                            reply(' ' + randompantun.replace(/aruga-line/g, "\n"))
                        })
                        .catch(e => { return printError(e) })
                    break
                case 'quote':
                case 'quotes': {
                    const quotex = await api.quote()
                        .catch(e => { return printError(e) })
                    await reply(quotex)
                        .catch(e => { return printError(e) })
                    break
                }
                /* #endregion Random kata */
            }

            switch (command) {
                /* #region Random Images */
                case 'anime': {
                    if (args.length == 0) return reply(`Untuk menggunakan ${prefix}anime\nSilakan ketik: ${prefix}anime [query]\nContoh: ${prefix}anime random\n\nquery yang tersedia:\nrandom, waifu, husbu, neko`)
                    if (args[0] == 'random' || args[0] == 'waifu' || args[0] == 'husbu' || args[0] == 'neko') {
                        fetch('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/random/anime/' + args[0] + '.txt')
                            .then(res => res.text())
                            .then(animeBody => {
                                let randomnime = animeBody.split('\n')
                                let randomnimex = sample(randomnime)
                                client.sendFileFromUrl(from, randomnimex, '', 'Nih...', id)
                            })
                            .catch(e => { return printError(e) })
                    } else {
                        reply(`عذرا الاستعلام غير متوفر. أرجوك أكتب ${prefix}anime لرؤية قائمة الاستفسارات`)
                    }
                    break
                }

                case 'memes':
                case 'meme': {
                    const randmeme = await api.sreddit()
                    client.sendFileFromUrl(from, randmeme.url, '', randmeme.title, id)
                        .catch(e => { return printError(e) })
                    break
                }
                /* #endregion */
            }

            switch (command) {
                /* #region Search Any */
                case 'kbbi': {
                    if (args.length != 1) return reply(`ابحث عن معنى الكلمات في KBBI \ n الاستخدام: ${prefix}kbbi <kata>\ncontoh: ${prefix}kbbi apel`)
                    scraper.kbbi(args[0])
                        .then(res => {
                            if (res == '') return reply(`قال آسف "${args[0]}" غير متوفر في KBBI`)
                            reply(res + `\n\nMore: https://kbbi.web.id/${args[0]}`)

                        }).catch(e => { return printError(e) })
                    break
                }
                case 'ytsearch':
                case 'yt': {
                    if (args.length == 0) {
                        prev.savePrevCmd(pengirim, prefix + command)
                        return reply(`${q3}عن ماذا تبحث؟ إرسال الاستعلام في 15 ثانية...${q3}`)
                    }
                    let ytresult = await api.ytsearch(arg).catch(e => { return printError(e) })
                    try {
                        let psn =
                            `✪〘 بحث يوتيوب 〙✪\n` +
                            `Query: ${arg}\n` +
                            `اضغط لفترة طويلة على عنوان url للنسخ.\n` +
                            `تحميل باستخدام *${prefix}ytmp4* atau *${prefix}ytmp3*\n`
                        ytresult.forEach(item => {
                            psn +=
                                `\n--------------------------------------\n` +
                                `${q3}عنوان   :${q3} ${item.title}\n` +
                                `${q3}قناة :${q3} ${item.author?.name}\n` +
                                `${q3}مدة  :${q3} ${item.timestamp}\n` +
                                `${q3}تم الرفع:${q3} ${item.ago}\n` +
                                `${q3}رأي    :${q3} ${item.views}\n` +
                                `${q3}رأي     :${q3} ${item.url}`
                        })
                        reply(psn)
                    } catch (err) { printError(err) }
                    break
                }
                case 'pin':
                case 'pinterest':
                case 'pin2':
                case 'pinterest2':
                case 'pin3':
                case 'pinterest3': {
                    if (args.length == 0) return reply(`للبحث عن الصور من نوع pinterest \ n: ${prefix}pinterest [search]\ncontoh: ${prefix}pinterest naruto`)
                    if (await cariNsfw(chats.toLowerCase())) return reply(`عن ماذا تبحث؟ تائب يا أخي ، لا يزال الأمر على ما يرام ، ليس لديك رأس مال بعد الآن.`)
                    let pin = (q) => api.pinterest(q)
                    if (command.endsWith('2')) pin = (q) => scraper.pinterestLight(q)
                    if (command.endsWith('3')) pin = (q) => scraper.pinterest(browser, q)

                    if (args[0] === '+') {
                        await pin(arg1)
                            .then(res => {
                                let img = sampleSize(res, 10)
                                img.forEach(async i => {
                                    if (i != null) await client.sendFileFromUrl(from, i, '', '')
                                })
                            })
                    } else {
                        await pin(arg)
                            .then(res => {
                                let img = sample(res)
                                if (img === null || img === undefined) return reply(resMsg.error.norm + `\nAtau النتائج غير موجودة.`)

                                client.sendFileFromUrl(from, img, '', '', id)
                                    .catch(e => {
                                        console.log(`fdci err : ${e}`)
                                        reply(resMsg.error.norm + '\nCoba gunakan /pin2 atau /pin3')
                                    })
                            })
                            .catch(e => {
                                console.log(`fdci err : ${e}`)
                                return reply(resMsg.error.norm + '\nCoba gunakan /pin2 atau /pin3')
                            })
                    }
                    break
                }

                case 'image':
                case 'images':
                case 'gimg':
                case 'gimage': {
                    if (args.length == 0) return reply(`للبحث عن الصور من نوع google image: ${prefix}gimage [search]\ncontoh: ${prefix}gimage naruto`)
                    if (await cariNsfw(chats.toLowerCase())) return reply(`عن ماذا تبحث؟ تائب يا أخي ، لا يزال الأمر على ما يرام ، ليس لديك رأس مال بعد الآن.`)
                    const img = await scraper.gimage(browser, arg).catch(e => { return printError(e) })
                    if (img === null) return reply(resMsg.error.norm).then(() => console.log(`img عودة فارغة`))
                    await client.sendFileFromUrl(from, img, '', '', id).catch(e => printError(e, false))
                    break
                }

                case 'reddit':
                case 'subreddit':
                case 'sreddit': {
                    if (args.length == 0) return reply(`للبحث عن صور من sub reddit\nketik: ${prefix}sreddit [search]\ncontoh: ${prefix}sreddit naruto`)
                    const hasilreddit = await api.sreddit(arg)
                    if (hasilreddit.nsfw === true) return reply(`عن ماذا تبحث؟ تائب يا أخي ، لا يزال الأمر على ما يرام ، ليس لديك رأس مال بعد الآن.`)
                    await client.sendFileFromUrl(from, hasilreddit.url, '', hasilreddit.title, id)
                        .catch(e => { return printError(e) })
                    break
                }
                case 'lirik':
                case 'lyric': {
                    if (args.length === 0) return reply(`للبحث عن كلمات باسم الأغنية أو مقتطف غنائي\nketik: ${prefix}lirik <query>\nContoh: ${prefix}lirik lathi`)
                    let res = await api.lyric(arg).catch(e => { return printError(e, true, false) })
                    if (res) reply(res)
                    else reply(`خطأ! كلمات غير موجودة.`)
                    break
                }
                /* #endregion End of search any */
            }

            switch (command) {
                /* #region Informasi commands */
                case 'resi':
                case 'cekresi': {
                    if (args.length != 2) return reply(`عذرا ، تنسيق رسالة خاطئ.\nSilakan ketik pesan dengan ${prefix}resi <kurir> <no_resi>\n\nKurir yang tersedia:\njne, pos, tiki, wahana, jnt, rpx, sap, sicepat, pcp, jet, dse, first, ninja, lion, idl, rex`)
                    const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
                    if (!kurirs.includes(args[0])) return sendText(`عذرًا ، هذا النوع من رحلات الشحن غير متاح. هذه الخدمة تدعم الشحن فقط ${kurirs.join(', ')} Tolong periksa kembali.`)
                    console.log(color('[LOGS]', 'grey'), 'Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
                    cekResi(args[0], args[1]).then((result) => sendText(result))
                    break
                }

                case 'cekcovid': {
                    let { data } = await get('https://api.terhambar.com/negara/Indonesia', { httpsAgent: httpsAgent })
                    if (!isQuotedLocation) return reply(`عذرا ، تنسيق رسالة خاطئ.\nKirimkan lokasi dan reply dengan caption ${prefix}cekcovid\n\n` +
                        `حالة Covid في إندونيسيا\n` +
                        `${q3}Tanggal      :${q3} ${data.terakhir}\n` +
                        `${q3}Kasus Baru   :${q3} ${data.kasus_baru}\n` +
                        `${q3}Meninggal    :${q3} ${data.meninggal_baru}\n` +
                        `${q3}Penanganan   :${q3} ${data.penanganan}\n` +
                        `${q3}Total Sembuh :${q3} ${data.sembuh}\n` +
                        `${q3}Total Mnggl  :${q3} ${data.meninggal}\n` +
                        `${q3}Total        :${q3} ${data.total}`
                    )
                    reply(resMsg.wait)
                    const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
                    if (zoneStatus.kode != 200) sendText('Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
                    let datax = ''
                    zoneStatus.data.forEach((z, i) => {
                        const { zone, region } = z
                        const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                        datax += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
                    })
                    const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${datax}`
                    sendText(text)
                    break
                }

                case 'crjogja': {
                    sendText(resMsg.wait)
                    let path = './media/crjogja.png'
                    scraper.ssweb(browser, path, 'https://sipora.staklimyogyakarta.com/radar/', { width: 600, height: 600 })
                        .catch(e => { return printError(e) })
                    await client.sendFile(from, path, '', 'Captured from https://sipora.staklimyogyakarta.com/radar/', id)
                        .then(() => {
                            client.simulateTyping(from, false)
                        })
                        .catch(() => {
                            reply('Ada yang error! Coba lagi beberapa saat kemudian. Mending cek sendiri aja ke\nhttps://sipora.staklimyogyakarta.com/radar/')
                        })
                    break
                }

                case 'cuaca': {
                    if (args.length == 0) return reply(`لمشاهدة الطقس في منطقة: ${prefix}cuaca [daerah]`)
                    const cuaca = await api.cuaca(arg)
                    await reply(cuaca)
                        .catch(e => { return printError(e) })
                    break
                }

                case 'buildgi': {
                    // data json dari scnya Niskata (https://github.com/Niskata/bot-whatsapp/blob/c5a2c01e7a0ce7cd846e07c1e28c10daf912aaa0/HandleMsg.js#L1024) :D
                    if (args.length == 0) return reply(`لرؤية بناء شخصية Genshin Impact. ${prefix}buildgi nama.\nContoh: ${prefix}buildgi jean`)
                    const genshinBuild = JSON.parse(readFileSync('./src/json/genshinbuild.json'))
                    const getBuild = lodash.find(genshinBuild, { name: args[0] })?.build
                    if (getBuild === undefined) return reply(`Character tidak ditemukan`)
                    sendFFU(getBuild)
                    break
                }
                /* #endregion */
            }

            switch (command) {
                /* #region Hiburan */
                case 'tod':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    reply(`قبل اللعب ، وعد بتنفيذ أي أوامر يتم إعطاؤها.\n\nSilakan Pilih:\n-> ${prefix}truth\n-> ${prefix}dare`)
                    break

                case 'truth': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    let truths = readFileSync('./src/txt/truth.txt', 'utf8')
                    let _truth = sample(truths.split('\n'))
                    await reply(_truth)
                        .catch(e => { return printError(e) })
                    break
                }

                case 'dare': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    let dares = readFileSync('./src/txt/dare.txt', 'utf8')
                    let _dare = sample(dares.split('\n'))
                    await reply(_dare)
                        .catch(e => { return printError(e) })
                    break
                }

                case 'tbg':
                case 'tebakgambar': {
                    const isRoomExist = await tebak.isRoomExist(from)
                    if (isRoomExist) return reply(`جلسة التخمين قيد التقدم. ${prefix}skip untuk skip sesi.`)
                    await tebak.getTebakGambar(from).then(async res => {
                        let menit = res.answer.split(' ').length > 2 ? 3 : 1
                        let detik = menit * 60
                        await client.sendFileFromUrl(from, res.image, '', `تخمين الصورة أعلاه.\nJawab dengan *membalas pesan ini*.\n\nWaktunya ${menit} menit.\n\n*${prefix}skip* untuk skip`, id)
                            .then(() => {
                                startTebakRoomTimer(detik, res.answer)
                            })
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'tbk':
                case 'tebakkata': {
                    const isRoomExist = await tebak.isRoomExist(from)
                    if (isRoomExist) return reply(`جلسة التخمين قيد التقدم. ${prefix}skip untuk skip sesi.`)
                    await tebak.getTebakKata(from).then(async res => {
                        let detik = 60
                        await reply(`Tebak kata yang berhubungan.\nJawab dengan *membalas pesan ini*.\n\n` +
                            `${q3 + res.pertanyaan + q3}\n\n` +
                            `Jumlah huruf: ${res.jawaban.length}\nWaktunya ${detik} detik.\n*${prefix}skip* untuk skip`)
                            .then(() => {
                                startTebakRoomTimer(detik, res.jawaban)
                            })
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'tbl':
                case 'tebaklirik': {
                    if (!isLolApiActive) return sendText(`❌ آسف الميزة غير نشطة!`)
                    const isRoomExist = await tebak.isRoomExist(from)
                    if (isRoomExist) return reply(`جلسة التخمين قيد التقدم. ${prefix}skip untuk skip sesi.`)
                    await tebak.getTebakLirik(from).then(async res => {
                        let detik = 100
                        await reply(`Tebak Lirik. Lengkapi lirik yang sesuai.\nJawab dengan *membalas pesan ini*.\n\n` +
                            `${q3 + res.question + q3}\n\n` +
                            `Jumlah huruf: ${res.answer.length}\nWaktunya ${detik} detik.\n*${prefix}skip* untuk skip`)
                            .then(() => {
                                startTebakRoomTimer(detik, res.answer)
                            })
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'tbj':
                case 'tebakjenaka': {
                    if (!isLolApiActive) return sendText(`❌ آسف الميزة غير نشطة!`)
                    const isRoomExist = await tebak.isRoomExist(from)
                    if (isRoomExist) return reply(`جلسة التخمين قيد التقدم. ${prefix}skip untuk skip sesi.`)
                    await tebak.getTebakJenaka(from).then(async res => {
                        let detik = 100
                        await reply(`Tebakan Jenaka.\nJawab dengan *membalas pesan ini*.\n\n` +
                            `${q3 + res.question + q3}\n\n` +
                            `Jumlah kata: ${res.answer.split(/\s/ig).length}\n` +
                            `Jumlah huruf: ${res.answer.length}\n` +
                            `Waktunya ${detik} detik.\n*${prefix}skip* untuk skip`)
                            .then(() => {
                                startTebakRoomTimer(detik, res.answer)
                            })
                    }).catch(e => { return printError(e) })
                    break
                }

                // TODO add more tebak

                // Skip room
                case 'skip': {
                    tebak.getAns(from).then(res => {
                        if (!res) reply(`⛔ لا توجد جلسة تخمين قيد التقدم.`)
                        else {
                            reply(`⏭ تم تخطي جلسة التخمين!\nJawabannya: *${res.ans}*`)
                            tebak.delRoom(from)
                        }
                    })
                    break
                }

                case 'skripsi': {
                    let skripsis = readFileSync('./src/txt/skripsi.txt', 'utf8')
                    let _skrps = sample(skripsis.split('\n'))
                    let gtts = new gTTS(_skrps, 'id')
                    try {
                        gtts.save('./media/tts.mp3', function () {
                            client.sendPtt(from, './media/tts.mp3')
                                .catch(err => {
                                    console.log(err)
                                    sendText(resMsg.error.norm)
                                })
                        })
                    } catch (err) { printError(err) }
                    break
                }

                case 'apakah': {
                    let x = Crypto.randomInt(0, 10)
                    let result = ''
                    if (args.length === 0) result = 'هو ما woy واضح دونغ! على سبيل المثال ، هل أنا وسيم?'
                    else {
                        if (x >= 0 && x <= 3) result = 'Iya'
                        else if (x >= 4 && x <= 7) result = 'Tidak'
                        else result = 'Coba tanya lagi'
                    }
                    var gtts = new gTTS(result, 'id')
                    try {
                        gtts.save('./media/tts.mp3', function () {
                            client.sendPtt(from, './media/tts.mp3', id)
                                .catch(err => {
                                    console.log(err)
                                    sendText(resMsg.error.norm)
                                })
                        })
                    } catch (err) { printError(err) }
                    break
                }

                case 'whatanime': {
                    sendText(`ملامح مكسورة. فقط تعال إلى هنا https://trace.moe`)
                    break
                }

                /* #endregion Hiburan */
            }

            switch (command) {
                /* #region List Creator Commands */
                case 'list':
                case 'lists': {
                    if (args.length === 0) {
                        let thelist = await list.getListName(from)
                        let _what = isGroupMsg ? `Group` : `Chat`
                        let _msg
                        if (thelist === false || thelist.length === 0) {
                            _msg = `${_what} هذا ليس لديه قائمة حتى الآن.`
                        } else {
                            _msg = `قائمة في ${_what}: ${thelist.join(', ')}`
                        }
                        reply(`${_msg}\n\nMenampilkan list/daftar yang tersimpan di database bot untuk group ini.\nPenggunaan:\n-> *${prefix}list <nama list>*
                                \nUntuk membuat list gunakan perintah:\n-> *${prefix}createlist <nama list> | <Keterangan>* contoh: ${prefix}createlist tugas | Tugas PTI 17
                                \nUntuk menghapus list beserta isinya gunakan perintah:\n-> *${prefix}deletelist <nama list>* contoh: ${prefix}deletelist tugas
                                \nUntuk mengisi list gunakan perintah:\n-> *${prefix}addtolist <nama list> <isi>* bisa lebih dari 1 menggunakan pemisah | \ncontoh: ${prefix}addtolist tugas Matematika Bab 1 deadline 2021 | Pengantar Akuntansi Bab 2
                                \nUntuk mengedit list gunakan perintah:\n-> *${prefix}editlist <nama list> <nomor> <isi>* \ncontoh: ${prefix}editlist tugas 1 Matematika Bab 2 deadline 2021
                                \nUntuk menghapus *isi* list gunakan perintah:\n-> *${prefix}delist <nama list> <nomor isi list>*\nBisa lebih dari 1 menggunakan pemisah comma (,) contoh: ${prefix}delist tugas 1, 2, 3
                                `)
                    } else if (args.length > 0) {
                        let res = await list.getListData(from, args[0])
                        if (!res) return reply(`List tidak ada, silakan buat dulu. \nGunakan perintah: *${prefix}createlist ${args[0]}* (mohon hanya gunakan 1 kata untuk nama list)`)
                        let desc = ''
                        if (res.desc !== 'Tidak ada') {
                            desc = `║ _${res.desc}_\n`
                        }
                        let respon = `╔══✪〘 List ${args[0].replace(/^\w/, (c) => c.toUpperCase())} 〙✪\n${desc}║\n`
                        res.listData.forEach((data, i) => {
                            respon += `║ ${i + 1}. ${data}\n`
                        })
                        respon += '║\n╚═〘 *XD1 Team* 〙'
                        await reply(respon)
                    }
                    break
                }

                case 'createlist': {
                    if (args.length === 0) return reply(`Untuk membuat list gunakan perintah: *${prefix}createlist <nama list> | <Keterangan>* contoh: ${prefix}createlist tugas | Tugas PTI 17\n(mohon hanya gunakan 1 kata untuk nama list)`)
                    const desc = arg.split('|')[1]?.trim() ?? 'Tidak ada'
                    const respon = await list.createList(from, args[0], desc)
                    await reply((respon === false) ? `List ${args[0]} sudah ada, gunakan nama lain.` : `List ${args[0]} berhasil dibuat.`)
                    break
                }

                case 'deletelist': {
                    if (args.length === 0) return reply(`Untuk menghapus list beserta isinya gunakan perintah: *${prefix}deletelist <nama list>* contoh: ${prefix}deletelist tugas`)
                    const thelist = await list.getListName(from)
                    if (thelist.includes(args[0])) {
                        reply(`[❗] List ${args[0]} akan dihapus.\nKirim *${prefix}yesdeletelist ${args[0]}* untuk mengonfirmasi, abaikan jika tidak jadi.`)
                    } else {
                        reply(`List ${args[0]} tidak ada.`)
                    }
                    break
                }

                case 'yesdeletelist':
                case 'confirmdeletelist': {
                    if (args.length === 0) return null
                    const respon1 = await list.deleteList(from, args[0])
                    await reply((respon1 === false) ? `List ${args[0]} tidak ada.` : `List ${args[0]} berhasil dihapus.`)
                    break
                }

                case 'addtolist': {
                    if (args.length === 0) return reply(`Untuk mengisi list gunakan perintah:\n *${prefix}addtolist <nama list> <isi>* Bisa lebih dari 1 menggunakan pemisah | \ncontoh: ${prefix}addtolist tugas Matematika Bab 1 deadline 2021 | Pengantar Akuntansi Bab 2`)
                    if (args.length === 1) return reply(`Format salah, nama dan isinya apa woy`)
                    const thelist1 = await list.getListName(from)
                    if (!thelist1.includes(args[0])) {
                        return reply(`List ${args[0]} tidak ditemukan.`)
                    } else {
                        let newlist = arg.substr(arg.indexOf(' ') + 1).split('|').map((item) => {
                            return item.trim()
                        })
                        let res = await list.addListData(from, args[0], newlist)
                        let desc = ''
                        if (res.desc !== 'Tidak ada') {
                            desc = `║ _${res.desc}_\n`
                        }
                        let respon = `╔══✪〘 List ${args[0].replace(/^\w/, (c) => c.toUpperCase())} 〙✪\n${desc}║\n`
                        res.listData.forEach((data, i) => {
                            respon += `║ ${i + 1}. ${data}\n`
                        })
                        respon += '║\n╚═〘 *XD1 Team* 〙'
                        await reply(respon)
                    }
                    break
                }

                case 'editlist': {
                    if (args.length === 0) return reply(`Untuk mengedit list gunakan perintah:\n *${prefix}editlist <nama list> <nomor> <isi>* \ncontoh: ${prefix}editlist tugas 1 Matematika Bab 2 deadline 2021`)
                    if (args.length < 3) return reply(`Format salah. pastikan ada namalist, index, sama isinya`)
                    const thelist1 = await list.getListName(from)
                    if (!thelist1.includes(args[0])) {
                        return reply(`List ${args[0]} tidak ditemukan.`)
                    } else {
                        let n = arg.substr(arg.indexOf(' ') + 1)
                        let newlist = n.substr(n.indexOf(' ') + 1)
                        let res = await list.editListData(from, args[0], newlist, args[1] - 1)
                        let desc = ''
                        if (res.desc !== 'Tidak ada') {
                            desc = `║ _${res.desc}_\n`
                        }
                        let respon = `╔══✪〘 List ${args[0].replace(/^\w/, (c) => c.toUpperCase())} 〙✪\n${desc}║\n`
                        res.listData.forEach((data, i) => {
                            respon += `║ ${i + 1}. ${data}\n`
                        })
                        respon += '║\n╚═〘 *XD1 Team* 〙'
                        await reply(respon)
                    }
                    break
                }

                case 'delist': {
                    if (args.length === 0) return reply(`Untuk menghapus *isi* list gunakan perintah: *${prefix}delist <nama list> <nomor isi list>*\nBisa lebih dari 1 menggunakan pemisah comma (,) contoh: ${prefix}delist tugas 1, 2, 3`)
                    if (args.length === 1) return reply(`Format salah, nama list dan nomor berapa woy`)
                    const thelist2 = await list.getListName(from)
                    if (!thelist2.includes(args[0])) {
                        return reply(`List ${args[0]} tidak ditemukan.`)
                    } else {
                        let number = arg.substr(arg.indexOf(' ') + 1).split(',').map((item) => {
                            return +item.trim() - 1
                        })
                        await number.reverse().forEach(async (num) => {
                            await list.removeListData(from, args[0], num)
                        })
                        let res = await list.getListData(from, args[0])
                        let desc = ''
                        if (res.desc !== 'Tidak ada') {
                            desc = `║ _${res.desc}_\n`
                        }
                        let respon = `╔══✪〘 List ${args[0].replace(/^\w/, (c) => c.toUpperCase())} 〙✪\n${desc}║\n`
                        res.listData.forEach((data, i) => {
                            respon += `║ ${i + 1}. ${data}\n`
                        })
                        respon += '║\n╚═〘 *XD1 Team* 〙'
                        await reply(respon)
                    }
                    break
                }
                /* #endregion */
            }

            switch (command) {
                /* #region Note Creator Commands */
                case 'note':
                case 'notes': {
                    if (args.length === 0) {
                        let theNote = await note.getNoteName(from)
                        let _what = isGroupMsg ? `مجموعة` : `محادثة`
                        let _msg
                        if (theNote === false || theNote === '') {
                            _msg = `${_what} ليس لديها ملاحظات حتى الآن.`
                        } else {
                            _msg = `الملاحظات على ${_what}: ${theNote.join(', ')}`
                        }
                        reply(`${_msg}يعرض الملاحظات المخزنة في قاعدة بيانات الروبوت لهذه المجموعة-> *${prefix}note <nama note>* 
                                لإنشاء ملاحظة ، استخدم الأمر-> *${prefix}createnote <nama note> <isi note>* 
                                لحذف ملاحظة استخدم الأمر-> *${prefix}deletenote <nama note>* 
                                `)
                    } else if (args.length > 0) {
                        let res = await note.getNoteData(from, args[0])
                        if (!res) return reply(`الملاحظة غير موجودة ، يرجى إنشائها أولاً. استخدم الأمر: *${prefix}createnote ${args[0]} (isinya)* (يرجى استخدام كلمة واحدة فقط لاسم الملاحظة)`)

                        let respon = `✪〘 ${args[0].toUpperCase()} 〙✪`
                        respon += `\n\n${res.content}`
                        await reply(respon)
                    }
                    break
                }

                case 'createnote': {
                    if (args.length < 2 && !isQuotedChat) return reply(`لإنشاء ملاحظة ، استخدم الأمر: *${prefix}createnote <nama note> <isinya>* `)
                    if (isQuotedChat && args.length == 0) return reply(`ما هو اسم الملاحظة؟?`)
                    let content = isQuotedChat ? quotedMsg.body : arg1
                    const respon = await note.createNote(from, args[0], content)
                    await reply((respon === false) ? `ملحوظة ${args[0]} موجود بالفعل ، استخدم اسمًا آخر.` : `ملحوظة ${args[0]} صنع بنجاح.`)
                    break
                }

                case 'deletenote': {
                    if (args.length === 0) return reply(`لحذف ملاحظة ومحتوياتها ، استخدم الأمر: *${prefix}deletenote <nama note>* `)
                    const theNote = await note.getNoteName(from)
                    if (theNote.includes(args[0])) {
                        reply(`[❗] ملحوظة ${args[0]} سيتم حذفه. إرسال *${prefix}yesdeletenote ${args[0]}* للتأكيد ، تجاهل إذا لم يكن الأمر كذلك.`)
                    } else {
                        reply(`ملحوظة ${args[0]} لا يوجد شي.`)
                    }
                    break
                }

                case 'yesdeletenote':
                case 'confirmdeletenote': {
                    if (args.length === 0) return null
                    const respon1 = await note.deleteNote(from, args[0])
                    await reply((respon1 === false) ? `ملحوظة ${args[0]} tidak ada.` : `ملحوظة ${args[0]} berhasil dihapus.`)
                    break
                }
                /* #endregion */
            }

            switch (command) {
                /* #region Group Commands */
                // Non Admin
                case 'grouplink': {
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (isGroupMsg) {
                        const inviteLink = await client.getGroupInviteLink(groupId)
                        client.sendLinkWithAutoPreview(from, inviteLink, `رابط المحموعة *${name || formattedTitle}* 
						 *${prefix}revoke* 
						 لإعادة تعيين ارتباط المجموعة`)
                    } else {
                        reply(resMsg.error.group)
                    }
                    break
                }

                case 'listonline': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    let msg = `╔══✪〘 قائمة المتصلين الحاليين 〙✪\n${readMore}`
                    lodash.filter(chat.presence.chatstates, (n) => !!n?.type).forEach(item => {
                        msg += `╠> @${item.id.replace(/@c\.us/g, '')}\n`
                    })
                    msg += '╚═〘 *XD1 Team* 〙'
                    await client.sendTextWithMentions(from, msg)
                    break
                }

                // Admin only
                case 'groupstats':
                case 'groupstat': {
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    let exp = sewa.getExp(from)
                    sendText(
                        `✪〘 حالة المجموعة 〙✪\n` +
                        `${q3}مكافحة الكلمات المسيئة      :${q3} ${isNgegas ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}مكافحة اطرد المتكرر :${q3} ${isNgegasKick ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}مكافحة الروابط :${q3} ${isAntiLink ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}مكافحة القروبات :${q3} ${isAntiLinkGroup ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}مكاقحة فركس     :${q3} ${isAntiVirtex ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}مكافحة الحذف     :${q3} ${isAntiDelete ? '*Hidup*' : 'Mati'}\n` +
                        `${q3}الترحيب بالاعضاء         :${q3} ${isWelcome ? '*Hidup*' : 'Mati'}` +
                        `${(exp) ? `\n${q3}Sewa expire at  :${q3} _${exp.trim()}_` : ''}`
                    )
                    break
                }
                case 'setname':
                case 'settitle': {
                    try {
                        if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                        if (!isGroupAdmin) return reply(resMsg.error.admin)
                        if (args.length === 0) return reply(`لتغيير اسم المجموعة 
					*${prefix}setname <nama group baru>* 
					${prefix}setname nganu`)
                        let subject = arg
                        const page = client.getPage()
                        let res = await page.evaluate((groupId, subject) => {
                            return window.Store.WapQuery.changeSubject(groupId, subject)
                        }, groupId, subject)

                        if (res.status == 200) {
                            reply(`تمت إعادة تسمية المجموعة بنجاح إلى *${subject}*`)
                        }
                    } catch (error) {
                        printError(error)
                    }
                    break
                }
                case "revoke": {
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (isBotGroupAdmin) {
                        client.revokeGroupInviteLink(from)
                            .then(() => {
                                reply(`Berhasil Revoke Grup Link gunakan *${prefix}grouplink* untuk mendapatkan group invite link yang terbaru`)
                            })
                            .catch(e => { return printError(e) })
                    }
                    break
                }
                case 'mutegroup':
                case 'group': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (args.length != 1) return reply(`لتغيير إعدادات الدردشة الجماعية بحيث يمكن للمسؤولين فقط الدردشة
				${prefix}mutegrup on
				${prefix}mutegrup off `)
                    if (args[0] == 'on' || args[0] == 'close' || args[0] == 'tutup') {
                        client.setGroupToAdminsOnly(groupId, true).then(() => sendText('⛔ تم التغيير بنجاح حتى يتمكن * المشرفين * فقط من الدردشة!'))
                    } else if (args[0] == 'off' || args[0] == 'open' || args[0] == 'buka') {
                        client.setGroupToAdminsOnly(groupId, false).then(() => sendText('✅ تم التغيير بنجاح حتى يتمكن * جميع * الأعضاء من الدردشة!'))
                    } else {
                        reply(`لتغيير إعدادات الدردشة الجماعية بحيث يمكن للمسؤولين فقط الدردشة
						${prefix}mutegrup on 
						${prefix}mutegrup off`)
                    }
                    break
                }

                case 'setprofile': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (isMedia && type == 'image' || isQuotedImage) {
                        let dataMedia = isQuotedImage ? quotedMsg : message
                        let _mimetype = dataMedia.mimetype
                        let mediaData = await decryptMedia(dataMedia)
                        let imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                        await client.setGroupIcon(groupId, imageBase64)
                    } else if (args.length === 1) {
                        if (!isUrl(args[0])) { await reply('عذرا ، الرابط الذي أرسلته غير صالح.') }
                        client.setGroupIconByUrl(groupId, args[0]).then((r) => (!r && r != undefined)
                            ? reply('عذرًا ، الرابط الذي أرسلته لا يحتوي على صورة.')
                            : reply('تم نغيير الصورة بنجاح'))
                    } else {
                        reply(`لتغيير صورة المجموعة 
						${prefix}setprofile 
						${prefix}setprofile رابط الصورة`)
                    }
                    break
                }

                case 'welcome':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args.length != 1) return reply(`اجعل  يرحب بالأعضاء الذين انضموا للتو إلى الدردشة الجماعية!
				${prefix}welcome on
				${prefix}welcome off `)
                    if (args[0] === 'on') {
                        let pos = welcome.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة الترحيب نشطة!')
                        welcome.push(chatId)
                        writeFileSync('./data/welcome.json', JSON.stringify(welcome))
                        reply('🟢 تم تفعيل ميزة الترحيب')
                    } else if (args[0] === 'off') {
                        let pos = welcome.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ميزة الترحيب ليست نشطة بعد!')
                        welcome.splice(pos, 1)
                        writeFileSync('./data/welcome.json', JSON.stringify(welcome))
                        reply('🔴 تم تعطيل ميزة الترحيب')
                    } else {
                        reply(`اجعل  يرحب بالأعضاء الذين انضموا للتو إلى الدردشة الجماعية!
						n${prefix}welcome on 
						${prefix}welcome off `)
                    }
                    break

                case 'antidelete':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args.length != 1) return reply(`اجعل الروبوت يكتشف ما إذا كانت هناك رسالة محذوفة في الدردشة الجماعية!
				${prefix}antidelete on
				${prefix}antidelete off `)
                    if (args[0] === 'on') {
                        let pos = antiDelete.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة منع الحذف نشطة!')
                        antiDelete.push(chatId)
                        writeFileSync('./data/antidelete.json', JSON.stringify(antiDelete))
                        reply('🟢 تم تنشيط ميزة منع الحذف')
                    } else if (args[0] === 'off') {
                        let pos = antiDelete.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ميزة منع الحذف ليست نشطة بعد!')
                        antiDelete.splice(pos, 1)
                        writeFileSync('./data/antidelete.json', JSON.stringify(antiDelete))
                        reply('🔴 تم تعطيل ميزة منع الحذف')
                    } else {
                        reply(`اجعل الروبوت يكتشف ما إذا كانت هناك رسالة محذوفة في الدردشة الجماعية!
						${prefix}antidelete on 
						${prefix}antidelete off `)
                    }
                    break

                case 'add':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (args.length === 0) return reply(`ليستخدم ${prefix}add\nPenggunaan: ${prefix}add <nomor>\ncontoh: ${prefix}add 628xxx`)
                    try {
                        await client.addParticipant(from, `${arg.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '')}@c.us`)
                    } catch {
                        reply('Tidak dapat menambahkan target')
                    }
                    break

                case 'kick':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (mentionedJidList.length === 0) return reply('عذرًا ، تنسيق الرسالة خاطئ. \ n الرجاء وضع علامة على شخص واحد أو أكثر ليتم استبعاده')
                    if (mentionedJidList[0] === botNumber) return await reply('عذرًا ، تنسيق الرسالة خاطئ. \ n غير قادر على تسجيل الخروج من حساب الروبوت بنفسي')
                    await client.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
                    for (let ment of mentionedJidList) {
                        if (groupAdmins.includes(ment)) return await sendText('⛔ فشل ، لا يمكنك إزالة مجموعة الإدارة.')
                        if (ownerNumber.includes(ment)) return await sendText('⛔ فشل ، لا يمكنك إخراج روبوت المالك. \ n نعم ، أنا غير ممتن.')
                        await client.removeParticipant(groupId, ment)
                    }
                    break

                case 'promote':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (mentionedJidList.length != 1) return reply('عذرًا ، يمكن ترقية مستخدم واحد فقط')
                    if (groupAdmins.includes(mentionedJidList[0])) return await reply('عذرا ، المستخدم هو بالفعل مشرف.')
                    if (mentionedJidList[0] === botNumber) return await reply('عذرًا ، تنسيق رسالة خاطئ.  غير قادر على ترقية حساب الروبوت الخاص')
                    await client.promoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `تمت الموافقة على الطلب @${mentionedJidList[0].replace('@c.us', '')} لترقيته كمسؤول.`)
                    break

                case 'demote':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                    if (mentionedJidList.length != 1) return reply('معذرة ، يمكن خفض رتبة مستخدم واحد فقط')
                    if (!groupAdmins.includes(mentionedJidList[0])) return await reply('عذرا ، المستخدم ليس مسؤول حتى الآن.')
                    if (mentionedJidList[0] === botNumber) return await reply('عذرًا ، تنسيق رسالة خاطئ.  غير قادر على خفض ترتيب حساب الروبوت الخاص')
                    if (mentionedJidList[0] === ownerNumber) return await reply('آسف ، لا يمكن خفض رتبة المالك ، هاهاهاها')
                    await client.demoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `تم قبول الطلب ، تم حذف منصب مسؤول من : @${mentionedJidList[0].replace('@c.us', '')}.`)
                    break

                case 'yesbye': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    await sendText('وداعا جميعا 👋🏻🥲')

                    setTimeout(async () => {
                        await client.leaveGroup(groupId)
                    }, 2000)
                    setTimeout(async () => {
                        await client.deleteChat(groupId)
                    }, 4000)
                }
                    break

                case 'bye': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    await sendText('😓 لا تحتاج لي بعد الآن؟ حسنا إذا. أرسل * / yesbye * لإزالة البوت 🤖')
                    break
                }

                case 'tagall':
                case 'alle': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    const groupMem = await client.getGroupMembers(groupId)
                    if (args.length != 0) {
                        let res = `✪〘 اعضاء القروب 〙✪\n${arg}\n\n------------------\n${readMore}`
                        for (let m of groupMem) {
                            res += `@${m.id.replace(/@c\.us/g, '')} `
                        }
                        await client.sendTextWithMentions(from, res)
                    } else {
                        let res = `╔══✪〘 اعضاء القروب 〙✪\n${readMore}`
                        for (let m of groupMem) {
                            res += `╠> @${m.id.replace(/@c\.us/g, '')}\n`
                        }
                        res += '╚═〘 *XD1 Team* 〙'
                        await client.sendTextWithMentions(from, res)
                    }
                    break
                }
                /* #endregion Group */
            }

            switch (command) {
                /* #region Anti Kasar */
                case 'antikasar': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args[0] === 'on') {
                        let pos = antiKasar.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة مكافحة إساءة الاستخدام نشطة!')
                        antiKasar.push(chatId)
                        writeFileSync('./data/ngegas.json', JSON.stringify(antiKasar))
                        reply('🟢 تم تنشيط ميزة Anti-Rude')
                    } else if (args[0] === 'off') {
                        let pos = antiKasar.indexOf(chatId)
                        if (pos === -1) return reply('🔴 الميزة المضادة للكلمات ليست نشطة بعد!')
                        antiKasar.splice(pos, 1)
                        writeFileSync('./data/ngegas.json', JSON.stringify(antiKasar))
                        reply('🔴 تم تعطيل ميزة Anti-Rude')
                    } else {
                        reply(`لتفعيل خاصية Rude Feature في الدردشة الجماعية\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n${prefix}antikasar on --mengaktifkan\n${prefix}antikasar off --nonaktifkan\n\n${prefix}reset --reset jumlah denda`)
                    }
                    break
                }

                case 'antikk': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args[0] === 'on') {
                        if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                        let pos = antiKasarKick.indexOf(chatId)
                        if (pos != -1) return reply('🟢 الخاصية نشطة بالفعل!')
                        antiKasarKick.push(chatId)
                        writeFileSync('./data/ngegaskick.json', JSON.stringify(antiKasarKick))
                        reply('🟢 تم تنشيط مكافحة الكلمات المسيئة')
                    } else if (args[0] === 'off') {
                        let pos = antiKasarKick.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ليست نشطة !')
                        antiKasarKick.splice(pos, 1)
                        writeFileSync('./data/ngegasKick.json', JSON.stringify(antiKasarKick))
                        reply('🔴 تم تعطيل مكافحة الكلمات المسيئة')
                    } else {
                        reply(`لتفعيل خاصية مكافحة الكلمات المسيئة في حال وصل الشخص الى عشرين الف نقطه يتم طرده من قبل البوت تلقائية
						${prefix}antikasarkick on 
						${prefix}antikasarkick off
						 ${prefix}reset `)
                    }
                    break
                }


                case 'addkk': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length != 1) { return reply(`أدخل كلمة واحدة فقط لإضافتها إلى القائمة المسيئة. `) }
                    else {
                        if (kataKasar.indexOf(args[0]) != -1) return reply(`تم اضافة ${args[0]} بنجاح.`)
                        kataKasar.push(args[0])
                        writeFileSync('./settings/katakasar.json', JSON.stringify(kataKasar))
                        reply(`تم اضافة ${args[0]} بنجاح.`)
                    }
                    break
                }

                case 'reset': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    const reset = db.chain.get('groups').find({ id: groupId }).assign({ members: [] }).value()
                    db.write()
                    if (reset) {
                        await sendText("تم إعادة الترتيب.")
                    }
                    break
                }

                case 'klasemen':
                case 'klasmen':
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isNgegas && !isNgegasKick) return reply(`مكافحة الكلمات المسيئة غير نشط للتنشيط اكتب : 
				*${prefix}antikasar on*`)
                    try {
                        const klasemen = db.chain.get('groups').filter({ id: groupId }).map('members').value()[0]
                        if (klasemen == null) return reply(`لم يتم كتابة اي كلمات مسيئة الى الان`)
                        let urut = Object.entries(klasemen).map(([key, val]) => ({ id: key, ...val })).sort((a, b) => b.denda - a.denda);
                        let textKlas = "*ترتيب الغرامات المؤقتة*\n"
                        let i = 1;
                        urut.forEach((klsmn) => {
                            textKlas += i + ". @" + klsmn.id.replace('@c.us', '') + " ➤ Rp" + formatin(klsmn.denda) + "\n"
                            i++
                        })
                        await client.sendTextWithMentions(from, textKlas)
                    } catch (err) {
                        console.log(err)
                        reply(resMsg.error.norm)
                    }
                    break
                /* #endregion anti kasar */
            }

            switch (command) {
                /* #region Anti-anti */
                case 'antilinkgroup': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args[0] === 'on') {
                        if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                        let pos = antiLinkGroup.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة مجموعة مكافحة الارتباط نشطة!')
                        antiLinkGroup.push(chatId)
                        writeFileSync('./data/antilinkgroup.json', JSON.stringify(antiLinkGroup))
                        reply('🟢 تم تنشيط ميزة مجموعة منع الارتباط')
                    } else if (args[0] === 'off') {
                        let pos = antiLinkGroup.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ميزة مكافحة مجموعة الارتباط ليست نشطة بعد!')
                        antiLinkGroup.splice(pos, 1)
                        writeFileSync('./data/antilinkgroup.json', JSON.stringify(antiLinkGroup))
                        reply('🔴 تم تعطيل ميزة مكافحة مجموعة الارتباط')
                    } else {
                        reply(`لتفعيل ميزة مجموعة منع الارتباط في الدردشة الجماعية\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengirimkan link group lain maka akan terkick otomatis\n\nPenggunaan\n${prefix}antilinkgroup on --mengaktifkan\n${prefix}antilinkgroup off --nonaktifkan`)
                    }
                    break
                }
                case 'antivirtex': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args[0] === 'on') {
                        if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                        let pos = antiVirtex.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة مكافحة منع الرسائل الطويلة نشط!')
                        antiVirtex.push(chatId)
                        writeFileSync('./data/antivirtex.json', JSON.stringify(antiVirtex))
                        reply('🟢 تم تنشيط ميزة مكافحة الرسائل الطويلة')
                    } else if (args[0] === 'off') {
                        let pos = antiVirtex.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ميزة مكافحة منع الرسائل الطويلة غير نشط!')
                        antiVirtex.splice(pos, 1)
                        writeFileSync('./data/antivirtex.json', JSON.stringify(antiVirtex))
                        reply('🔴 تم تعطيل ميزة مكافحة الرسائل الطويلة')
                    } else {
                        reply(`لتفعيل ميزة مكافحة الرسائل الطويلة في الدردشة الجماعية 
						${prefix}antivirtex on
						${prefix}antivirtex off `)
                    }
                    break
                }
                case 'antilink': {
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (!isGroupAdmin) return reply(resMsg.error.admin)
                    if (args[0] === 'on') {
                        if (!isBotGroupAdmin) return reply(resMsg.error.botAdm)
                        let posi = antiLinkGroup.indexOf(chatId)
                        if (posi != -1) {
                            // disable anti link group first
                            antiLinkGroup.splice(posi, 1)
                            writeFileSync('./data/antilinkgroup.json', JSON.stringify(antiLinkGroup))
                        }
                        let pos = antiLink.indexOf(chatId)
                        if (pos != -1) return reply('🟢 ميزة مكافحة الروابط مفعله!')

                        antiLink.push(chatId)
                        writeFileSync('./data/antilink.json', JSON.stringify(antiLink))
                        reply('🟢 تم تفعيل ميزة منع جميع الروابط')
                    } else if (args[0] === 'off') {
                        let pos = antiLink.indexOf(chatId)
                        if (pos === -1) return reply('🔴 ميزة مكافحة الروابط غير نشطة!')
                        antiLink.splice(pos, 1)
                        writeFileSync('./data/antilink.json', JSON.stringify(antiLink))
                        reply('🔴 تم تعطيل ميزة مكافحة جميع الارتباط')
                    } else {
                        reply(`لتفعيل ميزة مكافحة الروابط 
						${prefix}antilink on ${prefix}antilink off `)
                    }
                    break
                }
                /* #endregion Anti */
            }

            switch (command) {
                /* #region Other commands */
                case 'del':
                    if (!quotedMsg) return reply(`قم بالرد على الرسالة المراد حذفها`)
                    if (!quotedMsgObj.fromMe) return reply(`قم بالرد على الرسالة المراد حذفها ${prefix}del`)
                    client.simulateTyping(from, false)
                    await client.deleteMessage(from, quotedMsg.id, false).catch(e => printError(e, false))
                    break
                case 'sfx':
                case 'listvn': {
                    let listMsg = ''
                    sfx.forEach(n => {
                        listMsg = listMsg + '\n -> ' + n
                    })
                    if (args.length === 0) return reply(`إرسال SFX أو VN المتاح: كيفية كتابة اسم sfx مباشرة ${listMsg}`)
                    break
                }
                case 'reminder':
                case 'remind': {
                    if (args.length === 0 && quotedMsg === null) return reply(`أرسل رسالة في وقت معين.\n*${prefix}remind <xdxhxm> <Text atau isinya>*\nIsi x dengan angka. Misal 1d1h1m = 1 hari lebih 1 jam lebih 1 menit\nContoh: ${prefix}remind 1h5m Jangan Lupa minum!\nBot akan kirim ulang pesan 'Jangan Lupa minum!' setelah 1 jam 5 menit.\n\n*${prefix}remind <DD/MM-hh:mm> <Text atau isinya>* utk tgl dan waktu spesifik\n*${prefix}remind <hh:mm> <Text atau isinya>* utk waktu pd hari ini\nContoh: ${prefix}remind 15/04-12:00 Jangan Lupa minum!\nBot akan kirim ulang pesan 'Jangan Lupa minum!' pada tanggal 15/04 jam 12:00 tahun sekarang. \n\nNote: waktu dalam GMT+7/WIB`)
                    const dd = args[0].match(/\d+(d|D)/g)
                    const hh = args[0].match(/\d+(h|H)/g)
                    const mm = args[0].match(/\d+(m|M)/g)
                    const hhmm = args[0].match(/\d{2}:\d{2}/g)
                    let DDMM = args[0].match(/\d\d?\/\d\d?/g) || [moment(t * 1000).format('DD/MM')]

                    let milis = 0
                    if (dd === null && hh === null && mm === null && hhmm === null) {
                        return reply(`Format salah! masukkan waktu`)
                    } else if (hhmm === null) {
                        let d = dd != null ? dd[0].replace(/d|D/g, '') : 0
                        let h = hh != null ? hh[0].replace(/h|H/g, '') : 0
                        let m = mm != null ? mm[0].replace(/m|M/g, '') : 0

                        milis = parseInt((d * 24 * 60 * 60 * 1000) + (h * 60 * 60 * 1000) + (m * 60 * 1000))
                    } else {
                        let DD = DDMM[0].replace(/\/\d\d?/g, '')
                        let MM = DDMM[0].replace(/\d\d?\//g, '')
                        milis = Date.parse(`${moment(t * 1000).format('YYYY')}-${MM}-${DD} ${hhmm[0]}:00 GMT+7`) - moment(t * 1000)
                    }
                    if (milis < 0) return reply(`تذكير بالماضي؟ هممم ممتع...\n\nYa gabisa lah`)
                    if (milis >= 864000000) return reply(`لقد فات الأوان ، قبل 10 أيام كحد أقصى`)

                    let content = arg.trim().substring(arg.indexOf(' ') + 1)
                    if (content === '') return reply(`صيغة خاطئة! ما هي الرسالة?`)
                    if (milis === null) return reply(`عذرا، هناك خطأ ما!`)
                    await schedule.futureMilis(client, message, content, milis, (quotedMsg != null)).catch(e => console.log(e))
                    await reply(`تذكير بـ ${moment((t * 1000) + milis).format('DD/MM/YY HH:mm:ss')} sets!`)
                    break
                }
                /* #endregion other */
            }

            switch (command) {
                /* #region Owner Commands */
                case 'getstory':
                case 'getstatus': {
                    try {
                        let param = args[0]?.replace(/@/, '')
                        const page = client.getPage()
                        const stories = await page.evaluate(() => {
                            let obj = window.Store.Msg.filter(x => x.__x_id.remote.server == 'broadcast')
                            let res = []
                            for (let o of obj) {
                                res.push(window.WAPI._serializeRawObj(o))
                            }
                            return res
                        })
                        if (args.length == 0) {
                            let storyList = `الحالة متاحة:\n`
                            let nodupe = lodash.uniqBy(stories, 'author.user')
                            for (let s of nodupe) {
                                storyList += `${s.author.user} -> @${s.author.user}\n`
                            }
                            client.sendTextWithMentions(from, storyList)
                            return sendText('Tag user lah')
                        }
                        client.sendTextWithMentions(from, `_إحضار حالة whatsapp من @${param}_`)
                        await sleep(2000)
                        let userStories = stories.filter(v => v.author.user == param)
                        if (userStories.length === 0) return reply('لا توجد حالة أو ربما لم تقم بحفظ جهة الاتصال بعد')
                        for (let story of userStories) {
                            if (story.type == 'chat') {
                                let capt =
                                    `${q3}From  :${q3} @${story.author.user}\n` +
                                    `${q3}Time  :${q3} ${moment(story.t * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                                    `${q3}Type  :${q3} ${story.type}\n` +
                                    `${q3}Text  :${q3} ${story.body}`
                                await client.sendTextWithMentions(from, capt)
                            } else if (story.type == 'image' || story.type == 'video') {
                                let capt =
                                    `${q3}From     :${q3} @${story.author.user}\n` +
                                    `${q3}Time     :${q3} ${moment(story.t * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                                    `${q3}Type     :${q3} ${story.type}\n` + `${story.type == 'video' ? `${q3}Duration :${q3} ${story.duration}s\n` : ''}` +
                                    `${q3}Caption  :${q3} ${story.caption || '_none_'}`
                                const mediaData = await decryptMedia(story)
                                await client.sendImage(from, `data:${story.mimetype};base64,${mediaData.toString('base64')}`, 'file' + story.type == 'image' ? '.jpg' : '.mp4', capt, id)
                            }
                        }
                    } catch (error) {
                        printError(error)
                    }
                    break
                }
                case 'owneronly': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (!isGroupMsg) return reply(resMsg.error.group)
                    if (args[0] === 'on') {
                        let pos = ownerBotOnly.indexOf(chatId)
                        if (pos != -1) return reply('Sudah aktif!')
                        ownerBotOnly.push(chatId)
                        writeFileSync('./data/ownerbotonly.json', JSON.stringify(ownerBotOnly))
                        reply('Owner only mode')
                    } else if (args[0] === 'off') {
                        let pos = ownerBotOnly.indexOf(chatId)
                        if (pos === -1) return reply('Belum aktif!')
                        ownerBotOnly.splice(pos, 1)
                        writeFileSync('./data/ownerbotonly.json', JSON.stringify(ownerBotOnly))
                        reply('Public mode')
                    } else {
                        reply(`/owneronly on/off`)
                    }
                    break
                }

                case 'leavegroup': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`Untuk mengeluarkan bot dari groupId\n\nCaranya ketik: \n${prefix}leavegroup <groupId> <alasan>`)
                    let _groupId = args[0]
                    await client.sendText(_groupId, arg1).catch(() => reply('Error'))

                    let pos = antiKasar.indexOf(_groupId)
                    if (pos !== -1) {
                        antiKasar.splice(pos, 1)
                        writeFileSync('./data/ngegas.json', JSON.stringify(antiKasar))
                    }

                    let posi = welcome.indexOf(_groupId)
                    if (posi !== -1) {
                        welcome.splice(posi, 1)
                        writeFileSync('./data/welcome.json', JSON.stringify(welcome))
                    }

                    let posa = antiLinkGroup.indexOf(_groupId)
                    if (posa !== -1) {
                        antiLinkGroup.splice(posa, 1)
                        writeFileSync('./data/antilinkgroup.json', JSON.stringify(antiLinkGroup))
                    }

                    let posd = antiLink.indexOf(_groupId)
                    if (posd !== -1) {
                        antiLink.splice(posd, 1)
                        writeFileSync('./data/antilink.json', JSON.stringify(antiLink))
                    }

                    setTimeout(async () => {
                        await client.leaveGroup(_groupId).then(() => client.sendText(ownerNumber, 'Berhasil'))
                    }, 2000)
                    setTimeout(async () => {
                        await client.deleteChat(_groupId)
                    }, 4000)
                    break
                }

                case 'addsewa': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length !== 2) return reply(`Untuk menyewakan bot\n\nCaranya ketik: \n${prefix}addsewa <brphari> <linkgroup/id>`)
                    sewa.sewaBot(client, args[1], args[0]).then(res => {
                        if (res) reply(`Berhasil menyewakan bot selama ${args[0]} hari.`)
                        else reply(`Gagal menyewakan bot!`)
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'listsewa': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    sewa.getListSewa(client).then(res => {
                        if (res != null) {
                            sendJSON(res)
                            sendText('Total sewa: ' + res.length)
                        }
                    })
                    break
                }

                case 'deletesewa': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    let res = sewa.deleteSewa(arg)
                    if (res) {
                        sendText('Berhasil')
                    } else sendText('Gagal')
                    break
                }

                case 'ban': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`لمنع اي شخص من استخدام مزايا البوت نهائيا: 
				${prefix}ban 628xx 
				${prefix}unban 628xx 
				${prefix}ban @tag @tag @tag`)
                    if (args.length != 0) {
                        const numId = arg.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '') + '@c.us'
                        let pos = banned.indexOf(numId)
                        if (pos != -1) return reply('الهدف محظور بالفعل!')
                        banned.push(numId)
                        writeFileSync('./data/banned.json', JSON.stringify(banned))
                        reply('تم حظر الهدف بنجاح!')
                    } else {
                        for (let m of mentionedJidList) {
                            let pos = banned.indexOf(m)
                            if (pos != -1) reply('الهدف محظور بالفعل!')
                            else {
                                banned.push(m.replace('@', ''))
                                writeFileSync('./data/banned.json', JSON.stringify(banned))
                                reply(`حظر النجاح ${m.replace('@c.us', '')}!`)
                            }
                        }
                    }
                    break
                }

                case 'unban': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`يشيل الباند من اي شخص : 
				${prefix}ban 628xx 
				${prefix}unban 628xx 
				${prefix}ban @tag @tag @tag`)
                    const numId = arg.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '') + '@c.us'
                    let pos = banned.indexOf(numId)
                    if (pos === -1) return reply('غير موجود!')
                    banned.splice(pos, 1)
                    writeFileSync('./data/banned.json', JSON.stringify(banned))
                    reply('لم يكن محضور من الاساس!')
                }
                    break
                case 'gban': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`لحضر مجموعة من استخدام البوت: 
				${prefix}gban 628xx-xx@g.us
				${prefix}ungban 628xx-xx@g.us `)
                    if (!args[0].endsWith('@g.us')) return reply(`خطأ! معرف المجموعة غير صالح`)
                    let pos = banned.indexOf(args[0])
                    if (pos != -1) return reply('الهدف محظور بالفعل!')
                    groupBanned.push(args[0])
                    writeFileSync('./data/groupbanned.json', JSON.stringify(groupBanned))
                    reply('تم حظر الهدف بنجاح!')
                    break
                }

                case 'ungban': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`يشيل الباند من اي شخص : 
				${prefix}ban 628xx 
				${prefix}unban 628xx 
				${prefix}ban @tag @tag @tag`)
                    let pos = groupBanned.indexOf(args[0])
                    if (pos === -1) return reply('غير موجود!')
                    groupBanned.splice(pos, 1)
                    writeFileSync('./data/banned.json', JSON.stringify(groupBanned))
                    reply('هدف النجاح غير محظور!')
                }
                    break

                case 'bc': {//untuk broadcast atau promosi
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`ارسال رسالة جماعية للمضافين كلهم
				${prefix}bc اكتب الرسالة`)
                    const chatz = await client.getAllChatIds()
                    reply(`يتم الارسال حاليا: ${chatz.length} للدردشة`)
                    let count = 0
                    for (let idk of chatz) {
                        await sleep(2000)
                        await client.sendText(idk.id, `\t✪〘 *XD1 Team* 〙✪\n\n${arg}`)
                        count += 1
                    }
                    reply(`تم الارسال: ${count} بنجاح`)
                    break
                }

                case 'bcgroup': {//untuk broadcast atau promosi ke group
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length == 0) return reply(`للبث لجميع المجموعات اكتب:
				${prefix}bcgroup [محتوى الدردشة]`)
                    const groupz = await client.getAllGroups()
                    reply(`جاري الارسال لجميع: ${groupz.length} مجموعات`)
                    let count = 0
                    for (let idk of groupz) {
                        await sleep(2000)
                        await client.sendText(idk.id, `\t✪〘 *بث XD1 Team* 〙✪\n\n${arg}`)
                        count += 1
                    }
                    reply(`تم الارسال! Total: ${count} مجموعات`)
                    break
                }

                case 'leaveall': {//mengeluarkan bot dari semua group serta menghapus chatnya
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    const allGroupz = await client.getAllGroups()
                    reply(`يتم التجهيز للمغادرة من جميع المجموعات: ${allGroupz.length}`)
                    let count = 0
                    for (let group of allGroupz) {
                        let _id = group.contact.id
                        let isPrem = groupPrem.includes(_id)
                        if (!isPrem) {
                            await client.sendText(_id, `آسف ، الروبوت قيد التنظيف ، المجموعة الإجمالية نشطة : ${allGroupz.length}.اشكرك.`)
                            await sleep(2000)
                            await client.leaveGroup(_id)
                            await sleep(1000)
                            await client.deleteChat(_id)
                            count += 1
                        }
                    }
                    reply(`مغادرة جميع: ${count} المجموعات`)
                    break
                }

                case 'clearexitedgroup': { //menghapus group yang sudah keluar
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    const allGroupzs = await client.getAllGroups()
                    reply('تمت المعالجة لمسح جميع المجموعة التي تم الخروج منها!')
                    let count = 0
                    for (let gc of allGroupzs) {
                        await sleep(1000)
                        if (gc.isReadOnly || !gc.canSend) {
                            client.deleteChat(gc.id)
                            count += 1
                        }
                    }
                    reply(`تم حذف جميع المجموعات التي تم الخروج منها! المجموع: ${count} groups`)
                    break
                }

                case 'deleteall': {//menghapus seluruh pesan diakun bot
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    const allChatx = await client.getAllChats()
                    reply(`تمت المعالجة للحذف ${allChatx.length} chat!`)
                    let count = 0
                    for (let dchat of allChatx) {
                        await sleep(1000)
                        client.deleteChat(dchat.id)
                        count += 1
                    }
                    reply(`حذف جميع المحادثات الناجحة! Total: ${count} chats`)
                    break
                }

                case 'clearall': {//menghapus seluruh pesan tanpa menghapus chat diakun bot
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    const allChatxy = await client.getAllChats()
                    reply(`تمت معالجتها للمسح ${allChatxy.length} chat!`)
                    let count = 0
                    for (let dchat of allChatxy) {
                        await sleep(1000)
                        client.clearChat(dchat.id)
                        count += 1
                    }
                    reply(`مسح كل نجاح الدردشة! المجموع: ${count} chats`)
                    break
                }

                case 'cleanchat': {
                    const chats = await client.getAllChats()
                    client.sendText(from, `تمت معالجة المسح التلقائي باستخدام ${chats.length} chat!`)
                    let deleted = 0, cleared = 0
                    for (let chat of chats) {
                        if (!chat.isGroup && chat.id !== ownerNumber) {
                            await client.deleteChat(chat.id)
                            deleted += 1
                        }
                        if (chat.id === ownerNumber || chat.isGroup) {
                            await client.clearChat(chat.id)
                            cleared += 1
                        }
                    }
                    client.sendText(from, `تم حذف الدردشة : ${deleted}\nChat cleared : ${cleared}`)
                    break
                }

                case 'refresh':
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    await reply(`تحديث صفحة الواتس اب!`)
                    setTimeout(() => {
                        try {
                            client.refresh().then(async () => {
                                console.log(`تم تحديث البوت!`)
                                reply(`تم تحديث البوت!`)
                            })
                        } catch (err) {
                            console.log(color('[ERROR]', 'red'), err)
                        }
                    }, 2000)
                    break

                case 'restart': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    await reply(`♻ سيتم إعادة تشغيل خادم الروبوت!`)
                    await sleep(2000)
                    spawn('pm2 reload all')
                    break
                }

                case 'u':
                case 'unblock': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length === 0) return reply(`لإلغاء حظر جهة اتصال, ${prefix}unblock 628xxx`)
                    await client.contactUnblock(`${arg.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '')}@c.us`).then((n) => {
                        if (n) return reply(`Berhasil unblock ${arg}.`)
                        else reply(`Nomor ${arg} tidak terdaftar.`)
                    }).catch(e => { return printError(e) })
                    break
                }

                case 'getinfo': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length === 0) return reply(`امنح رابط المجموعة يا أخي`)
                    let inf = await client.inviteInfo(arg).catch(e => { return printError(e) })
                    sendText(JSON.stringify(inf, null, 2))
                    break
                }

                case 'grouplist':
                case 'listgroup': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    let msg = `سرد كافة المجموعات\n\n`
                    let groups = await client.getAllGroups()
                    let count = 1
                    groups.forEach((group) => {
                        let c = group.groupMetadata
                        let td = '```'
                        msg += `\n${td}${count < 10 ? count + '. ' : count + '.'} Nama    :${td} ${group.name}\n`
                        msg += `${td}    GroupId :${td} ${c.id}\n`
                        msg += `${td}    Types   :${td} ${groupPrem.includes(c.id) ? '*Premium*' : sewa.isSewa(c.id) ? '_Sewa_' : 'Free'}\n`
                        msg += `${td}    Members :${td} ${c.participants.length}\n`
                        count++
                    })
                    sendText(msg)
                    break
                }

                case 'addprem': {
                    if (!isOwnerBot) return reply(resMsg.error.owner)
                    if (args.length === 0) return reply(`إعطاء معرف المجموعة وإخوانه`)
                    if (!args[0].match('@g.us')) return reply(`معرف المجموعة غير صالح وإخوانه`)
                    let pos = groupPrem.indexOf(args[0])
                    if (pos != -1) return reply('مفعل بالفعل!')
                    groupPrem.push(args[0])
                    writeFileSync('./data/premiumgroup.json', JSON.stringify(groupPrem))
                    reply(`Berhasil`)
                    break
                }
                /* #endregion */
            }
            client.simulateTyping(chat.id, false)
        }
        /* #endregion Handle command */

        /* #region Process Functions */
        //Tebak room
        if (!isCmd) {
            tebak.getAns(from).then(res => {
                if (res && quotedMsg?.fromMe) {
                    if (res.ans?.toLowerCase() === chats?.toLowerCase()) {
                        reply(`✅ اجابة صحيحة! : *${res.ans}*`)
                        tebak.delRoom(from)
                    } else {
                        reply(`❌ خاطئ!`)
                    }
                }
            })
        }
        // Anti link group function
        if (isAntiLinkGroup && isGroupMsg && ['chat', 'video', 'image'].includes(type)) {
            let msg = ''
            if (['video', 'image'].includes(type) && caption) msg = caption
            else msg = message.body
            if (msg?.match(/chat\.whatsapp\.com/gi) !== null) {
                if (!isBotGroupAdmin) return sendText('Gagal melakukan kick, bot bukan admin')
                if (isGroupAdmin) {
                    reply(`لايمكن النقر هنا.`)
                } else {
                    console.log(color('[LOGS]', 'grey'), `تم اكتشاف ارتباط المجموعة ، طرد المرسل من ${name || formattedTitle}`)
                    reply(`‼️〘 ANTI LINK GROUP 〙‼️\nMohon عفوا. تم اكتشاف رابط مجموعة WhatsApp! ركلة تلقائية...`)
                    setTimeout(async () => {
                        await client.removeParticipant(groupId, pengirim)
                    }, 2000)
                }
            }
        }

        // Anti semua link function
        if (isAntiLink && isGroupMsg && ['chat', 'video', 'image'].includes(type)) {
            let msg = ''
            if (['video', 'image'].includes(type) && caption) msg = caption
            else msg = message.body
            if (msg?.match(/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi) !== null) {
                if (!isBotGroupAdmin) return sendText('Gagal melakukan kick, bot bukan admin')
                if (isGroupAdmin) {
                    reply(`Duh admin yang share link. Gabisa dikick deh.`)
                } else {
                    console.log(color('[LOGS]', 'grey'), `Any link detected, kicking sender from ${name || formattedTitle}`)
                    reply(`‼️〘 ANTI LINK 〙‼️\nMohon maaf. Link terdeteksi! Auto kick...`)
                    setTimeout(async () => {
                        await client.removeParticipant(groupId, pengirim)
                    }, 2000)
                }
            }
        }

        // Kata kasar function
        if (!isCmd && isGroupMsg && (isNgegas || isNgegasKick) && ['chat', 'video', 'image'].includes(type) && isKasar) {
            const _denda = sample([1000, 2000, 3000, 5000, 10000])
            const find = db.chain.get('groups').find({ id: groupId }).value()
            if (find && find.id === groupId) {
                const existUser = db.chain.get('groups').filter({ id: groupId }).map('members').value()[0]
                const isIn = inArray(pengirim, existUser)
                if (existUser && isIn !== -1) {
                    const denda = db.chain.get('groups').filter({ id: groupId }).map('members[' + isIn + ']')
                        .find({ id: pengirim }).update('denda', n => n + _denda).value()
                    db.write()
                    if (denda) {
                        await reply(`${resMsg.badw}\nالرصيد +${_denda}\nالمجموع : Rp` + formatin(denda.denda) + `${isNgegasKick && !isGroupAdmin ? `في حال وصلت عشرين الف تتم تطبيق العقوبة > 20rb` : ''}`)
                        if (denda.denda > 20000 && isNgegasKick && !isGroupAdmin) {
                            reply(`╔══✪〘 تم اصدار عقوبة 〙✪\n║\n║ سيتم طردك من المجموعة. ║ لأن الغرامة تتجاوز 20 ألفاً.║ سلم على الشباب║\n╚═〘 XD1 Team 〙`)
                            db.chain.get('groups').filter({ id: groupId }).map('members[' + isIn + ']')
                                .remove({ id: pengirim }).value()
                            db.write()
                            await sleep(3000)
                            client.removeParticipant(groupId, pengirim)
                        }
                        if (denda.denda >= 2000000) {
                            banned.push(pengirim)
                            writeFileSync('./data/banned.json', JSON.stringify(banned))
                            reply(`╔══✪〘 تم اصدار عقوبة 〙✪\n║\n║ لقد تم حظرك من قبل الروبوت.║ لأن الغرامة تتجاوز 2 مليون.║ سلم على الشباب║\n║ Denda -2.000.000\n║\n╚═〘 XD1 Team 〙`)
                            db.chain.get('groups').filter({ id: groupId }).map('members[' + isIn + ']')
                                .find({ id: pengirim }).update('denda', n => n - 2000000).value()
                            db.write()
                        }
                    }
                } else {
                    const cekMember = db.chain.get('groups').filter({ id: groupId }).map('members').value()[0]
                    if (cekMember.length === 0) {
                        db.chain.get('groups').find({ id: groupId }).set('members', [{ id: pengirim, denda: _denda }]).value()
                        db.write()
                    } else {
                        const foundUser = db.chain.get('groups').filter({ id: groupId }).map('members').value()[0]
                        foundUser.push({ id: pengirim, denda: _denda })
                        await reply(`${resMsg.badw}الرصيد +Rp${formatin(_denda)}${isNgegasKick && !isGroupAdmin ? `في حال وصلت عشرين الف تتم تطبيق العقوبة > 20rb` : ''}`)
                        db.chain.get('groups').find({ id: groupId }).set('members', foundUser).value()
                        db.write()
                    }
                }
            } else {
                db.chain.get('groups').push({ id: groupId, members: [{ id: pengirim, denda: _denda }] }).value()
                db.write()
                await reply(`${resMsg.badw}\nالرصيد  +${_denda}\nالمجموع : Rp${formatin(_denda)}${isNgegasKick && !isGroupAdmin ? `في حال وصلت عشرين الف تتم تطبيق العقوبة > 20rb` : ''}`)
            }
        }
        /* #endregion Anti-anti */
    } catch (err) {
        console.log(color('[ERR>]', 'red'), err)
    }
}
/* #endregion */

export { HandleMsg }
