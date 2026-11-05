# SE Primer v2.0 — Davranıştan Öğrenen Yazılım Mühendisliği Kitabı (`sklearn → ONNX → Web & API`)

> **Ders:** YZM301 · Yazılım Gerçekleme ve Test — *Hafta 1 (Kural Tabanlı Sokratik Primer) + Hafta 2 (Davranıştan Öğrenen Göreve Özel Küçük Model: Development · Deployment · Inference)*  
> **Senaryo:** *“08:00, randevu sistemi çöktü. Nöbetçi sensin.”* — Oyuncu karar verir, uygulama kararın teknik/KVKK sonucunu gösterir; **ONNX Risk Radarı (`se-primer-risk-radari v2.0.0`)** oyuncunun gerçek zamanlı davranış izlerinden riskli seçim olasılığını (`p_riskli`) tahmin ederek oyunun akışını dinamik olarak uyarlar.

---

## ⚡ Hızlı Kurulum ve Çalıştırma (En Fazla 3 Komut)

```bash
npm install && pip install numpy pandas scikit-learn skl2onnx onnxruntime huggingface_hub
python data/hazirla.py && python train.py && python tests/parite.py
npm test
```
*(Uygulamayı tarayıcıda canlı açmak için: `npm start` → `http://localhost:3000` · Bonus ONNX API sunucusu için: `python api/server_api.py` → `http://localhost:8000/health`)*

---

## 🔗 Dört Teslim Linki

| # | Teslim Kalemi | Bağlantı |
| :-: | :--- | :--- |
| **1** | **GitHub Repo Linki** | https://github.com/ferhatinal/se-primer |
| **2** | **Hugging Face Model Linki (Commit'e Sabit)** | `https://huggingface.co/ferhatinal/se-primer-risk-radari/resolve/<COMMIT_SHA>/model.onnx` *(Repoyu yayınlamak için: `python hf_push.py --repo ferhatinal/se-primer-risk-radari`)* |
| **3** | **Canlı Uygulama Linki (Web / AI Studio)** | **GitHub Pages (ONNX Web):** https://ferhatinal.github.io/se-primer/ · **Google AI Studio:** https://ai.studio/apps/9872d2c1-2731-44e6-ad04-04d394d1843a |
| **4** | **Demo Video Linki (60–90 sn)** | [`cypress/videos/parite-ve-model.cy.js.mp4`](https://github.com/ferhatinal/se-primer/blob/main/cypress/videos/parite-ve-model.cy.js.mp4) *(Aynı sahnede iki farklı oyuncuya modelin iki farklı kararı + E2E regresyon: [`cypress/videos/se-primer.cy.js.mp4`](https://github.com/ferhatinal/se-primer/blob/main/cypress/videos/se-primer.cy.js.mp4))* |

---

## 📦 Repo Yapısı ve Puanlama Karşılıkları (100 Puan + 10 Bonus)

| Adım | Beklenen Teslim ve Kanıt | Repo İçi Dosya / Konum | Puan |
| :--- | :--- | :--- | :---: |
| **1. Spec ve Kabul Örnekleri** | Model gereksinimi, eval metriği ve eğitimden **ÖNCE** tanımlanmış kabul eşiği (`AUC ≥ 0.70`, `Recall ≥ 0.60`, `ONNX farkı ≤ 1e-4`) + 3 yeni kabul örneği (AC 6, 7, 8) | [`spec.md`](./spec.md) (§5–§7) | **10** |
| **2. Veri ve Veri Sözlüğü** | En az 15 gerçek oturum (**18 gerçek oturum / 54 satır** `kaynak=gercek` + **300 sentetik oturum / 900 satır** `kaynak=sentetik` = 954 satır), KVKK anonim `oturum_id`, veri sözlüğü | [`data/oturumlar.csv`](./data/oturumlar.csv) · [`data/SOZLUK.md`](./data/SOZLUK.md) · [`data/hazirla.py`](./data/hazirla.py) | **10** |
| **3. Tekrarlanabilir Eğitim ve Eval Kapısı** | Sabit tohum (`random_state=42`), grup bazlı ayrım (`oturum_id`), eşik altında çıkış kodu `1` ile durup artefakt üretmeme kanıtı | [`train.py`](./train.py) · [`tests/test_eval_kapisi.py`](./tests/test_eval_kapisi.py) | **15** |
| **4. Somut Artefakt ve Model Kartı** | Taşınabilir ONNX (`model.onnx`), sözleşme ve JSON şeması (`config.json`), Mitchell vd. (2019) standardında model kartı (`model/README.md`) | [`model/model.onnx`](./model/model.onnx) · [`model/config.json`](./model/config.json) · [`model/README.md`](./model/README.md) | **10** |
| **5. Yayın, Ödünleşim ve Sürümleme** | Commit'e sabit HF URL yapısı, Shadow → Canary (%5) → Progressive Rollout (%25→%50→%100), Rollback planı ve 3 soruluk Mimari Ödünleşim (Trade-off) Matrisi | [`RELEASE.md`](./RELEASE.md) · [`hf_push.py`](./hf_push.py) | **15** |
| **6. Uygulamada Çıkarım** | Tarayıcıda `onnxruntime-web` ile canlı çıkarım (`data-cy="p"`): eşik (`0.50`) geçildiğinde 60 sn süre baskısını kaldırır, derin rehberi ve proaktif Sokratik soruyu açar | [`index.html`](./index.html) · [`app.js`](./app.js) · [`styles.css`](./styles.css) | **15** |
| **7. Diferansiyel Test ve Regresyon** | Python Test Kahini (`tests/parite.py`) vs. `onnxruntime-web` üzerinde 5 referans vakada `< 1e-4` parite testi + geçen haftanın 9 E2E regresyon testinin kırılmadan geçmesi | [`tests/parite.py`](./tests/parite.py) · [`tests/parite.json`](./tests/parite.json) · [`cypress/e2e/parite-ve-model.cy.js`](./cypress/e2e/parite-ve-model.cy.js) · [`cypress/e2e/se-primer.cy.js`](./cypress/e2e/se-primer.cy.js) | **15** |
| **8. Demo Video ve Sınav Tasarımı** | Aynı sahnede iki farklı oyuncuya iki farklı model kararı videosu + 1 sayfalık *"Sizinle Uyumlanan Sınav Tasarımı"* vize düşünce egzersizi | [`SINAV_TASARIMI.md`](./SINAV_TASARIMI.md) · [`cypress/videos/`](./cypress/videos/) | **10** |
| **Bonus (+10 Puan)** | Kendi sunucumuzda (`api/server_api.py` + `render.yaml`) çalışan ONNX tüketicisinin aynı 5 referans girdide `< 1e-4` toleransla aynı sonucu vermesi (`fark = 0.00e+00`) | [`api/server_api.py`](./api/server_api.py) · [`render.yaml`](./render.yaml) | **+10** |

---

## 🧪 Sentetik Veri Üretici Kuralı ve Tohumu (`TOHUM = 42`)

[`data/hazirla.py`](./data/hazirla.py) içinde kullanılan sentetik veri üretim kuralı tamamen deterministiktir (`np.random.default_rng(42)`):
1. Her sentetik oturum ($N=300$) için modelin doğrudan göremediği gizli bir **"soğukkanlılık / dikkat"** parametresi $d \sim \text{Uniform}(0, 1)$ ($0=$ aceleci/panik, $1=$ dikkatli/analitik) ve `seviye` $\sim \text{Bernoulli}(0.5)$ çekilir.
2. Her karar sahnesi $k \in \{1, 2, 3\}$ için oyuncunun davranış izleri bu gizli $d$ değerinden türetilir:
   - $\text{karar\_suresi\_sn} = \exp(\mathcal{N}(\ln(3 + 22d), 0.45))$
   - $\text{okuma\_suresi\_sn} = \exp(\mathcal{N}(\ln(1.2 + 14d), 0.50))$
   - $\text{tutor\_soru\_sayisi} \sim \text{Poisson}(0.2 + 0.9d)$
   - $\text{cevap\_isteme\_artisi} \sim \text{Bernoulli}(0.45(1 - d))$
3. Riskli seçim (`B`) olasılığı lojistik fonksiyonla belirlenir:
   $$\text{logit} = 0.9 - 3.2d + 0.55\cdot\text{onceki\_riskli\_sayisi} + 0.50\cdot\text{cevap\_isteme\_sayisi} - 0.35\cdot\text{seviye} + 0.15\cdot\mathbb{I}(k=3) + \epsilon, \quad \epsilon \sim \mathcal{N}(0, 0.6)$$
4. **Sızıntı Önlemi (No Data Leakage):** Model gizli $d$ değişkenini veya mevcut sahnenin henüz tamamlanmamış `karar_suresi_sn` / `okuma_suresi_sn` değerlerini **görmez**; yalnızca o ana kadar birikmiş 7 gözlemlenebilir özelliği (`seviye`, `sahne_no`, `onceki_karar_suresi_sn`, `onceki_okuma_suresi_sn`, `onceki_riskli_sayisi`, `tutor_soru_sayisi`, `cevap_isteme_sayisi`) kullanarak çıkarım yapar.

---

## 🎯 Ürün Kararı: Yapmadığım 3 Özellik ve Tek Cümle Nedenleri

1. **Kullanıcı Hesabı ve Giriş Sistemi (Authentication):** Oyuncunun kriz senaryosuna sıfır sürtünmeyle (zero-friction) saniyeler içinde başlayabilmesi ve KVKK kapsamında hiçbir kişisel kimlik verisi tutulmaması için kullanıcı girişi eklenmemiştir.
2. **İkinci Bölüm ve Çoklu Senaryo Evreni:** Yüzeysel birden fazla hikâye üretmek yerine, tek bir sağlık randevu krizi senaryosundaki 8 durum geçiş yolunun (`2³ = 8`), ONNX Risk Radarı parite testlerinin (`< 1e-4`) ve Sokratik AI Tutor kalitesinin eksiksiz doğrulanmasına odaklanılmıştır.
3. **Serbest Metinle Karar Verme (Açık Uçlu Eylem Girişi):** Durum makinesinin (state machine) deterministik olarak test edilebilmesi ve her seçimin kesin bir kabul kriterine bağlanabilmesi için açık uçlu eylem yazımı yalnızca Sokratik AI Tutor sohbetiyle sınırlandırılıp ana kararlar `A/B` geçişleriyle yapılandırılmıştır.

---

## 🛠️ Coding Agent Kullanım Beyanı ve Mühendislik Müdahaleleri

Bu projenin geliştirilmesinde yapay zekâ kodlama ajanı (**Antigravity**) pair-programming aracı olarak kullanılmış; süreç boyunca aşağıdaki 5 kritik mühendislik kararı ve düzeltmesi bizzat tarafımdan yönetilmiştir:

1. **Özellik Sızıntısının (Target Leakage) Engellenmesi:** İlk model tasarımında mevcut sahnenin `karar_suresi_sn` özelliğinin modele girdi olarak verilmesinin çıkarım anında (oyuncu henüz karar vermeden önce) imkânsız olduğu tespit edildi; girdi sözleşmesi `onceki_karar_suresi_sn` ve `onceki_okuma_suresi_sn` (gecikmeli davranış izleri) olarak yeniden tasarlandı.
2. **Oturum Bazlı Veri Ayrımı (`GroupShuffleSplit`):** Standart `train_test_split` kullanıldığında aynı oyuncunun 1. ve 2. sahnesi eğitimde, 3. sahnesi testte kalarak yapay doğruluk şişmesi yarattığı görüldü; ayrım `oturum_id` üzerinden `GroupShuffleSplit` ile düzeltildi.
3. **Regresyon Testi Kırılmasının Önlenmesi (Cold-Start Koruması):** Model 1. sahnenin başında (`sahne_no=1`, geçmiş davranış verisi henüz `0` iken) çalıştırıldığında varsayılan olasılığın geçen haftaki v1 Cypress testlerindeki (`se-primer.cy.js`) 60 sn sayaç beklentisini bozmaması için, süre baskısı kaldırma müdahalesi somut bir davranış sinyali (`sahne_no >= 2` veya kopya isteme `>= 1`) oluşmasına bağlandı.
4. **ONNX `zipmap` Çıktı Uyumsuzluğunun Düzeltilmesi:** `skl2onnx` varsayılan olarak olasılıkları `Sequence<Map>` (`zipmap=True`) formatında ürettiği için `onnxruntime-web` tarafında `Float32Array` tensörü olarak okunamadığı fark edildi; dönüştürücüye `options={id(clf): {"zipmap": False}}` eklenerek `[N, 2]` boyutunda saf `float32` olasılık matrisi elde edildi.
5. **Cypress Varlık Temizleme (`trashAssetsBeforeRuns`) Hatasının Giderilmesi:** Farklı Cypress spec dosyaları ayrı ayrı çalıştırıldığında önceki koşunun demo videolarının silindiği tespit edilerek `cypress.config.js` içinde `trashAssetsBeforeRuns: false` sabitlendi.

---

## 📚 Kaynakça

- **Amershi, S. vd. (2019).** *Software Engineering for Machine Learning: A Case Study.* ICSE-SEIP 2019.
- **Shankar, S. vd. (2022).** *Operationalizing Machine Learning: An Interview Study.* (Üretimde ML mühendisliğinin 3V problemi: Velocity, Validation, Versioning).
- **Mitchell, M. vd. (2019).** *Model Cards for Model Reporting.* FAT* 2019.
- **Breck, E. vd. (2017).** *The ML Test Score: A Rubric for ML Production Readiness and Technical Debt Reduction.* IEEE Big Data 2017.
- **Sommerville, I. (2016).** *Software Engineering* (10. Baskı): Bl. 5 Durum Makineleri, Bl. 8 Yazılım Testi (V&V), Bl. 17 Dağıtık Yazılım Mühendisliği, Bl. 18 Servis Odaklı Mimariler, Bl. 25 Konfigürasyon Yönetimi.
- **Stanford HAI (2025).** *AI Index Report 2025* & **Gartner (2025).** *Küçük Göreve Özel (Dikey) Modeller 2027 Öngörüsü*.
