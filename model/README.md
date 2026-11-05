---
language:
  - tr
license: mit
library_name: onnx
tags:
  - tabular-classification
  - onnx
  - scikit-learn
  - software-engineering-education
  - adaptive-learning
  - se-primer
metrics:
  - roc_auc
  - recall
  - precision
  - accuracy
---

# Model Kartı: `se-primer-risk-radari` (v2.0.0)

> **Referans Çerçeve:** Mitchell vd. (2019), *Model Cards for Model Reporting*  
> **Artefaktlar:** [`model.onnx`](./model.onnx) · [`config.json`](./config.json) (Girdi/Çıktı Sözleşmesi ve JSON Şeması)

---

## 1. Model Özeti ve Amacı

- **Geliştirici / Bağlam:** YZM301 · Yazılım Gerçekleme ve Test — *SE Primer v2.0* (Kişiye Uyum Sağlayan Yazılım Mühendisliği Simülasyonu).
- **Model Türü:** `StandardScaler` + `LogisticRegression(class_weight="balanced", random_state=42)` boru hattı (`scikit-learn 1.8.0` → `skl2onnx 1.20.0`, ONNX Opset 17).
- **Tahmin Görevi:** Oyuncunun mevcut karar sahnesine kadarki davranış izlerinden (önceki karar süresi, "Ne oldu?" kartını okuma süresi, önceki riskli seçimler, Sokratik Tutor soru sayısı ve doğrudan cevap/kopya isteme sayısı), **bulunduğu sahnede riskli/hatalı şıkkı (`B`) seçme olasılığını (`p_riskli`)** tahmin etmek.
- **Uygulama İçi Etkisi:** `p_riskli >= 0.50` olduğunda **Risk Radarı** devreye girer; "Deneyimliyim" modundaki 60 saniyelik süre baskısını kaldırır, "Yeni başladım" modundaki rehber kartını derinleştirir ve Sokratik AI Tutor oyuncuya cevabı ele vermeyen proaktif bir yavaşlatma sorusu yöneltir.

---

## 2. Girdi / Çıktı Sözleşmesi (`config.json`)

İstemciler (`onnxruntime-web`, Python Test Kahini `tests/parite.py` ve FastAPI sunucusu `api/server_api.py`) aşağıdaki **7 özelliği sabit sırayla** `float32` tensörü (`[N, 7]`) olarak `input` düğümüne gönderir ve `probabilities[:, 1]` çıktısını okur:

| Sıra | Özellik Adı | Tip / Aralık | Ölçekli Lojistik Katsayı ($\beta$) | Yorum |
| :-: | :--- | :--- | :---: | :--- |
| 1 | `seviye` | `0` (Yeni) \| `1` (Deneyimli) | `-0.1045` | Deneyimli oyuncular temel durumda biraz daha düşük risk taşır |
| 2 | `sahne_no` | `1`, `2`, `3` | `-0.0875` | İlerleyen sahnelerde geçmiş davranış özellikleri baskınlaşır |
| 3 | `onceki_karar_suresi_sn` | $\ge 0$ sn | `-0.2367` | Önceki kararda düşünmeye ayrılan süre arttıkça risk düşer |
| 4 | `onceki_okuma_suresi_sn` | $\ge 0$ sn | `-0.1588` | "Ne oldu / Neden oldu" açıklamasını okuma süresi arttıkça risk düşer |
| 5 | `onceki_riskli_sayisi` | `0`, `1`, `2` | `+0.6772` | Önceki sahnelerde riskli (`B`) seçim yapmak en güçlü risk sinyalidir |
| 6 | `tutor_soru_sayisi` | $\ge 0$ adet | `-0.3559` | Sokratik Tutor ile kavramsal diyalog kurmak riskli seçimi azaltır |
| 7 | `cevap_isteme_sayisi` | $\ge 0$ adet | `+0.5011` | Tutordan doğrudan şık/kopya ("A mı B mi?") istemek acelecilik ve risk göstergesidir |

---

## 3. Eğitim ve Değerlendirme Verisi

- **Veri Dosyası:** [`data/oturumlar.csv`](../data/oturumlar.csv) (`SHA-256: b9407f8bebd798bb26bd741923231e4aa6076d307ba23fb6f3253a1514b4f308`)
- **Toplam Hacim:** **318 oturum / 954 karar satırı**
  - **Gerçek Oturumlar (`kaynak=gercek`):** **18 oturum (54 karar satırı)** — 3 farklı kullanıcı profiline oynatılan oturumlardan kişisel veri (PII) toplanmadan kaydedilmiştir.
  - **Sentetik Oturumlar (`kaynak=sentetik`):** **300 oturum (900 karar satırı)** — `data/hazirla.py` içinde sabit tohumla (`TOHUM=42`) üretilmiştir.
- **Veri Ayrımı (Sızıntı Önlemi):** `GroupShuffleSplit(test_size=0.25, random_state=42)` ile `oturum_id` bazında ayrılmıştır (Eğitim: 714 satır, Test: 240 satır). Aynı oturumun kararları hem eğitimde hem testte yer almaz.

---

## 4. Performans Metrikleri ve Eval Kapısı

Eğitimden önce [`spec.md` §6](../spec.md) içinde tanımlanan altın standart kabul eşikleri ve modelin test kümesi sonuçları:

| Metrik | Kabul Eşiği (Kapı) | Ölçülen Değer | Durum |
| :--- | :---: | :---: | :---: |
| **Test ROC-AUC (Tüm Test Kümesi, $n=240$)** | $\ge 0.7000$ | **0.7436** | ✅ GEÇTİ |
| **Test Recall (Riskli Sınıf, eşik $= 0.50$)** | $\ge 0.6000$ | **0.6514** | ✅ GEÇTİ |
| **ONNX vs. `sklearn` Maksimum Mutlak Fark** | $\le 1\times 10^{-4}$ | **$9.802\times 10^{-8}$** | ✅ GEÇTİ |
| *Test Precision (Riskli Sınıf)* | *(Bilgi amaçlı)* | *0.6698* | — |
| *Test Accuracy* | *(Bilgi amaçlı)* | *0.6958* | — |
| *Gerçek Veri Alt Kümesi ROC-AUC ($n=18$ test satırı)* | *(Bilgi amaçlı)* | *0.8500* | — |

---

## 5. Sınırlar, Etik ve Kullanılmaması Gereken Durumlar

1. **Soğuk Başlangıç (Sahne 1 Sınırı):** 1. karar sahnesinin başında `onceki_karar_suresi_sn`, `onceki_okuma_suresi_sn` ve `onceki_riskli_sayisi` değerleri `0` olduğu için model yalnızca oyuncunun beyan ettiği `seviye` ve o sahnede tutora sorduğu sorulardan çıkarım yapar. Modelin ayırt ediciliği 2. ve 3. sahnelerde belirgin biçimde daha yüksektir.
2. **Gerçek Veri Hacmi Sınırı:** Gerçek oturum sayısı 18 (54 satır) olup geri kalan 300 oturum sentetik üreticiden gelmektedir. Üretim ortamında Shadow Deployment aşamasında gerçek oturum oranı arttıkça model yeniden eğitilmelidir.
3. **Kullanılmaması Gereken Durumlar (Out-of-Scope):**
   - Bu model **yalnızca oyun içi pedagojik uyarlama** (ipucu derinleştirme, süre baskısını esnetme, Sokratik soru tetikleme) amacıyla tasarlanmıştır.
   - Öğrencilere **not vermek, işe alım değerlendirmesi yapmak veya resmi sınav puanlaması yapmak** için kesinlikle kullanılmamalıdır.
