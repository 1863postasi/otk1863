# Kod İnceleme Protokolü

## Amaç
Agent'lar arası kod incelemesi ve kalite kontrol sürecini tanımlar.

## İnceleme Kriterleri

### 1. Tip Güvenliği
- [ ] `any` kullanımı yok
- [ ] Tüm fonksiyon parametreleri tiplendirilmiş
- [ ] Return type'lar açıkça belirtilmiş
- [ ] Interface/Type tanımları `types.ts`'de merkezi

### 2. Modüler Yapı
- [ ] Dosya boyutu 200 satırı geçmiyor
- [ ] Single Responsibility prensibi uygulanmış
- [ ] Tekrar eden kod yok (DRY)
- [ ] Bağımlılıklar minimal

### 3. Performans
- [ ] Lazy loading uygulanmış
- [ ] Gereksiz re-render yok
- [ ] Memoization gerekli yerlerde kullanılmış
- [ ] Bundle size optimize

### 4. Dokümantasyon
- [ ] JSDoc formatında Türkçe yorumlar
- [ ] Karmaşık mantık açıklanmış
- [ ] "Neden" sorusuna cevap verilmiş

### 5. Standartlara Uyum
- [ ] Klasör yapısına uygun yerleştirilmiş
- [ ] İsimlendirme standartları (PascalCase/camelCase)
- [ ] Context kullanımı doğru
- [ ] Mevcut patterns takip edilmiş

## İnceleme Süreci

### Adım 1: Otomatik Kontrol
```bash
# TypeScript kontrolü
npm run type-check

# Linting
npm run lint

# Build kontrolü
npm run build
```

### Adım 2: Manuel İnceleme
1. Yukarıdaki kriterleri tek tek kontrol et
2. Kod okunabilirliğini değerlendir
3. Potansiyel bug'ları tespit et
4. Alternatif çözümler sun

### Adım 3: Geri Bildirim
- ✅ **Onay**: Tüm kriterler sağlanmışsa
- 🔄 **Revizyon**: Küçük düzeltmeler gerekiyorsa
- ❌ **Red**: Temel prensipler ihlal edilmişse

## Sorumluluklar

- **Yazılım Sahibi Agent**: Kendi kodunu ilk kontrol eder
- **Peer Agent**: İlgili alandaki diğer uzman inceler
- **Kaptan-ı Derya**: Final onay verir

## Geri Bildirim Formatı

```markdown
## İnceleme Raporu
**Dosya**: [dosya-adı]
**İnceleyen**: [agent-adı]
**Tarih**: [tarih]

### Olumlu Yönler
- ...

### İyileştirme Önerileri
- ...

### Kritik Sorunlar
- ...

### Karar
- [ ] Onaylandı
- [ ] Revizyon Gerekli
- [ ] Reddedildi
```
