---
trigger: always_on
---

# OTK1863 Workspace Coding Rules & Guidelines

Bu workspace'te çalışan tüm Yapay Zeka (AI) asistanları ve geliştiriciler aşağıdaki kurallara **kesinlikle** uymalıdır.

> [!CRITICAL] **DİL KURALI ve İLETİŞİM:**
> **Tüm Artifact'ler (implementation_plan.md, task.md, walkthrough.md) ve raporlar KESİNLİKLE TÜRKÇE hazırlanmalıdır.**
> Kullanıcı ile iletişim dili her zaman Türkçe olmalıdır. Yabancı dilde plan veya rapor sunmak **yasaktır**. Ajanlar, kullanıcı isteklerine Türkçe yanıt vermelidir.

## 0. Proje Mimarisi ve Backend Teknolojileri (KORUNMASI GEREKEN YAPI)
Proje, sunucusuz (serverless) mimari üzerine kuruludur. Aşağıdaki yapı taşları projenin omurgasını oluşturur ve **bozulmamalıdır**:
*   **Firebase (Core Backend):**
    *   **Firestore:** NoSQL veritabanı olarak kullanılır. Veri modelleri ve güvenlik kuralları kritiktir.
    *   **Authentication:** Kullanıcı kimlik doğrulama işlemleri Firebase Auth üzerindedir.
    *   **Functions:** Sunucu tarafı mantık (backend logic) için Firebase Cloud Functions kullanılır.
*   **Cloudflare R2 (Storage & CDN):**
    *   Dosya depolama için Firebase Storage YERİNE **Cloudflare R2** kullanılır. Bu hibrit yapı maliyet ve performans avantajı sağlar.
    *   **Cache Stratejisi:** R2'ye yüklenen tüm `public` dosyalar **1 Yıl (31536000s)** süreyle cache'lenir (`immutable`).
    *   **Cache Busting:** Dosya güncellemelerinde URL'in sonuna timestamp eklenerek (`.../timestamp-dosya.jpg`) "bayat veri" sorunu çözülür. Bu yapı **kesinlikle korunmalıdır**.

## 1. Tasarım ve UI/UX Felsefesi (Kritik Öncelik)
*   **"Wow" Faktörü Zorunludur:** Asla "basit" veya "MVP" görünümlü arayüzler üretmeyin. Tasarımlar ilk bakışta etkileyici, modern ve "premium" hissettirmelidir.
*   Mevcut tasarım diline sahip çıkın ve onu yüceltin.
*   **Dinamik ve Canlı Arayüz:** Arayüz "yaşıyor" gibi hissettirmelidir. Hover efektleri, mikro-animasyonlar ve yumuşak geçişler (transition-all) standarttır.
*   **Animasyon Kütüphanesi:** Animasyonlar için varsayılan olarak `framer-motion` kullanın. `AnimatePresence` kullanırken unmount çakışmalarına (white screen) dikkat edin.
*   **Yüksek Bilgi Yoğunluğu (High Density):** Kullanıcı, ekranın verimli kullanılmasını ve bir bakışta daha fazla içerik görmeyi sever. Mobil arayüzlerde tek büyük kartlar yerine, grid (2'li kolon), yatay sık listeler veya kompakt görünümler tercih edin. Font boyutlarını (özellikle mobilde) gereksiz büyük tutmayın.

## 2. Teknoloji Yığını ve Kodlama Standartları
*   **Dil:** TypeScript (.tsx / .ts) zorunludur. `any` tipinden kaçının, interface ve type'ları açıkça tanımlayın.
*   **Stil:** Styling için **Tailwind CSS** kullanın. Karmaşık stiller için `cn()` (classnames) utility fonksiyonunu kullanın. Inline style'lardan kaçının.
*   **Framework:** React (Vite/Next.js) best practice'lerine uyun. Functional Component ve Hook yapısını (useEffect, useMemo, useCallback) doğru kullanın.
*   **Dosya Yolları:** Tool kullanırken **her zaman** mutlak (absolute) dosya yolları kullanın.

## 3. Kod Kalitesi ve Güvenlik
*   **SOLID Prensipleri:** Kodun modüler, okunabilir ve bakımı kolay olmasına özen gösterin. Tek bir dosya 400-500 satırı geçiyorsa, mantıklı alt bileşenlere (sub-components) bölün.
*   **Hata Yönetimi (Error Handling):** Kullanıcı dostu hata mesajları gösterin. Asla sessizce başarısız olan (fail silently) kod yazmayın.
*   **Import Düzeni:** Importları gruplayın:
    1. React ve kütüphaneler (lucide-react, framer-motion vb.)
    2. Context ve hook'lar
    3. UI bileşenleri
    4. Tipler ve Utils
*   **Placeholder YASAĞI:** Asla "lorem ipsum" veya gri kutular kullanmayın. `generate_image` aracı ile gerçekçi görseller üretin veya mantıklı dummy data kullanın.

## 4. UI Bileşen Mimarisi
*   **Sticky Header:** Mobil uyumluluğa dikkat edin. `sticky top-0` kullanırken içeriğin header altında kalmamasına veya header'ın sayfa düzenini bozmamasına (gereksiz padding vb.) özen gösterin.
*   **Responsive First:** Tüm tasarımlar Mobile-First yaklaşımıyla, hem telefonlarda hem de geniş ekranlarda kusursuz görünmelidir. `hidden md:flex` gibi patternleri etkin kullanın.

## 5. İletişim ve Süreç
*   **Proaktif Olun:** Sadece isteneni değil, olması gerekeni yapın. Eğer bir kod bloğu güvensiz veya performanssız görünüyorsa, kullanıcıyı uyararak düzeltin.
*   **Tamamlayıcılık:** Bir özellik eklerken, eksik parçaları (örn: back button, loading state, empty state) mutlaka düşünün ve ekleyin.

## 6. Performans, Cache Stratejisi ve 60 FPS Takıntısı
*   **60 FPS Kırmızı Çizgimizdir:** Uygulama, en düşük donanımlı mobil cihazlarda bile "yağ gibi" akmalıdır. Jank (takılma) ve frame drop kesinlikle kabul edilemez.
    *   **Animasyon Performansı:** Animasyonlarda **SADECE** GPU hızlandırmalı özellikleri (`transform`, `opacity`, `filter`) kullanın. Layout tetikleyen özellikleri (`width`, `height`, `margin`, `top/left`) animasyona sokmaktan kaçının.
    *   **Ağır İşlemler:** Main thread'i bloklamayın. Pahalı hesaplamalar için `useMemo` veya Web Worker kullanın.
*   **Cache Kullanımı (Korkmayın, Kullanın!):**
    *   **Network Tasarrufu:** Aynı veriyi tekrar tekrar sunucudan istemek yasaktır. Verileri (kullanıcı profili, statik metinler, konfigürasyonlar) akıllıca cache'leyin.
    *   **Stale-While-Revalidate:** Kullanıcıyı "Loading..." spinner'ına mahkum etmeyin. Varsa önce cache'teki "bayat" veriyi gösterin, arkada güncel veriyi çekip sessizce UI'ı güncelleyin.
    *   **CDN & Asset Yönetimi:** Görseller, videolar ve fontlar için Cloudflare R2 / CDN caching mekanizmalarına güvenin. Tarayıcının cache header'larını (`Cache-Control`) doğru yönettiğinden emin olun.
*   **React Optimizasyonu:** `React.memo`, `useCallback` ve `useMemo` kullanımı opsiyonel değil, **standarttır**. Gereksiz re-render'lar performansın düşmanıdır.

---
**ÖZET:** Basit kod yazma. Sanat eseri gibi kodla. Kullanıcıyı her etkileşimde etkile.