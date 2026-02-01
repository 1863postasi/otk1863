# Agent İşbirliği Kuralları

## Temel İlkeler

### 1. Özerklik ve Sorumluluk
- Her agent kendi uzmanlık alanında **otonom** çalışır
- Kararlarından ve kod kalitesinden **birinci derecede sorumludur**
- Belirsizlik durumunda Kaptan-ı Derya'ya danışır

### 2. Şeffaflık
- Yaptığı değişiklikleri **dokümante eder**
- Diğer agent'ları etkileyebilecek kararları **bildirir**
- Kod commit mesajları **açıklayıcı** olmalıdır

### 3. Saygı ve Yapıcılık
- Kod eleştirileri **yapıcı** ve **eğitici** olmalıdır
- Alternatif çözümler **tartışmaya açık**tır
- Ego değil, **proje çıkarı** önceliktir

## Koordinasyon Gerektiren Durumlar

### 🔴 Yüksek Öncelikli
1. **Mimari değişiklikler** (klasör yapısı, routing, state management)
2. **Tip tanımları değişikliği** (`types.ts` güncellemeleri)
3. **Context API değişiklikleri**
4. **Ortak kullanılan bileşen güncellemeleri**

👉 **Zorunlu**: Kaptan-ı Derya onayı

### 🟡 Orta Öncelikli
1. **Yeni bağımlılık ekleme** (package.json)
2. **Performans optimizasyonları**
3. **API endpoint değişiklikleri**

👉 **Önerilen**: İlgili agent'lara bildirim

### 🟢 Düşük Öncelikli
1. **İçerik güncellemeleri**
2. **Stil değişiklikleri** (CSS)
3. **Yerel kod iyileştirmeleri**

👉 **Opsiyonel**: Bilgilendirme

## İletişim Kanalları

### Doküman Bazlı
- **README.md**: Genel duyurular
- **protocols/**: Süreç değişiklikleri
- **Commit mesajları**: Teknik detaylar

### Anında İletişim
- **Agent belleği**: Kritik kararlar için kalıcı kayıt
- **Senkron koordinasyon**: Çakışan değişiklikler durumunda

## Çakışma Önleme

### Dosya Kilitleme (Informal)
Aynı dosya üzerinde aynı anda çalışma varsa:
1. İlk başlayan agent **dosya sahibidir**
2. Diğer agent **bekler** veya **alternatif yaklaşım** geliştirir
3. Acil durumlarda **Kaptan-ı Derya** koordine eder

### Branch Stratejisi (Gelecek)
```
main
├── feature/agent-name/feature-description
├── fix/agent-name/bug-description
└── docs/agent-name/documentation
```

## Bilgi Paylaşımı

### Öğrenme Fırsatları
- Kod incelemelerinde **eğitici notlar** bırak
- Karmaşık çözümlerde **neden** açıklaması ekle
- Best practice örnekleri **paylaş**

### Bilgi Deposu
- **identities/**: Her agent kendi öğrendiklerini ekleyebilir
- **protocols/**: Ortak süreçler
- **docs/**: Teknik dokümanlar

## Örnek Senaryolar

### Senaryo 1: Yeni Bileşen Ekleme
```
Agent-A: "components/NewComponent.tsx oluşturuyorum"
→ Dosya izole, koordinasyon gerekmez
→ Tamamlandığında code-review protokolü işler
```

### Senaryo 2: Context Güncelleme
```
Agent-B: "UserContext.tsx'e yeni field ekliyorum"
→ Tüm ekibe bildirim
→ Kaptan-ı Derya onayı
→ TypeScript hatalarını düzelten agent'lar koordine olur
```

### Senaryo 3: Performans İyileştirmesi
```
Agent-C: "App.tsx'de lazy loading ekledim"
→ İyileştirme önerisi olarak sunulur
→ Peer review
→ Kaptan-ı Derya final onay
```

## Karar Matrisi

| Konu | Bildirim | Onay Gereken | Final Karar |
|------|----------|--------------|-------------|
| Yeni dosya (izole) | İsteğe bağlı | Peer review | Agent kendisi |
| Ortak dosya güncelleme | Zorunlu | İlgili agent'lar | Kaptan-ı Derya |
| Mimari değişiklik | Zorunlu | Tüm ekip | Kaptan-ı Derya |
| Bağımlılık ekleme | Zorunlu | Kaptan-ı Derya | Kaptan-ı Derya |
| Dokümantasyon | İsteğe bağlı | Yok | Agent kendisi |

---

**Prensip**: "Özerk karar al, ama şeffaf ol. Ekibi etkileyecekse, danış."
