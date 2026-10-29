# SE Primer — Mobil Arayüz ve Tasarım Dokümanı (`DESIGN.md`)

> **Araç Akışı:** Google Stitch (`stitch.withgoogle.com`) → Google AI Studio (`aistudio.google.com`) → Mobil Web Uygulaması  
> **Hedef Ekran Boyutu:** Mobil Öncelikli (Mobile-First, `390px × 844px` iPhone 14/15 referans görünümü, tüm mobil/masaüstü ekranlara duyarlı)

---

## 1. Tasarım Felsefesi: "Oynanan Bir Mühendislik Kitabı"

Neal Stephenson'ın *The Diamond Age* eserindeki etkileşimli "Primer" kitabından ve ödev afişindeki **Gece Mavisi + Kehribar Altın + Zümrüt Yeşili + Kriz Mercanı** paletinden esinlenilmiştir.

- **Atmosfer:** Sabah 08:00 nöbet krizinin ciddiyetini hissettiren koyu lacivert/arduvaz arka plan (`#0B132B` – `#111D38`), okunabilirliği yüksek açık metinler ve durum geçişlerini netleştiren renk kodlu rozetler.
- **Tek Başparmak Ergonomisi (Thumb-Friendly UI):** Tüm karar butonları (`A` ve `B`), Sokratik AI Tutor giriş alanı ve geçiş butonları mobil ekranda tek elle rahatça dokunulabilecek minimum `48px` yüksekliğe sahiptir.

---

## 2. Renk Paleti ve Tipografi (Design Tokens)

| Token Adı | Hex Kodu | Kullanım Alanı |
| :--- | :--- | :--- |
| `--bg-primary` | `#0B132B` | Ana uygulama arka planı (Derin Gece Laciverti) |
| `--bg-card` | `#152244` | Sahne, karar ve geri bildirim kartları |
| `--accent-amber` | `#F59E0B` | Primer kitap vurgusu, AI Tutor ikonu ve başlık etiketleri |
| `--status-good` | `#10B981` | **SON A · İYİ** (Sistem ayakta, veri güvende) ve güvenli adımlar |
| `--status-bad` | `#EF4444` | **SON B · KÖTÜ** (KVKK ihlali / Kriz) ve süre baskısı sayacı |
| `--text-primary` | `#F8FAFC` | Ana başlıklar ve senaryo anlatı metinleri |
| `--text-secondary` | `#94A3B8` | Yardımcı açıklamalar, zaman damgaları ve sistem logları |

- **Başlık Yazı Tipi:** `Georgia, 'Playfair Display', serif` — "Primer" kitabının edebi kimliğini yansıtır.
- **Arayüz Yazı Tipi:** `'Inter', system-ui, -apple-system, sans-serif` — Mobil ekranda yüksek okunabilirlik sağlar.
- **Kod ve Log Yazı Tipi:** `'JetBrains Mono', 'Fira Code', monospace` — Veritabanı şeması ve hasta log kayıtlarını gerçekçi gösterir.

---

## 3. Google Stitch İle Tasarlanan 3 Mobil Ekran

3 mobil ekran Google Stitch'te üretildi ve **Export → .zip** ile dışa aktarıldı. Ham çıktı [`design/stitch/`](./design/stitch/) klasöründedir:

| Ekran | Stitch klasörü (`code.html`) | PNG (390 px mobil, tam sayfa) |
| :--- | :--- | :--- |
| 1 · Giriş | `se_primer_kriz_sim_lasyonu/` | [`1-giris-ekrani.png`](./design/screens/1-giris-ekrani.png) |
| 2 · Sahne & Karar | `kriz_karar_konsolu/` | [`2-sahne-karar-ekrani.png`](./design/screens/2-sahne-karar-ekrani.png) |
| 3 · Sonuç | `post_mortem_de_erlendirme/` | [`3-sonuc-ekrani.png`](./design/screens/3-sonuc-ekrani.png) |

- **Stitch'in kendi tasarım sistemi:** [`design/stitch/.../crisis_ops_command/DESIGN.md`](./design/stitch/stitch_se_primer_simulation_app/crisis_ops_command/DESIGN.md) ("Crisis Ops Command" renk ve tipografi tokenları).
- **PNG nasıl üretildi?** Stitch zip'indeki `screen.png` dosyaları boş geldi (28 bayt). Bu yüzden PNG'ler, Stitch'in `code.html` çıktıları Cypress ile 390 px genişlikte açılarak alındı (`npm run stitch:capture`).

Aşağıdaki ekran tarifleri, Stitch'e verilen tasarım hedefini (spec ile uyumlu hâli) anlatır:

### Ekran 1: Giriş ve Kişiselleştirme Ekranı (`1-giris-ekrani.png`)
- **Amaç:** Oyuncuyu karşılamak ve anlatıyı şekillendirecek **3 kişiselleştirme sorusunu** almak.
- **Bileşenler:**
  1. **Üst Başlık (Hero):** *"SE Primer: Kişiye Uyum Sağlayan Yazılım Mühendisliği Kitabı"* ve `"08:00, randevu sistemi çöktü. Nöbetçi sensin."` alt başlığı.
  2. **Soru 1 — Seviyen:**
     - `Yeni başladım` *(Açıklama: Her kararda teknik ipucu açık gelir)*
     - `Deneyimliyim` *(Açıklama: 60 saniyelik süre baskısı altında karar verirsin)*
  3. **Soru 2 — Rolün:**
     - `Backend Mühendisi` | `SRE / DevOps` | `Güvenlik / KVKK Uzmanı`
  4. **Soru 3 — Öncelikli Hedefin:**
     - `Sistem Sürekliliği (Uptime)` | `Veri Güvenliği ve KVKK Uyum` | `Hızlı Kök Neden Analizi`
  5. **CTA Butonu:** `"Nöbete Başla (08:00)"` (Tam genişlikte kehribar vurgu butonu).

```
+---------------------------------------+
|  YZM301 · SE PRIMER            08:00  |
|  "Randevu sistemi çöktü.              |
|   Nöbetçi sensin."                    |
|---------------------------------------|
|  1. SEVİYEN NEDİR?                    |
|  [x] Yeni başladım (İpucu açık)       |
|  [ ] Deneyimliyim (60 sn süre baskısı)|
|                                       |
|  2. ROLÜN NEDİR?                      |
|  (Backend) (SRE/DevOps) (Güvenlik)    |
|                                       |
|  3. HEDEFİN NEDİR?                    |
|  (Uptime) (KVKK Uyum) (Kök Neden)     |
|                                       |
|  [     NÖBETE BAŞLA (08:00) ->     ]  |
+---------------------------------------+
```

---

### Ekran 2: Sahne, Karar ve Sokratik AI Tutor Ekranı (`2-sahne-karar-ekrani.png`)
- **Amaç:** Kriz durumunu, aktif kararı (`Karar 1 · Mimari`, `Karar 2 · Test`, `Karar 3 · KVKK`), seçim sonrası `"Ne oldu / Neden oldu"` kutusunu ve **Sokratik AI Tutor** etkileşimini tek mobil akışta sunmak.
- **Bileşenler:**
  1. **Durum Çubuğu:** İlerleme adımı (`Karar 1/3 · Mimari`), oyuncu profil rozeti ve *"Deneyimliyim"* modundaysa `⏱ 00:59` geri sayım sayacı.
  2. **Kriz ve Sahne Kartı:** Saat damgası (`08:00`), bekleyen hasta sayısı (`300 hasta bekliyor`), oyuncunun rolüne göre özelleştirilmiş olay anlatımı ve canlı log/terminal kesiti.
  3. **Başlangıç İpucu Kartı (Yalnızca "Yeni başladım" modunda görünür):** Kararın kavramsal arka planını hatırlatan rehber notu.
  4. **Karar Seçenekleri (İki Büyük Mobil Kart):**
     - **A)** Eski sürüme geri dön *(Karar 1)* / Önce kısa test koş *(Karar 2)* / Maskele *(Karar 3)*
     - **B)** Canlıda yama yap *(Karar 1)* / Hemen yayına al *(Karar 2)* / Ekibe olduğu gibi at *(Karar 3)*
  5. **Teknik Sonuç Kartı (Seçim Yapıldığında Açılır):**
     - **Ne oldu?** (Kararın sistem üzerindeki anlık etkisi)
     - **Neden oldu?** (Altında yatan yazılım mühendisliği / KVKK prensibi)
     - **Sonraki Adım Butonu:** `"Sonraki Karara İlerle →"`
  6. **Sokratik AI Tutor Çekmecesi / Kartı:**
     - Hazır örnek soru: *"Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?"*
     - Öğrencinin kendi sorusunu/düşüncesini yazabileceği metin kutusu ve `"Tutor'a Sor"` butonu.

```
+---------------------------------------+
|  KARAR 1/3 · MİMARİ       ⏱ 00:54     |
|---------------------------------------|
|  KRİZ: Dün gece v2.4.0 çıktı.         |
|  300 hasta poliklinikte bekliyor.     |
|  [İpucu Kartı - Yeni Başladım ise]    |
|---------------------------------------|
|  [ A) Eski sürüme geri dön         ]  |
|  [ B) Canlıda yama yap             ]  |
|---------------------------------------|
|  NE OLDU: v2.3.9 konteyneri devreye...|
|  NEDEN OLDU: İmmutable imaj geri...   |
|  [     SONRAKİ KARARA GEÇ ->       ]  |
|---------------------------------------|
|  💬 AI TUTOR (Cevabı vermez, sorar):  |
|  "Geri dönmeden önce veritabanı       |
|   şemasının değişip değişmediğini     |
|   nasıl anlarsın?"                    |
|  [ Düşünceni yaz...       ] [Gönder]  |
+---------------------------------------+
```

---

### Ekran 3: Sonuç ve Teknik Karne Ekranı (`3-sonuc-ekrani.png`)
- **Amaç:** Oyuncunun 3 kararının bileşkesine göre ulaştığı sonu (**SON A · İYİ** veya **SON B · KÖTÜ**) ve durum geçiş özetini göstermek.
- **Bileşenler:**
  1. **Sonuç Başlık Kartı:**
     - **SON A · İYİ (Zümrüt Yeşili Çerçeve):** `"08:25 sistem ayakta, veri güvende"`
     - **SON B · KÖTÜ (Mercan Kırmızısı Çerçeve):** `"Sistem ayakta ama KVKK ihlali"`
  2. **Kişiselleştirilmiş Hedef Değerlendirmesi:** Oyuncunun girişte seçtiği rol ve hedefe göre başarı analizi.
  3. **Karar Zinciri Özeti (3 Adım):**
     - `Karar 1 · Mimari` → Seçilen şık + Teknik etki
     - `Karar 2 · Test` → Seçilen şık + Teknik etki
     - `Karar 3 · KVKK` → Seçilen şık + Teknik/Hukuki etki
  4. **Aksiyon Butonları:** `"Farklı Kararlarla Tekrar Oyna"` ve `"Profili Değiştir"`.

---

## 4. Google Stitch Promptları (Tasarım Üretim Promptları)

Google Stitch (`stitch.withgoogle.com`) üzerinde bu 3 ekranı üretmek için kullanılan promptlar:

1. **Ekran 1 (Giriş):**
   > *"Mobile web app onboarding screen (390x844), dark navy theme (#0B132B) with warm amber accents (#F59E0B), inspired by an interactive illustrated book for software engineers titled 'SE Primer'. Subtitle: '08:00, randevu sistemi çöktü. Nöbetçi sensin.' Contains 3 personalization question groups with selectable pill cards: 1. Seviye (Yeni başladım / Deneyimliyim), 2. Rol (Backend / SRE / Güvenlik), 3. Hedef (Uptime / KVKK / Kök Neden), and a primary amber button 'Nöbete Başla'."*
2. **Ekran 2 (Sahne & Karar):**
   > *"Mobile decision screen (390x844) for a software engineering crisis game. Top bar shows 'KARAR 1/3 · MİMARİ' and a 60s countdown badge. Crisis card shows 'Dün gece yeni sürüm çıktı. 300 hasta bekliyor.' Two large decision buttons: 'A) Eski sürüme geri dön' and 'B) Canlıda yama yap'. Below is an expandable feedback card showing 'Ne oldu?' and 'Neden oldu?', and a bottom Socratic AI Tutor panel asking 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?' with a chat input."*
3. **Ekran 3 (Sonuç):**
   > *"Mobile game ending screen (390x844) comparing two states: 'SON A · İYİ: 08:25 sistem ayakta, veri güvende' (emerald green accent) and 'SON B · KÖTÜ: Sistem ayakta ama KVKK ihlali' (coral red accent). Includes a 3-step decision timeline summary (Mimari, Test, KVKK) and a 'Yeniden Oyna' button."*
