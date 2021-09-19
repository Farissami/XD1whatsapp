
## Getting Started

This project require NodeJS v12

### Install
Clone this project

```bash
> git clone https://github.com/dngda/bot-whatsapp
> cd bot-whatsapp
```

You need to install Libreoffice to use doctopdf command

Install the dependencies:

```bash
> npm install
```

### Usage
Run the Whatsapp bot

```bash
> npm start
```

After running it you need to scan the QR

### Information
- Change ownerNumber on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L2)
- Change groupLimit on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L3)
- Change memberLimit on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L4)
- Change prefix on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L5)
- Change menu on [this section](https://github.com/dngda/bot-whatsapp/blob/main/lib/menu.js#L34)
- Add kata kasar on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/katakasar.json)
- Change all apiKey on [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/api.json.example) then *rename to api.json*

- Create Saweria account and get SaweriaOverlay on [this website](https://saweria.co)
- Get Api NoBackground on [this website](https://www.remove.bg/)
- Get Api LolHuman on [this website](https://lolhuman.herokuapp.com)
- Get Api Fariaz on [this website](https://rest.farzain.com)
- Get Api Genius on [this website](https://genius.com/developers)
- Get Api Itech on [this website](https://api.i-tech.id)
- Get Api Ocr on [this website](https://ocr.space/OCRAPI)
---

## Features
- ╔══✪〘 ‼️ اقراء قبل البدا ‼️ 〙✪
- ╠> .tnc atau .rules
- ╚> اقرأ وافهم قبل المتابعة

- ╔══✪〘 💬 معلومات البوت 💬 〙✪
- ╠> .donate atau .donasi
- ╠> .ping atau .speed
- ╠> .owner
- ╠> .stat
- ╚══✪

- ╔══✪〘 ⚙ اوامر التحويل ⚙ 〙✪
- ╠> .getimage atau .toimg
- ║   حوّل الملصقات إلى صور.
- ╠> .sticker atau .stiker atau .s
- ║   تحويل الصور / مقاطع الفيديو إلى ملصقات.
- ╠> .doctopdf atau .pdf
- ║   تحويل المستندات إلى pdf.
- ╠> .qrcode atau .qr
- ║   إنشاء QRcode من النص.
- ╠> .tts atau .say
- ║   تحويل النص إلى صوت جوجل.
- ╠> .shortlink
- ║   اختصار الروابط.
- ╠> .tomp3
- ║   تحويل الفيديو إلى صوت.
- ╠> .ssweb
- ║   لقطة من رابط الموقع.
- ╠> .flip
- ║   قلب الصورة أفقيًا / رأسيًا.
- ╚══✪

- ╔══✪〘 🧬 صانع 🧬 〙✪
- ╠> .ttp
- ║   نص للصورة (ملصقات)
- ╚══✪

- ╔══✪〘 📩 تنزيل 📩 〙✪
- ╠> .tiktokmp3 atau .ttmp3
- ║   قم بتنزيل الموسيقى من رابط Tiktok.
- ╠> .tiktok atau .tt
- ║   قم بتنزيل Tiktok بدون علامة مائية.
- ╠> .igstory
- ║   تنزيل الحالة من الانستقرام.
- ╠> .ytmp3
- ║   تحميل mp3 من رابط يوتيوب.
- ╠> .ytmp4
- ║   قم بتنزيل mp4 من رابط يوتيوب.
- ╠> .fbdl
- ║   قم بتنزيل الوسائط من رابط Facebook.
- ╠> .twdl
- ║   قم بتنزيل الوسائط من رابط Twitter.
- ╠> .igdl
- ║   قم بتنزيل الوسائط من رابط Instagram.
- ╚══✪

- ╔══✪〘 🔊 محول الصوتيات 🔊 〙✪
- ║   إضافة المؤثرات الصوتية إلى الصوت.
- ╠> .nightcore
- ╠> .deepslow
- ╠> .samarkan
- ╠> .vibrato
- ╠> .earrape
- ╠> .reverse
- ╠> .robot
- ╠> .8d
- ╠══✪
- ╠> .cf
- ║   مرشح مركب ffmpeg مخصص (Expert user only)
- ╚══✪





- ╔══✪〘 🔎 بحث 🔍 〙✪
- ╠> .gimages atau .gimg
- ║   البحث عن الصور من جوجل.
- ╠> .gsearch atau .gs
- ║   البحث عن لقطة شاشة من جوجل.
- ╠> .lirik
- ║   البحث عن كلمات الأغاني.
- ╠> .play
- ║   البحث عن الأغاني من يوتيوب.
- ╠> .yt
- ║   بحث يوتيوب.
- ╚══✪



- ╔══✪〘 🤬 مضادات 🤬 〙✪
- ║   المجموعات فقط. مكافحة الكلمات الوقحة.
- ╠> .antikasar
- ╠> .klasemen
- ╠> .reset
- ╚══✪

- ╔══✪〘 🤩 اوامر مهمه 🤩 〙✪
- ╠> .tagall atau .alle
- ║   اظهار جميع اعضاء القروب.
- ╠> .join atau .sewa
- ║   استأجر روبوتًا للانضمام إلى المجموعة في حالة توفر فتحة.
- ╠> .listonline
- ║   اظهار الاعضاء المتصلين حاليا .
- ╠> .remind
- ║   إعادة إرسال رسالة في الوقت المحدد.
- ╠> .list
- ║   قم بإنشاء قائمة أو قائمة مخزنة في الروبوت.
- ╠> .note
- ║   قم بإنشاء ملاحظة أو ملاحظات مخزنة في الروبوت.
- ╠> .bye
- ║   المجموعات فقط. أخرج الروبوت.
- ╠> .del
- ║   احذف رسائل الروبوت.
- ║
---

## Troubleshooting
Make sure all the necessary dependencies are installed: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

Fix Stuck on linux, install google chrome stable: 
```bash
> wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
> sudo apt install ./google-chrome-stable_current_amd64.deb
```

## Thanks to
- [Open-WA-Automate](https://github.com/open-wa/wa-automate-nodejs)
- [YogaSakti](https://github.com/YogaSakti/imageToSticker)
- [MhankBarBar](https://github.com/MhankBarBar/whatsapp-bot)
- [ArugaZ](https://github.com/ArugaZ/whatsapp-bot)
- [Aziz0404](https://github.com/nuraziz0404/botwa)
- [Gimenz](https://github.com/Gimenz)
