/**
 * Boundle Fortune System
 * Shared pool of fortunes for all Boundle mini-games.
 */

export const FORTUNES = [
    // Klasikler
    "Bugün yemekhanede sıra beklemeden yemek alacaksın (belki).",
    "Kütüphanede aradığın o boş priz bugün seni bekliyor.",
    "Kuzey rüzgarı sert, hırkanı almadan çıkma.",
    "Dikkat et, çimlerin sulanma saati yaklaşıyor.",
    "Bugün karşına çıkan ilk kediye selam ver, şans getirecek.",
    "Superdorm yokuşunu çıkarken nefesin kesilmeyecek, formundasın.",
    "Bugün Boğaz manzarasına karşı içeceğin çay her zamankinden lezzetli olacak.",
    "Derste en arka sırayı kapmak senin kaderinde var.",
    "Beklediğin shuttle tam sen durağa gelince kalkacak, koş yetiş!",
    "Çantana dikkat et, kediler bugün biraz meraklı.",
    "Albert Long Hall saatini bugün ilk defa doğru duyacaksın.",

    // Akademik & Kampüs
    "Vize haftası yaklaşıyor, notlarını toparlamaya başlasan iyi olur.",
    "Manzara'da içeceğin kahve sana ilham perisi olarak geri dönecek.",
    "Bugün Güney Kampüs'te yürürken tanıdık kimseyi görmeyeceksin, bu bir mucize!",
    "Kediler bugün seni seçti, kantinde yanına oturacaklar.",
    "Ders kaydında istediğin dersin kontenjanı senin için 1 kişi artacak (hadi inşallah).",
    "Metro çıkışı rüzgarın yönü bugün senden yana.",
    "Hisar Kampüs'te kaybolmayacağın bir gün seni bekliyor.",
    "Petek'te boş masa bulacaksın, sakın bu şansı harcama.",
    "Hocan bugün mailine 5 dakika içinde cevap verecek.",
    "Bu hafta sunum yaparken projeksiyon bozulmayacak.",

    // Eğlenceli & Absürt
    "Martılar bugün simitine göz dikmedi, saygı duyuyorlar.",
    "Boğaziçi'nin gizli tünellerini bulma ihtimalin %0.1 ama umut fakirin ekmeği.",
    "Bugün çimlerde yuvarlanmak için mükemmel bir gün.",
    "Sarıtepe Kampüsü'ne gitmek zorunda kalmayacaksın.",
    "Shuttle kuyruğunda önündeki kişi sana yer verecek (rüya görmüyorsun).",
    "Study'de uyuyakalırken kimse fotoğrafını çekmeyecek.",
    "Bebek Kapı'dan çıkarken güvenlik sana gülümseyecek.",
    "Güney yokuşunu koşarak çıkabilecek enerjiyi kendinde bulacaksın.",
    "Bugün kampüs köpekleri sana havlamak yerine kuyruk sallayacak.",
    "Çatı'da yediğin tostun kaşarı bu sefer gerçekten erimiş olacak."
];

/**
 * Returns a random fortune from the pool.
 */
export const getRandomFortune = (): string => {
    return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
};
