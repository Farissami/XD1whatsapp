/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-05-31 22:33:11
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Modified time: 2021-08-02 17:58:32
 * @ Description: Menu
 */

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

const textTnC = () => {
    return `
القوانين

 📌 *يمنع ارسال كلمات مسيئة* 
 📌 *يمنع إزعاج الأعضاء أو التنمر عليهم*
 📌 *يجب إحترام خصوصية الأعضاء وعدم مضايقتهم أو إحراجهم* 
 📌 *ممنوع نشر الصور المقززة والمخلة بالآداب أو ما شابه* 
 📌 *ممنوع عمل ترويج لقروب آخر  بالعام* 
 📌 *القروب غير مسؤول عن المشاكل الشخصية ، يرجى تصفيتها خارج القروبات*
 📌 *ممنوع دخول القروب بصورة أو إسم غير لائق*`
}

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

const textMenu = (pushname, t, prefix) => {
    let m = (namaMenu) => `*${prefix}${namaMenu}*`
    let n = (new Date(t * 1000)).getHours()
    let ucapan = ''
    if (3 < n && n <= 9) ucapan = `*صباح الخير 🌤️*`
    else if (9 < n && n <= 14) ucapan = `*مساء الخير ☀️*`
    else if (14 < n && n <= 18) ucapan = `*مساء الخير 🌻*`
    else ucapan = `*مساء الخير 💤*`
    return `
Halo, ${pushname}!
${ucapan} 👋️
اسمحوا لي أن أقدم نفسي ، أنا
${q3}Bot XD1 ${q3}

فيما يلي بعض الميزات الموجودة في هذا الروبوت!✨
${readMore}
ملحوظات:

بجانب ${q3}(/)${q3} سيستجيب الروبوت أيضًا للرموز التالية:
${q3}\\ / ! $ ^ % & + . , -${q3}

تشغيل الآلة الحاسبة باستخدام البادئة (=)
(cth: =10+2+4)

╔══✪〘 ‼️ اقراء قبل البدا ‼️ 〙✪
╠> ${m('tnc')} atau ${m('rules')}
╚> اقرأ وافهم قبل المتابعة

╔══✪〘 💬 معلومات البوت 💬 〙✪
╠> ${m('donate')} atau ${m('donasi')}
╠> ${m('ping')} atau ${m('speed')}
╠> ${m('owner')}
╠> ${m('stat')}
╚══✪

╔══✪〘 ⚙ اوامر التحويل ⚙ 〙✪
╠> ${m('getimage')} atau ${m('toimg')}
║   حوّل الملصقات إلى صور.
╠> ${m('sticker')} atau ${m('stiker')} atau ${m('s')}
║   تحويل الصور / مقاطع الفيديو إلى ملصقات.
╠> ${m('doctopdf')} atau ${m('pdf')}
║   تحويل المستندات إلى pdf.
╠> ${m('qrcode')} atau ${m('qr')}
║   إنشاء QRcode من النص.
╠> ${m('tts')} atau ${m('say')}
║   تحويل النص إلى صوت جوجل.
╠> ${m('shortlink')}
║   اختصار الروابط.
╠> ${m('tomp3')}
║   تحويل الفيديو إلى صوت.
╠> ${m('ssweb')}
║   لقطة من رابط الموقع.
╠> ${m('flip')}
║   قلب الصورة أفقيًا / رأسيًا.
╚══✪

╔══✪〘 🧬 صانع 🧬 〙✪
╠> ${m('ttp')}
║   نص للصورة (ملصقات)
╚══✪

╔══✪〘 📩 تنزيل 📩 〙✪
╠> ${m('tiktokmp3')} atau ${m('ttmp3')}
║   قم بتنزيل الموسيقى من رابط Tiktok.
╠> ${m('tiktok')} atau ${m('tt')}
║   قم بتنزيل Tiktok بدون علامة مائية.
╠> ${m('igstory')}
║   تنزيل الحالة من الانستقرام.
╠> ${m('ytmp3')}
║   تحميل mp3 من رابط يوتيوب.
╠> ${m('ytmp4')}
║   قم بتنزيل mp4 من رابط يوتيوب.
╠> ${m('fbdl')}
║   قم بتنزيل الوسائط من رابط Facebook.
╠> ${m('twdl')}
║   قم بتنزيل الوسائط من رابط Twitter.
╠> ${m('igdl')}
║   قم بتنزيل الوسائط من رابط Instagram.
╚══✪

╔══✪〘 🔊 محول الصوتيات 🔊 〙✪
║   إضافة المؤثرات الصوتية إلى الصوت.
╠> ${m('nightcore')}
╠> ${m('deepslow')}
╠> ${m('samarkan')}
╠> ${m('vibrato')}
╠> ${m('earrape')}
╠> ${m('reverse')}
╠> ${m('robot')}
╠> ${m('8d')}
╠══✪
╠> ${m('cf')}
║   مرشح مركب ffmpeg مخصص (Expert user only)
╚══✪





╔══✪〘 🔎 بحث 🔍 〙✪
╠> ${m('gimages')} atau ${m('gimg')}
║   البحث عن الصور من جوجل.
╠> ${m('gsearch')} atau ${m('gs')}
║   البحث عن لقطة شاشة من جوجل.
╠> ${m('lirik')}
║   البحث عن كلمات الأغاني.
╠> ${m('play')}
║   البحث عن الأغاني من يوتيوب.
╠> ${m('yt')}
║   بحث يوتيوب.
╚══✪



╔══✪〘 🤬 مضادات 🤬 〙✪
║   المجموعات فقط. مكافحة الكلمات الوقحة.
╠> ${m('antikasar')}
╠> ${m('klasemen')}
╠> ${m('reset')}
╚══✪

╔══✪〘 🤩 اوامر مهمه 🤩 〙✪
╠> ${m('tagall')} atau ${m('alle')}
║   اظهار جميع اعضاء القروب.
╠> ${m('join')} atau ${m('sewa')}
║   استأجر روبوتًا للانضمام إلى المجموعة في حالة توفر فتحة.
╠> ${m('listonline')}
║   اظهار الاعضاء المتصلين حاليا .
╠> ${m('remind')}
║   إعادة إرسال رسالة في الوقت المحدد.
╠> ${m('list')}
║   قم بإنشاء قائمة أو قائمة مخزنة في الروبوت.
╠> ${m('note')}
║   قم بإنشاء ملاحظة أو ملاحظات مخزنة في الروبوت.
╠> ${m('bye')}
║   المجموعات فقط. أخرج الروبوت.
╠> ${m('del')}
║   احذف رسائل الروبوت.
║
╚══✪〘 *FooryBot* 〙✪





✨`
}

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

const textAdmin = (prefix) => {
    let m = (namaMenu) => `*${prefix}${namaMenu}*`
    return `
⚠ [ *مسؤول المجموعة فقط* ] ⚠ 
فيما يلي ميزات إدارة المجموعة في هذا الروبوت!

╔══✪〘 فقط للادمن 〙✪
╠> ${m('groupstats')}
║   تحقق من حالة إعدادات المجموعة
╠> ${m('mutegroup')} atau ${m('group')} buka/tutup
║   يمنع الجميع من المشاركه ما عدا المسوؤلين
╠> ${m('enablebot')} atau ${m('disablebot')}
║   تشغيل أو إيقاف تشغيل البوت.
╠> ${m('antilinkgroup')} on/off
║   اي شخص يرسل رابط  يقوم البوت بطرده
╠> ${m('antikk')} on/off
║   طرد اي شخص يقول كلمة ممنوعة 
╠> ${m('antilink')} on/off
║   في حال قم شخص بوضع رابط يقوم البوت بطردة تلقائي
╠> ${m('antivirtex')} on/off
║   طرد تلقائي للرسائل الطويلة
╠> ${m('antidelete')} on/off
║   منع حذف الرسائل في المجموعة
╠> ${m('welcome')} on/off
║   ترحيب الأعضاء الجدد الانضمام
╠> ${m('setprofile')}
║   تغيير صورة المجموعة
╠> ${m('setname')}
║   تغيير اسم المجموعة
╠> ${m('grouplink')}
║   للحصول على رابط المجموعة
╠> ${m('promote')}
║   اعطاء شخص ادمن
╠> ${m('demote')}
║   ازالة رتبت الادمن من شخص
╠> ${m('revoke')}
║   اعادة تعيين رابط للمجموعة
╠> ${m('kick')}
║   طرد الاعضاء
╠> ${m('add')}
║   إضافة عضو
║
║ (غالبًا ما تحتوي ميزة الترحيب على أخطاء ، فمن الأفضل عدم القيام بذلك)
║
╚═〘 *FooryBot* 〙
`
}

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

const textOwner = (prefix) => {
    let m = (namaMenu) => `*${prefix}${namaMenu}*`
    return `
⚠ [ *المالك فقط* ] ⚠ 
فيما يلي ميزات المالك في هذا الروبوت!

╔══✪〘 المالك فقط 〙✪
╠> ${m('addkk')}
║   اضافة كلمات مسيئة للحذف.
╠> ${m('restart')}
║   إعادة تشغيل خادم الروبوت.
╠> ${m('listgroup')}
║   اظهار جميع السيرفرات التي فيها البوت
╠> ${m('listsewa')}
║   إرجاع كل قائمة المجموعة
╠> ${m('ban')}
║   حظر المستخدم.
╠> ${m('unban')}
║   إلغاء حظر المستخدم.
╠> ${m('bc')}
║   رسالة جماعية بالخاص.
╠> ${m('bcgroup')}
║   رسالة جماعية للقروبات.
╠> ${m('leaveall')}
║  مغادرة جميع القروبات
╠> ${m('clearexitedgroup')}
║   احذف مجموعة الدردشة التي غادرت.
╠> ${m('deleteall')}
║   احذف جميع الدردشات بما في ذلك المجموعات دون مغادرة المجموعة.
╠> ${m('clearall')}
║   مسح جميع الدردشات دون حذف الدردشات.
╠> ${m('cleanchat')}
║   محاكاة تنظيف جميع المحادثات مثل الساعة 01:01
╠> ${m('unblock')} atau ${m('u')}
║   إلغاء حظر عن مستخدم.
╠> ${m('getinfo')}
║   احصل على معلومات من رابط المجموعة.
╠> ${m('getstory')}
║   احصل على قصة شخص.
╠> ${m('addprem')}
║   إضافة مجموعة إلى قسط.
╠> _>_
║   Eval.
╠> _$_
║   Shell.
║
╚═〘 *FooryBot* 〙
`
}

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

const textDonasi = () => {
    return `
مرحبًا ، شكرًا لك على استخدام هذا الروبوت ، لدعم هذا الروبوت يمكنك المساعدة من خلال التبرع عن طريق:


payPal : paypal.me/Foory33



أي مبلغ سيساعد حقًا في تطوير هذا الروبوت.
شكرا لك. 
Faris`
}

export default {
    textTnC,
    textMenu,
    textOwner,
    textAdmin,
    textDonasi
}