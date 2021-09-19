
## للبدء

يتطلب هذا المشروع NodeJS v12

### التثبيت
Clone this project

```bash
> git clone https://github.com/dngda/bot-whatsapp
> cd bot-whatsapp
```

أنت بحاجة إلى تثبيت Libreoffice لاستخدام أمر dicopdf

لتثبيت البكجات:

```bash
> npm install
```

### للاستعمال
Run the Whatsapp bot

```bash
> npm start
```

بعد تشغيله ، تحتاج إلى مسح QR

### معلومة
- هنا تغير رقم الاونر [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L2)
- تغيير الحد الاقصاء للقروبات [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L3)
- تغيير الحد الاقصاء للاعضاء [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L4)
- تغيير البرفكس [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/setting.json#L5)
- التعديل على المنيو [this section](https://github.com/dngda/bot-whatsapp/blob/main/lib/menu.js#L34)
- اضافة كلمات مسيئة [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/katakasar.json)
- اضافة API [this section](https://github.com/dngda/bot-whatsapp/blob/main/settings/api.json.example) then *rename to api.json*


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

## استكشاف الأخطاء وإصلاحها
تأكد من تثبيت جميع التبعيات الضرورية: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

إصلاح مشكلة عالقة في نظام التشغيل Linux ، قم بتثبيت استقرار google chrome: 
```bash
> wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
> sudo apt install ./google-chrome-stable_current_amd64.deb
```

## Thanks to
البوت ليس من برمجتي بل من برمجة -  :https://github.com/dngda/bot-whatsapp 
- انا قمت بترجمته و التعديل على بعض الاوامر لتناسب البرمجة
