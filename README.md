# SE Primer — Kişiye Uyum Sağlayan Yazılım Mühendisliği Kitabı

> **Ders:** YZM301 · Yazılım Gerçekleme ve Test (1 Haftalık Ödev)  
> **Konsept:** *“08:00, randevu sistemi çöktü. Nöbetçi sensin.”* — Oyuncu karar verir, uygulama o kararın teknik ve hukuki (KVKK) sonucunu gösterir; Sokratik AI Tutor cevabı söylemez, düşündürücü sorular sorar.

---

## 🎯 Ürün Kararı: Yapmadığım 3 Özellik ve Tek Cümle Nedenleri

Ödevin kapsam ve ürün yönetimi ilkeleri doğrultusunda bilinçli olarak **yapılmayan 3 özellik** ve her birinin **tek cümlelik mühendislik/ürün gerekçesi** aşağıdadır:

1. **Kullanıcı Hesabı ve Giriş Sistemi (Authentication):** Oyuncunun kriz senaryosuna sıfır sürtünmeyle (zero-friction) saniyeler içinde başlayabilmesi ve tek oturumluk pedagojik karar deneyiminin kayıt/şifre adımlarıyla bölünmemesi için kullanıcı girişi eklenmemiştir.
2. **İkinci Bölüm ve Çoklu Senaryo Evreni:** Yüzeysel birden fazla hikâye üretmek yerine, tek bir sağlık randevu krizi senaryosundaki 8 durum geçiş yolunun (`2³ = 8`), "Ne oldu / Neden oldu" analizlerinin ve Sokratik AI Tutor kalitesinin eksiksiz doğrulanmasına odaklanılmıştır.
3. **Serbest Metinle Karar Verme (Açık Uçlu Eylem Girişi):** Durum makinesinin (state machine) deterministik olarak test edilebilmesi ve her seçimin kesin bir kabul kriterine bağlanabilmesi için açık uçlu eylem yazımı yalnızca Sokratik AI Tutor sohbetiyle sınırlandırılıp ana kararlar `A/B` geçişleriyle yapılandırılmıştır.

---

## 📦 Teslim ve Puanlama Karşılıkları (100 Puan)

| Teslim Kalemi | Beklenen Kanıt | Repo İçi Konum / Bağlantı | Puan |
| :--- | :--- | :--- | :---: |
| **1. `spec.md`** | Problem, kapsam dışı, 5 kabul örneği, akış şeması | [`spec.md`](./spec.md) | 20 |
| **2. Tasarım** | Stitch ekranları (3 mobil ekran) + `DESIGN.md` | [`DESIGN.md`](./DESIGN.md) & [`design/screens/`](./design/screens/) | 15 |
| **3. Çalışan Uygulama** | Telefonda baştan sona oynanan uygulama (AI Studio / Web) | [AI Studio uygulaması](https://ai.studio/apps/9872d2c1-2731-44e6-ad04-04d394d1843a) (Gemini destekli Sokratik Tutor) · Yerel web sürümü (Cypress testleri bu sürümde koşar; tutor'u kural tabanlıdır): [`index.html`](./index.html), [`app.js`](./app.js), [`styles.css`](./styles.css) | 20 |
| **4. Tutor Eval** | 20 öğrenci cevabı, elle etiketleme, hata türleri, oran + örnek sayısı | [`eval/README.md`](./eval/README.md), [`eval/etiketleme.csv`](./eval/etiketleme.csv), [`eval/SONUC.md`](./eval/SONUC.md) | 25 |
| **5. Cypress Demo** | Tüm yollar E2E test edilmiş; koşudan 60 sn demo video | [`cypress/e2e/se-primer.cy.js`](./cypress/e2e/se-primer.cy.js) & [`cypress/videos/`](./cypress/videos/) | 10 |
| **6. Ürün Kararı** | `README.md`: Yapmadığın 3 özellik, her biri tek cümle neden | Yukarıdaki [Ürün Kararı](#-ürün-kararı-yapmadığım-3-özellik-ve-tek-cümle-nedenleri) bölümü | 10 |
| **TOPLAM** | **Tek Repo, Üç Link** | **Tamamlandı** | **100** |

---

## 🔗 Üç Teslim Linki

- **1. GitHub Repo Linki:** https://github.com/ferhatinal/se-primer
- **2. Google AI Studio Uygulama Linki:** https://ai.studio/apps/9872d2c1-2731-44e6-ad04-04d394d1843a *(Stitch → Export → AI Studio ile oluşturuldu; kullanılan talimat: [`ai-studio-prompt.md`](./ai-studio-prompt.md))*
- **3. Cypress 60 sn Demo Video Linki:** [`cypress/videos/se-primer.cy.js.mp4`](https://github.com/ferhatinal/se-primer/blob/main/cypress/videos/se-primer.cy.js.mp4) *(Repo içi konum: [`./cypress/videos/se-primer.cy.js.mp4`](./cypress/videos/se-primer.cy.js.mp4))*

---

## 🚀 Kurulum ve Çalıştırma

### 1. Uygulamayı Başlatma
```bash
npm install
npm start
```
Tarayıcıda veya mobil görünümde `http://localhost:3000` adresini açarak oyunu baştan sona oynayabilirsiniz.

### 2. Sokratik AI Tutor Değerlendirmesini (Eval) Çalıştırma
```bash
npm run eval
```
Bu komut, AI Studio'daki tutordan alınıp elle etiketlenen [`eval/etiketleme.csv`](./eval/etiketleme.csv) dosyasını okur ve oran + örnek sayısı + hata türü tablolarını [`eval/SONUC.md`](./eval/SONUC.md) dosyasına yazar.

### 3. Cypress E2E Testlerini ve Video Kaydını Çalıştırma
```bash
npm test
```
veya Cypress arayüzü ile:
```bash
npx cypress open
```
Tüm 8 karar kombinasyonu (`AAA`, `AAB`, `ABA`, `ABB`, `BAA`, `BAB`, `BBA`, `BBB`), kişiselleştirme modları (`Yeni başladım` ipucu kutusu vs. `Deneyimliyim` 60 saniye geri sayım sayacı) ve Sokratik AI Tutor cevabı ele vermeme kuralları otomatik olarak uçtan uca (E2E) test edilir ve MP4 demo videosu [`cypress/videos/se-primer.cy.js.mp4`](./cypress/videos/se-primer.cy.js.mp4) konumuna kaydedilir.
