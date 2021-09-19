/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-01-02 20:31:13
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Modified time: 2021-08-05 16:43:46
 * @ Description:
 */

import { createReadFileSync, initGlobalVariable } from './utils/index.js'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { create, Client, decryptMedia } from '@open-wa/wa-automate'
import { canvas, schedule, sewa } from './lib/index.js'
import chromeLauncher from 'chrome-launcher'
import { scheduleJob } from 'node-schedule'
import { HandleMsg } from './HandleMsg.js'
import { spawn } from 'child_process'
import options from './utils/options.js'
import puppeteer from 'puppeteer-extra'
import moment from 'moment-timezone'
import PQueue from 'p-queue'
import figlet from 'figlet'
import fs from 'fs-extra'
const path = chromeLauncher.Launcher.getInstallations()[0]
const jobList = JSON.parse(createReadFileSync('./data/schedule.json'))
const setting = JSON.parse(createReadFileSync('./settings/setting.json'))
moment.tz.setDefault('Asia/Jakarta').locale('id')
initGlobalVariable()

let {
    ownerNumber,
    groupLimit,
    prefix
} = setting

const queue = new PQueue({ concurrency: 4, timeout: 3000, throwOnTimeout: true })
queue.on('next', () => {
    if (queue.size > 0 || queue.pending > 0) console.log(color('[==>>]', 'red'), `In-process: ${queue.pending} In-queue: ${queue.size}`)
})

const start = async (client = new Client()) => {
    try {
        console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
        console.log(color(figlet.textSync('  XD1 Team', { font: 'Ghost', horizontalLayout: 'default' })))
        console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
        console.log(color('[DEV]'), color('Danang', 'yellow'))
        console.log(color('[~>>]'), color('البوت شغال!', 'green'))
        console.log(color('[>..]'), color('Owner Commands: /menuowner', 'green'))
        client.sendText(ownerNumber, `✅ البوت شغال!`)

        puppeteer.use(StealthPlugin())
        const browser = await puppeteer.launch({
            executablePath: path,
            headless: true,
            args: [
                '--single-process',
                '--no-zygote',
                '--renderer-process-limit=1',
                '--no-first-run',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors'
            ]
        }).catch(e => console.log(e))

        // process unread message
        client.getAllUnreadMessages().then(async unreadMessages => {
            for (let message of unreadMessages) {
                if (!message.isGroupMsg) await queue.add(() => HandleMsg(message, browser, client)).catch(err => {
                    console.log((err.name === 'TimeoutError') ? `${color('[==>>]', 'red')} حدث خطأ في العملية!` : err)
                    if (queue.isPaused) queue.start()
                })
            }
        })

        // ketika seseorang mengirim pesan
        client.onMessage(async message => {
            client.setPresence(true)
            client.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
                .then((msg) => {
                    if (msg >= 3000) {
                        console.log('[CLNT]', color(`وصول الرسائل المحملة ${msg}, قطع ذاكرة التخزين المؤقت...`, 'yellow'))
                        client.cutMsgCache()
                    }
                })
            await queue.add(() => HandleMsg(message, browser, client)).catch(err => {
                console.log((err.name === 'TimeoutError') ? `${color('[==>>]', 'red')} حدث خطأ في العملية!` : err)
                if (queue.isPaused) queue.start()
            })

            if (queue.isPaused) queue.start()
        }).catch(err => {
            console.log(err)
        })

        // Load Scheduled Job
        // client, from, quotedId, content, date, isQuoted

        try {
            jobList.jobs.forEach(async (job) => {
                schedule.loadJob(client, job.from, job.quotedId, job.content, job.date, job.isQuoted).catch(e => console.log(e))
            })
            console.log(color('[LOGS]', 'grey'), `${jobList.jobs.length} وظائف مجدولة`)

            // check sewa every 4 hours
            scheduleJob('0 */4 * * *', () => {
                console.log(color('[LOGS]', 'grey'), `التحقق من انتهاء صلاحية...`)
                sewa.checkExpireSewa(client).catch(e => console.log(e))
            })

            // Clear chat every day at 01:01
            scheduleJob('1 1 * * *', async () => {
                const chats = await client.getAllChats()
                client.sendText(ownerNumber, `تمت معالجة المسح التلقائي باستخدام ${chats.length} دردشة!`)
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
                client.sendText(ownerNumber, `تم حذف الدردشة : ${deleted}\nChat مسح : ${cleared}`)
            })
        } catch (e) {
            console.log(e)
        }

        // Listen saweria
        // sewa.listenSaweria(client, browser).catch(e => console.log(e))

        // ketika bot diinvite ke dalam group
        client.onAddedToGroup(async chat => {
            console.log(color('[==>>]', 'red'), `يقوم شخص ما بإضافة الروبوت إلى المجموعة: ${chat.groupMetadata.id}`)
            client.getAllGroups().then((groups) => {
                // kondisi ketika batas group bot telah tercapai, ubah di file settings/setting.json
                console.log(color('[==>>]', 'red'), `مجموع المجموعة: ${groups.length}. groupLimit: ${groupLimit}`)
                if (groups.length > groupLimit) {
                    console.log(color('[==>>]', 'red'), `وصلت الحد الاعلى لدخول البوت في المجموعات.`)
                    client.sendText(chat.groupMetadata.id,
                        `عذرًا ، لمنع التحميل الزائد ، فإن المجموعات الموجودة على برامج الروبوت محدودة.\n` +
                        `المجموعة: ${groups.length}/${groupLimit}\n` +
                        `شات / مالك للايجار. السعر 10 دولار الوقت النشط 1 شهر` //+
                         `اذا اردت الاشتراك الدفع في الاسفل` +
                         `PayPal: paypal.me/Foory33 \n` +
                         `* أدخل فقط رابط مجموعتك في عمود "الملاحظة" على موقع*`
                    )
                    setTimeout(() => {
                        client.leaveGroup(chat.groupMetadata.id)
                        client.deleteChat(chat.groupMetadata.id)
                    }, 3000)
                } else {
                    client.simulateTyping(chat.groupMetadata.id, true).then(async () => {
                        client.sendText(chat.groupMetadata.id, `مرحبًا يا شباب ، قدم لي XD1 Team. لمشاهدة الأوامر أو القوائم المتوفرة في الروبوت ، أرسل *${prefix}menu*. لكن افهم أولاً *${prefix}tnc*`)
                    })
                }
            })
        })

        client.onIncomingCall(async call => {
            // ketika seseorang menelpon nomor bot
            if (!call.isGroup || !call.participants.length > 1) {
                console.log(color('[==>>]', 'red'), `شخص ما يتصل بالبوت ، لول~ id: ${call.peerJid}`)
                client.sendText(call.peerJid, `⛔ عذرا لا يمكن استقبال المكالمات.\n🤖 إنه روبوت وليس إنسان. آسف ، الروبوت سوف يمنع تلقائيا!\n💬 الدردشة https://wa.me/${ownerNumber.replace('@c.us', '')}?text=Halo!%20Tolong%20buka%20block%20saya%20pada%20Serobot`)
                setTimeout(() => {
                    client.contactBlock(call.peerJid)
                }, 3000)
            }
        })

        // Mempertahankan sesi agar tetap nyala
        client.onStateChanged((state) => {
            console.log(color('[~>>>]', 'red'), state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus().then(() => queue.start())
        }).catch((err) => {
            console.log(err)
        })

        // ketika seseorang masuk/keluar dari group
        const host = await client.getHostNumber() + '@c.us'
        client.onGlobalParticipantsChanged(async event => {
            const welcome = JSON.parse(createReadFileSync('./data/welcome.json'))
            const isWelcome = welcome.includes(event.chat)
            const profile = await client.getProfilePicFromServer(event.who)
            const who = await client.getContact(event.who)
            const pushname = who.pushname || who.verifiedName || who.formattedName
            const chat = await client.getChatById(event.chat)
            const hasByProperty = Object.prototype.hasOwnProperty.call(event, 'by')
            // kondisi ketika seseorang diinvite/join group lewat link
            if (event.action === 'add' && event.who !== host && isWelcome && hasByProperty) {
                const welcomeData = await canvas.welcome(
                    profile,
                    chat.contact.profilePicThumbObj.eurl,
                    pushname,
                    chat.contact.name || chat.formattedTitle,
                    chat.groupMetadata.participants.length).catch(err => console.log(color('[ERR>]', 'red'), err))
                await client.sendImage(event.chat, welcomeData, 'welcome.png', `مرحبا بالجميع! لقد أضفنا عضوًا آخر\n-> @${event.who.replace(/@c\.us/g, '')}`)

            }
            // kondisi ketika seseorang dikick/keluar dari group
            if (event.action === 'remove' && event.who !== host && isWelcome) {
                await client.sendText(event.chat, `⚙ لقد غادر ${pushname} 👋✨`)
            }
            // Saat host keluar
            if (event.action === 'remove' && event.who == host) {
                const ngegas = JSON.parse(createReadFileSync('./data/ngegaskick.json'))
                const antiLinkGroup = JSON.parse(createReadFileSync('./data/antilinkgroup.json'))
                const antiLink = JSON.parse(createReadFileSync('./data/antilink.json'))
                let _id = event.chat
                let pos = ngegas.indexOf(_id)
                if (pos !== -1) {
                    ngegas.splice(pos, 1)
                    fs.writeFileSync('./data/ngegaskick.json', JSON.stringify(ngegas))
                }
                let posi = welcome.indexOf(_id)
                if (posi !== -1) {
                    welcome.splice(posi, 1)
                    fs.writeFileSync('./data/welcome.json', JSON.stringify(welcome))
                }
                let posa = antiLinkGroup.indexOf(_id)
                if (posa !== -1) {
                    antiLinkGroup.splice(posa, 1)
                    fs.writeFileSync('./data/antilinkgroup.json', JSON.stringify(antiLinkGroup))
                }
                let posd = antiLink.indexOf(_id)
                if (posd !== -1) {
                    antiLink.splice(posd, 1)
                    fs.writeFileSync('./data/antilink.json', JSON.stringify(antiLink))
                }
            }
        }).catch(e => {
            console.log(color('[ERR>]', 'red'), e)
        })

        client.getPage().on('error', () => {
            client.sendText(ownerNumber, `⌛ أخطاء الصفحة! سيتم إعادة تشغيل خادم الروبوت!`)
            spawn('pm2 reload all')
        })

        client.onMessageDeleted(async message => {
            try {
                const antiDelete = JSON.parse(createReadFileSync('./data/antidelete.json'))
                const isAntiDelete = antiDelete.includes(message.from)
                if (message.author != host && isAntiDelete) {
                    await client.sendTextWithMentions(message.from,
                        `‼️〘 منع الحذف 〙‼️\n` +
                        `${q3}Who     :${q3} @${message.author.replace('@c.us', '')}\n` +
                        `${q3}When    :${q3} ${moment(message.t * 1000).format('DD MMM HH:mm:ss')}\n` +
                        `${q3}Type    :${q3} ${message.type.replace(/^\w/, (c) => c.toUpperCase())}` +
                        `${message.type == 'chat' ? `\n${q3}Content :${q3}\n\n${message.body}` : ``}`
                    )
                    if (['image', 'video', 'ptt', 'audio', 'document'].includes(message.type)) {
                        const mediaData = await decryptMedia(message)
                        await client.sendFile(message.from, `data:${message.mimetype};base64,${mediaData.toString('base64')}`, '', message.caption)
                    }
                    if (message.type == 'sticker') {
                        const mediaData = await decryptMedia(message)
                        await client.sendImageAsSticker(message.from, mediaData, { pack: 'Anti delete by', author: 'SeroBot', keepScale: true })
                    }
                }
            } catch (err) {
                console.log(color('[ERR>]', 'red'), err)
            }
        }).catch(e => {
            console.log(color('[ERR>]', 'red'), e)
        })

    } catch (err) {
        console.log(color('[ERR>]', 'red'), err)
    }
}

//create session
create(options(true, start))
    .then(client => start(client))
    .catch(err => new Error(err))
