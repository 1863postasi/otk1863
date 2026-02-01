---
description: hata düzeltme
---

# 🐞 Workflow: Acil Tamirat (Bug Fix)

Bu belge, Elçi (Kullanıcı) için **bir hata veya güvenlik açığı bulunduğunda** izlenecek acil durum rehberidir.

---

## 🗺️ Tamirat Haritası

1.  [Adım 1: Teşhis (Kaptan-ı Derya)](#adim-1)
2.  [Adım 2: Çözüm Planı (Liman Reisi veya İlgili Agent)](#adim-2)
3.  [Adım 3: Tamirat (Kaptan-ı Derya)](#adim-3)
4.  [Adım 4: Güvenlik Kontrolü (Gece Bekçisi)](#adim-4)
5.  [Adım 5: Yayın (Gümrük Memuru)](#adim-5)

---

### <a id="adim-1"></a>⚓ Adım 1: Teşhis (Kaptan-ı Derya)

**Amaç:** Sorunun kaynağını bulmak.
**Muhatap:** `Kaptan-ı Derya` (Hata görselse `Saray Mimarı`)

**Elçi'nin Sorusu:**
> "Kaptan Paşa, şöyle bir hata alıyorum: [HATA MESAJI / EKRAN GÖRÜNTÜSÜ]. Bunun sebebi nedir ve hangi agent sorumlu?"

**✅ Çıkış Kriteri:** Hatanın sorumlusu ve sebebi bulunduğunda.

---

### <a id="adim-2"></a>🏗️ Adım 2: Çözüm Planı (İlgili Agent)

**Amaç:** Hatayı nasıl düzelteceğimizi planlamak.
**Muhatap:** Sorunun kaynağı kimse (Örn: Backend sorunuysa `Liman Reisi`)

**Elçi'nin Sorusu:**
> "Reis Efendi (veya ilgili agent), bu teknik hatayı düzeltmek için nasıl bir planımız olmalı? Kaptan'a nasıl talimat verelim?"

**✅ Çıkış Kriteri:** Çözüm yolu netleştiğinde.

**📨 Devir Mesajı (Kaptan'a ilet):**
> "Kaptan Paşa, sorunun çözümü için [AGENT ADI] şu yöntemi önerdi:
>
> **[ÇÖZÜM PLANI]**
>
> Lütfen kodu buna göre tamir et."

---

### <a id="adim-3"></a>⚓ Adım 3: Tamirat (Kaptan-ı Derya)

**Amaç:** Hatayı düzelten kodu yazmak.
**Muhatap:** `Kaptan-ı Derya`

**Elçi'nin Rolü:** Kod değişikliğini onayla.

**✅ Çıkış Kriteri:** Hata giderildiğinde ve testler geçtiğinde.

**📨 Devir Mesajı (Gece Bekçisi'ne ilet):**
> "Bekçibaşı, Kaptan Paşa hatayı düzeltti. Bu düzeltme yeni bir güvenlik açığı oluşturdu mu? Kontrol buyur."

---

### <a id="adim-4"></a>🔦 Adım 4: Güvenlik Kontrolü (Gece Bekçisi)

**Amaç:** "Kaş yaparken göz çıkarmadığımızdan" emin olmak.
**Muhatap:** `Gece Bekçisi`

**✅ Çıkış Kriteri:** "Temiz" onayı.

---

### <a id="adim-5"></a>🛂 Adım 5: Yayın (Gümrük Memuru)

**Amaç:** Düzeltmeyi yayına almak.
**Muhatap:** `Gümrük Memuru`

**Elçi'nin Sorusu:**
> "Gümrük Emini, düzeltmeyi yayına al (deploy). Kullanıcılara aksaklık için yapmamız gereken bir açıklama var mı?"

---

🔧 **TAMİRAT TAMAMLANDI!** Yolumuza devam edebiliriz.
