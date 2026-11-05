# Düşünce Egzersizi: "Sizinle Uyumlanan Sınav Tasarımı" (`SINAV_TASARIMI.md`)

> **Ders:** YZM301 · Yazılım Gerçekleme ve Test — Vizeye Hazırlık Düşünce Egzersizi (1 Sayfa)  
> **Soru:** *"Bu sınavı siz olsanız nasıl tasarlardınız? The Primer kullanıcıyla uyumlanan bir sistemdi; peki sizinle uyumlanan, ezberi değil kavramların gerçek özünü ve gerekçesini ölçen 1 sayfalık klasik vize sınav sorusu nasıl olurdu?"*

---

## 1. Tasarım Felsefesi: Neden Ezber Değil, Karar ve Ödünleşim?

Klasik bir sınavda *"Doğrulama (Verification) ile Geçerleme (Validation) arasındaki farkı tanımlayınız"* diye sormak yalnızca öğrencinin Boehm'in iki cümlesini ezberleyip ezberlemediğini ölçer. Oysa *The Primer* nasıl oyuncunun bir kriz anındaki kararına göre bir sonraki sahneyi şekillendiriyorsa, **uyumlanan bir klasik vize sorusu** da öğrenciyi gerçek bir üretim krizinin içine koymalı ve **kendi seçtiği mimari karara göre dallanan (A veya B dalı)** alt sorularla o kararın teknik bedelini savunmasını istemelidir.

---

## 2. Özgün Klasik Vize Sınav Sorusu (Kapalı Kitap · 30 Dakika · 100 Puan)

### Vaka Senaryosu: "Acil Servis Triyaj Modeli Göçü"
Bir devlet hastanesinin acil servisinde, hastanın 6 yaşamsal bulgusundan (nabız, SpO₂, ateş, tansiyon, yaş, ağrı skoru) **"Kritik Müdahale Riski ($p \in [0,1]$)"** hesaplayan 15 yıllık, dokümantasyonu kaybolmuş bir C++ kütüphanesi çalışmaktadır. Başhekimlik bu sistemi hem tabletlerde çevrimdışı (offline) hem de merkezi web ekranında çalışacak yeni bir **ONNX (`float32`)** modeline taşımanızı istemiştir.

---

### Bölüm A — Mevcut Sistemi Anlama ve Taşıma (40 Puan)
1. **(20p) Karakterizasyon ve Diferansiyel Test:** Kaynak kodu karmaşık ve spesifikasyonu kayıp olan eski C++ sisteminin davranışını bozmadan yeni sisteme taşıdığınızı kanıtlamak için **300 hasta girdisi** kullanacaksınız. **Karakterizasyon testi (Characterization Test)**, **Test Kahini (Test Oracle)** ve **Diferansiyel Test (Parite Testi)** kavramlarını bu senaryoda kim/ne üstlenir?
2. **(20p) Hata Toleransı:** Eski sistem `float64` (IEEE 754 çift duyarlılık), yeni ONNX modeli ise `float32` çalışmaktadır. 300 girdinin birinde eski sistem `0.79999999`, yeni sistem `0.80000120` döndürmüştür. Testinizde `assert p_eski == p_yeni` yazmak neden mühendislik hatasıdır? **Hata toleransı ($\epsilon = 10^{-4}$)** kavramını ve klinik karar eşiği (`0.80`) sınırındaki riskini açıklayınız.

### Bölüm B — Seninle Uyumlanan Dal Seçimi (30 Puan) *(Yalnızca BİR dalı seçip savununuz)*
- **Dal 1 (İstemci/Tablet İçi Çıkarım — `onnxruntime-web` / Mobil):** Modeli ambulans tabletinin içine gömmeyi seçtiniz.
- **Dal 2 (Merkezi Sunucu Çıkarımı — `FastAPI / Rails API`):** Modeli hastane sunucusunda tutup tabletten HTTP isteği atmayı seçtiniz.

**Seçtiğiniz dal için şu 3 soruyu yanıtlayınız:** (a) Ambulans tüneldeyken internet kesilirse sistem nasıl davranır? (b) Hasta verisi (KVKK) cihazdan çıkar mı? (c) Model ağırlıkları gizli kalır mı; sunucu seçtiyseniz **Tersine Mühendislik Saldırısı (REA / Model Extraction)** riski neden tamamen sıfırlanmaz?

### Bölüm C — Canlıya Geçiş, Regresyon ve V&V (30 Puan)
1. **(15p) Doğrulama (Verification) vs. Geçerleme (Validation):** Yeni ONNX modeliniz 300 girdinin tamamında eski sistemle $< 10^{-4}$ farkla aynı sonucu verdi ve geçen haftaki 20 **Regresyon E2E** testini kırmadan geçti. Ancak acil servis hemşireleri, modelin ürettiği olasılık ekranının eldivenle dokunulamayacak kadar küçük olduğunu ve triyajı yavaşlattığını söyledi. Burada **Doğrulama** mı başarısız olmuştur, **Geçerleme** mi? Neden?
2. **(15p) Güvenli Devreye Alma:** Yeni modeli pazartesi sabahı 08:00'de doğrudan tüm acil servise açmak yerine **Gölge Dağıtım (Shadow Deployment)** ve **Kanarya (Canary)** adımlarını nasıl kurgularsınız?

---

## 3. Değerlendirme Anahtarı: Beklenen Kavramlar ve Çeldiriciler

| Ölçülen Kavram | Tam Puanlık Öz (Beklenen Mühendislik Gerekçesi) | Yaygın Çeldirici / Ezberci Yanılgısı |
| :--- | :--- | :--- |
| **Karakterizasyon Testi & Test Kahini (Oracle)** | Dokümantasyonu olmayan eski C++ sisteminin *mevcut gerçek davranışını* kaydetmek karakterizasyon testidir; bu süreçte eski sistem **Test Kahini (Oracle)** rolünü üstlenir ve iki sistemin aynı 300 girdide kıyaslanması **Diferansiyel Test**tir. | *"300 girdinin doğru cevabını doktorlara tek tek elle sorarım"* demek (otomasyon ve mevcut sistem paritesi mantığını kaçırmak). |
| **Hata Toleransı ($\epsilon = 10^{-4}$)** | Farklı donanım/çalışma zamanları (`float64` vs `float32` WASM/CPU) son bitlerde yuvarlama farkı üretir (`\|p₁ - p₂\| < 1e-4` kullanılmalıdır). Ancak eşik (`0.80`) tam sınırındayken $10^{-5}$'lik fark bile sınıf kararını (`0` ↔ `1`) değiştirebileceği için sınır vakaları ayrıca izlenmelidir. | *"Ondalık sayıları `==` ile karşılaştırırım"* veya *"Yuvarlama farkı hiç önemli değildir, kararı asla etkilemez"* yanılgısı. |
| **Doğrulama (Verification) vs. Geçerleme (Validation)** | Parite ($< 10^{-4}$) ve regresyon testlerinin geçmesi **"Ürünü spesifikasyona uygun, doğru inşa ettik mi?" (Verification)** sorusunun başarılı olduğunu gösterir. Hemşirenin sahada kullanamaması ise **"Kullanıcının gerçek ihtiyacını çözen doğru ürünü mü inşa ettik?" (Validation)** başarısızlığıdır (Sommerville, Bl. 8). | Parite testi geçtiği için hemşirenin şikâyetini *"yazılım hatası değildir, testler geçti"* diyerek geçerleme (validation) kapsamı dışında saymak. |
| **Gölge Dağıtım (Shadow) & REA** | Shadow modda yeni model canlı hasta verisini sessizce işler ama hemşireye eski sistemin kararı gösterilir. Sunucu mimarisinde `.onnx` dosyası gizli kalsa bile, girdi-çıktı çiftlerinden modelin kopyalanabileceği (**Model Extraction / REA**) unutulmamalıdır. | *"Modeli sunucuya koyarsam kimse modeli çalamaz / tersine mühendislik yapamaz"* yanılgısı. |
