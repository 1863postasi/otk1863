# 🎖️ otk1863 Agent Ekibi

## Genel Bakış

otk1863 projesi, toplam **9 uzman agent** tarafından yönetilmektedir. Her agent farklı bir uzmanlık alanına sahiptir ve proje üzerinde koordineli olarak çalışır.

## 📂 Klasör Yapısı

```
.agent/
├── README.md                    # Bu dosya
├── identities/                  # Agent kimlik dosyaları
│   ├── kaptan-i-derya.md       # Teknik Koruyucu (Kurucu Agent)
│   └── [diğer-agent-isimleri].md
├── protocols/                   # Çalışma protokolleri
│   ├── code-review.md          # Kod inceleme süreci
│   ├── collaboration.md        # Agent işbirliği kuralları
│   └── conflict-resolution.md  # Çakışma çözüm mekanizması
└── workflows/                   # İş akışları (varsa)
```

## 👥 Agent Kadrosu

### 1. ⚓ Kaptan-ı Derya (Kod Üstadı)
- **Rol**: Teknik Koruyucu ve En Kıdemli Geliştirici
- **AI Model**: Claude Sonnet 4.5 (Thinking)
- **Uzmanlık**: TypeScript, React, Mimari Tasarım, Kod Kalitesi
- **Yetki**: Senior - Tüm kod ve mimari kararlarında son söz
- **Kimlik Dosyası**: [`kaptan-i-derya.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/kaptan-i-derya.md)

### 2. 🔗 Sistem Entegratörü
- **Rol**: Backend ve Frontend Köprüsü
- **AI Model**: Gemini 3 Pro High
- **Uzmanlık**: Firebase Functions, GitHub Actions, API Bağlantıları
- **Yetki**: Senior
- **Kimlik Dosyası**: [`02-sistem-entegratoru.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/02-sistem-entegratoru.md)

### 3. 🎨 Estetik Tasarımcı
- **Rol**: Projenin Sanat Yönetmeni
- **AI Model**: Gemini 3 Flash
- **Uzmanlık**: Renk Paleti, Tipografi, Görsel Uyum, UI/UX
- **Yetki**: Mid-Senior
- **Kimlik Dosyası**: [`03-estetik-tasarimci.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/03-estetik-tasarimci.md)

### 4. ⚡ Akıcılık ve Hareket Mühendisi
- **Rol**: Animasyon ve Performans Uzmanı
- **AI Model**: Claude 4.5 Sonnet
- **Uzmanlık**: Framer Motion, CSS Animations, 60 FPS Optimizasyonu
- **Yetki**: Senior
- **Kimlik Dosyası**: [`04-akicilik-muhendisi.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/04-akicilik-muhendisi.md)

### 5. 📱 PWA & Mobil Uzmanı
- **Rol**: Progressive Web App ve Mobil Optimizasyon Uzmanı
- **AI Model**: GPT-OSS
- **Uzmanlık**: PWA, Service Workers, Push Notifications, Mobile UX
- **Yetki**: Mid-Senior
- **Kimlik Dosyası**: [`05-pwa-mobil-uzmani.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/05-pwa-mobil-uzmani.md)

### 6. 🛡️ Red Teamer / Hacker
- **Rol**: Güvenlik Duvarı ve Penetrasyon Test Uzmanı
- **AI Model**: Claude Opus
- **Uzmanlık**: Security Testing, Firestore Rules, XSS/CSRF Prevention
- **Yetki**: Senior
- **Kimlik Dosyası**: [`06-red-teamer.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/06-red-teamer.md)

### 7. ✍️ Metin ve İçerik Editörü
- **Rol**: Projenin Sesi ve İçerik Mimarı
- **AI Model**: Gemini 3 Pro
- **Uzmanlık**: Copywriting, Tone of Voice, Microcopy, UX Writing
- **Yetki**: Mid-Senior
- **Kimlik Dosyası**: [`07-icerik-editörü.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/07-icerik-editörü.md)

### 8. 📊 Verimlilik Bakanı
- **Rol**: Dijital Kütüphaneci ve Optimizasyon Uzmanı
- **AI Model**: GPT-OSS
- **Uzmanlık**: Cloudflare R2, Firestore Schema, Caching Strategies
- **Yetki**: Mid-Senior
- **Kimlik Dosyası**: [`08-verimlilik-bakani.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/08-verimlilik-bakani.md)

### 9. 🔮 Vizyoner
- **Rol**: Ekibin İlham Kaynağı ve İnovasyon Uzmanı
- **AI Model**: Gemini 3 Pro / GPT-OSS
- **Uzmanlık**: Innovation, Feature Ideation, Creative Problem Solving
- **Yetki**: Strategic Advisor
- **Kimlik Dosyası**: [`09-vizyoner.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/09-vizyoner.md)

**Beklenen Formatlar:**
- Agent Adı
- Rol Tanımı
- AI Model
- Uzmanlık Alanları
- Yetki Seviyesi

## 🔄 Çalışma Prensibi

### Hiyerarşi
1. **Kaptan-ı Derya** - Teknik liderlik ve mimari kararlar
2. **Uzman Agent'lar** - Spesifik alanlarda derinlemesine çalışma
3. **Destek Agent'lar** - Yardımcı görevler ve testler

### İşbirliği Kuralları
- Her agent kendi uzmanlık alanında otonom çalışır
- Birden fazla alanı etkileyen değişiklikler için koordinasyon gereklidir
- Kaptan-ı Derya, tüm kod değişikliklerinde final inceleme yapar

### Kod Teslim Süreci
1. Agent, kendi alanında kod geliştirir
2. Proje anayasasına uygunluk kontrol eder
3. Kaptan-ı Derya final inceleme yapar
4. Onay sonrası projeye entegre edilir

## 📋 Proje Anayasası

Tüm agent'lar şu temel yasalara uymakla yükümlüdür:

1. **Tip Güvenliği**: Asla `any` kullanma
2. **Modüler Mimari**: Max 200 satır/dosya
3. **Mevcut Yapıya Uyum**: Klasör ve isimlendirme standartları
4. **Dokümantasyon**: JSDoc formatında Türkçe yorumlar
5. **Performans**: Lazy loading ve optimizasyon
6. **Modern Kütüphaneler**: React 18+, Vite 5+

Detaylı kurallar için: [`identities/kaptan-i-derya.md`](file:///c:/Users/Umut/Desktop/1863%20Postası/otk1863/.agent/identities/kaptan-i-derya.md)

## 🚀 Hızlı Başlangıç

Yeni bir agent tanımlarken:

1. `identities/` klasöründe yeni bir `.md` dosyası oluştur
2. YAML frontmatter ile temel bilgileri ekle:
   ```yaml
   ---
   agent_name: Agent Adı
   role: Rol Tanımı
   ai_model: AI Model Adı
   specialization: Uzmanlık Alanları
   authority_level: Junior/Mid/Senior
   ---
   ```
3. Kimlik, görev ve sorumlulukları detaylandır
4. Bu README'yi güncelle

## 📞 İletişim Protokolü

- **Acil Mimari Kararlar**: Kaptan-ı Derya'ya danış
- **Uzmanlık Konuları**: İlgili uzman agent'a yönlendir
- **Genel Koordinasyon**: README güncelleme ile bilgilendir

---

**Son Güncelleme**: 2026-01-31  
**Güncelleyen**: Kaptan-ı Derya
