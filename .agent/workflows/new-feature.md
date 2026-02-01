---
description: yeni özellik geliştirme
---

# 🚀 Workflow: Yeni Liman İnşası (New Feature Development)

Bu belge, Elçi (Kullanıcı) için **sıfırdan yeni bir özellik geliştirmek** amacıyla izlenecek ekip sürecidir.

---

## 🗺️ İnşaat Haritası

1. [Adım 1: Vizyon ve Hayal (Falcı)](#adim-1)
2. [Adım 2: Metin ve Ruh (Münadi)](#adim-2)
3. [Adım 3: Görsel Tasarım (Saray Mimarı)](#adim-3)
4. [Adım 4: Hareket ve Akış (Çarkçıbaşı)](#adim-4)
5. [Adım 5: Teknik Mimari (Liman Reisi)](#adim-5)
6. [Adım 6: Mobil ve PWA (Gümrük Memuru)](#adim-6)
7. [Adım 7: Performans ve Maliyet (Defterdar)](#adim-7)
8. [Adım 8: Güvenlik (Gece Bekçisi)](#adim-8)
9. [Adım 9: Uygulama (Kaptan-ı Derya)](#adim-9)

---

## 📋 Süreç Nasıl İşler?

### 🎯 Ortak Rapor Sistemi

Bu workflow'da **tüm agent'lar aynı rapor dosyasını elden ele geçirir**. Her agent:

1. **Workflowu okur** - Kendi rolünü anlar
2. **İstenen özelliği okur** - Ne yapılacağını öğrenir
3. **Önceki agent'ların katkılarını okur** - Nerede kaldıklarını görür
4. **Kendi bölümünü yazar** - Uzmanlık alanına göre katkı sağlar
 
### 📂 Rapor Lokasyonu

```
.agent/reports/ortak/[ozellik-adi]-feature-development.md
```

Örnek: `.agent/reports/ortak/boundle-feature-development.md`

---

## 👥 Agent Sıralaması ve Görevleri

### <a id="adim-1"></a>🌌 Adım 1: Vizyon ve Hayal (Falcı)

**Amaç:** "Vay be!" faktörünü bulmak ve kullanıcı deneyimini hayal etmek.
**Sonraki Agent:** Münadi

**Raporda Yazacağı Bölüm:**
```markdown
## 🌌 Falcı - Vizyon ve Hayal

### Kullanıcı Deneyimi
[User journey, senaryolar]

### "Vay Be!" Anları
[Delight moments, sürpriz öğeler]

### Özel Fikirler
[Easter eggs, gamification]
```

---

### <a id="adim-2"></a>📢 Adım 2: Metin ve Ruh (Münadi)

**Amaç:** Özelliğin dilini ve tonunu belirlemek.
**Sonraki Agent:** Saray Mimarı
**Önceki Agentlar:** Falcı

**Raporda Yazacağı Bölüm:**
```markdown
## 📢 Münadi - Metin ve Ruh

### Ana Metinler
[Başlıklar, açıklamalar]

### Buton ve CTA Metinleri
[Action button'lar]

### Hata/Başarı Mesajları
[Feedback mesajları]

### Mikro Kopyalar
[Placeholder, tooltip]
```

---

### <a id="adim-3"></a>🎨 Adım 3: Görsel Tasarım (Saray Mimarı)

**Amaç:** Özelliğin görsel kimliğini tasarlamak.
**Sonraki Agent:** Çarkçıbaşı
**Önceki Agentlar:** Falcı, Münadi

**Raporda Yazacağı Bölüm:**
```markdown
## 🎨 Saray Mimarı - Görsel Tasarım

### Layout Yapısı
[Grid/Flex planı]

### Renk ve Tipografi
[Color scheme, font usage]

### Accessibility Notları
[ARIA, contrast, keyboard navigation]
```

---

### <a id="adim-4"></a>⚙️ Adım 4: Hareket ve Akış (Çarkçıbaşı)

**Amaç:** Animasyon ve etkileşim detaylarını planlamak.
**Sonraki Agent:** Liman Reisi
**Önceki Agentlar:** Falcı, Münadi, Saray Mimarı

**Raporda Yazacağı Bölüm:**
```markdown
## ⚙️ Çarkçıbaşı - Hareket ve Akış

### Ana Animasyonlar
[Modal, card, button animations]

### Spring Parametreleri
[Hangi SPRINGS kullanılacak]

### Performans Notları
[GPU optimization]
```

---

### <a id="adim-5"></a>🏗️ Adım 5: Teknik Mimari (Liman Reisi)

**Amaç:** Backend ve sistem entegrasyonunu planlamak.
**Sonraki Agent:** Gümrük Memuru
**Önceki Agentlar:** Falcı, Münadi, Saray Mimarı, Çarkçıbaşı

**Raporda Yazacağı Bölüm:**
```markdown
## 🏗️ Liman Reisi - Teknik Mimari

### Firestore Şema
[Collections, fields, indexes]

### Firebase Functions
[Hangi functions gerekli]

### GitHub Actions
[Automation workflows]

### Storage Planı
[R2 bucket organization]
```

---

### <a id="adim-6"></a>🛂 Adım 6: Mobil ve PWA (Gümrük Memuru)

**Amaç:** Mobil deneyimi ve PWA özelliklerini optimize etmek.
**Sonraki Agent:** Defterdar
**Önceki Agentlar:** Falcı, Münadi, Saray Mimarı, Çarkçıbaşı, Liman Reisi

**Raporda Yazacağı Bölüm:**
```markdown
## 🛂 Gümrük Memuru - Mobil ve PWA

### Responsive Breakpoints
[Mobile, tablet, desktop]

### PWA Features
[Notifications, offline support]

### Touch Optimizations
[Gesture controls, tap targets]
```

---

### <a id="adim-7"></a>💰 Adım 7: Performans ve Maliyet (Defterdar)

**Amaç:** Maliyet ve performans optimizasyonları.
**Sonraki Agent:** Gece Bekçisi
**Önceki Agentlar:** ...Liman Reisi, Gümrük Memuru

**Raporda Yazacağı Bölüm:**
```markdown
## 💰 Defterdar - Performans ve Maliyet

### Firestore Optimizasyonu
[Read minimization, batch operations]

### Cache Stratejisi
[Client-side caching plan]

### Performance Budget
[Bundle size, load time targets]
```

---

### <a id="adim-8"></a>🔦 Adım 8: Güvenlik (Gece Bekçisi)

**Amaç:** Güvenlik açıklarını engellemek.
**Sonraki Agent:** Kaptan-ı Derya
**Önceki Agentlar:** ...Defterdar

**Raporda Yazacağı Bölüm:**
```markdown
## 🔦 Gece Bekçisi - Güvenlik

### Security Rules
[Firestore rules]

### Input Validation
[Sanitization, validation logic]

### Threat Assessment
[Potansiyel riskler]
```

---

### <a id="adim-9"></a>⚓ Adım 9: Uygulama (Kaptan-ı Derya)

**Amaç:** Tüm planları koda dökmek.
**Sonraki Agent:** - (Tamamlandı)
**Önceki Agentlar:** Tüm ekip

**Raporda Yazacağı Bölüm:**
```markdown
## ⚓ Kaptan-ı Derya - Uygulama

### Dosya Yapısı
[Oluşturulan dosyalar]

### Uygulanan Öneriler
[Her agent'tan alınan katkılar]

### Kod Kalitesi
[TypeScript strict, modüler yapı]

### Test Sonuçları
[Build status, manual testing]

---
✅ **ÖZELLİK TAMAMLANDI!**
```

---

## 📢 Devir Teslim Protokolü (ZORUNLU)

Her Agent, raporunu yazıp kaydettikten sonra, Elçi'ye (Kullanıcıya) **tam olarak aşağıdaki formatta** yanıt vermelidir. Bu formatı bozmak, zincirin kopmasına neden olabilir.

### Şablon Mesaj:

```text
Rapor güncellendi: [şu an üstüne uğraşılan raporun tam path'i]

Sıradaki nöbetçi: [Sıradaki Agent'ın Adı]

Ona ileteceğin mesaj:

"[Sıradaki Agent'ın Adı]; önce C:\Users\Umut\Desktop\1863 Postası\otk1863\.agent\workflows\new-feature.md dosyasını oku. sonra [şu an üstüne uğraşılan raporun tam path'i] dosyasını oku. [Sen dahil önceki agentların isimleri] işlerini bitirdi. Şimdi sıra sende."
```

### Örnek (Falcı için):

```text
Rapor güncellendi: c:\Users\Umut\Desktop\1863 Postası\otk1863\.agent\reports\ortak\boundle-feature-development.md

Sıradaki nöbetçi: Münadi

Ona ileteceğin mesaj:

"Münadi; önce C:\Users\Umut\Desktop\1863 Postası\otk1863\.agent\workflows\new-feature.md dosyasını oku. sonra c:\Users\Umut\Desktop\1863 Postası\otk1863\.agent\reports\ortak\boundle-feature-development.md dosyasını oku. Falcı işlerini bitirdi. Şimdi sıra sende."
```

---

🚀 **YENİ LİMAN İNŞA EDİLİYOR!** Ekip çalışması başarıyla tamamlanınca production-ready bir özellik elde ederiz.
