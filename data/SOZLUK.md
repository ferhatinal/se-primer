# Veri Sözlüğü — `data/oturumlar.csv`

**Bir satır = bir oturumdaki bir karar.** Her oturumda 3 karar olduğu için her oturum 3 satır üretir.

**Gizlilik (KVKK):** Ad, e-posta, cihaz kimliği, IP, konum, tarayıcı bilgisi veya zaman damgası **toplanmaz**. `oturum_id` her oturum başında tarayıcıda rastgele üretilir (`crypto.getRandomValues`). Kişiyle eşleştirilemez.

| Sütun | Tip | Birim / Değerler | Açıklama | Modelde? |
| :--- | :--- | :--- | :--- | :---: |
| `oturum_id` | metin | 8 karakter hex | Rastgele oturum kimliği. Yalnızca grup bazlı train/test ayrımı için kullanılır | Hayır |
| `kaynak` | metin | `gercek` \| `sentetik` | Satırın gerçek bir insan oturumundan mı, sentetik üreticiden mi geldiği | Hayır |
| `seviye` | tam sayı | `0` = Yeni başladım, `1` = Deneyimliyim | Girişteki 1. soru | **Evet (1)** |
| `rol` | tam sayı | `0` = Backend, `1` = SRE/DevOps, `2` = Güvenlik/KVKK | Girişteki 2. soru | Hayır |
| `hedef` | tam sayı | `0` = Uptime, `1` = KVKK Uyum, `2` = Kök Neden | Girişteki 3. soru | Hayır |
| `sahne_no` | tam sayı | `1`, `2`, `3` | Karar sırası (1 = Mimari, 2 = Test, 3 = KVKK) | **Evet (2)** |
| `onceki_karar_suresi_sn` | ondalık | saniye | Bir önceki kararda sahne açılışından A/B tıklamasına kadar geçen süre. Sahne 1'de `0` | **Evet (3)** |
| `onceki_okuma_suresi_sn` | ondalık | saniye | Bir önceki kararda "Ne oldu?" kartı açıldıktan sonra "Sonraki" butonuna basılana kadar geçen süre. Açıklamayı okuyup okumadığının göstergesi. Sahne 1'de `0` | **Evet (4)** |
| `onceki_riskli_sayisi` | tam sayı | `0`–`2` | Bu karardan önce kaç kez B seçildiği | **Evet (5)** |
| `tutor_soru_sayisi` | tam sayı | adet | **Bu sahnede**, karar verilene kadar tutora gönderilen mesaj sayısı | **Evet (6)** |
| `cevap_isteme_sayisi` | tam sayı | adet | Oturum başından bu karara kadar tutora "cevabı söyle / A mı B mi / kopya ver" türü mesaj sayısı (uygulamadaki aynı anahtar kelime kuralıyla tespit edilir) | **Evet (7)** |
| `karar_suresi_sn` | ondalık | saniye | **Bu** kararın süresi. Sonraki satırın `onceki_karar_suresi_sn` değerini üretir. Karar anında bilinmediği için modelde **kullanılmaz** (sızıntı önlemi) | Hayır |
| `okuma_suresi_sn` | ondalık | saniye | **Bu** kararın "Ne oldu?" okuma süresi. Karardan sonra oluştuğu için modelde kullanılmaz | Hayır |
| `secim` | metin | `A` \| `B` | Oyuncunun seçimi | Hayır |
| `riskli_secim` | tam sayı | `0` \| `1` | **Hedef (etiket).** `secim = B` ise 1 | **Hedef** |

## Veri kaynakları

- **Gerçek (`kaynak=gercek`):** Uygulama `?veri=1` parametresiyle açıldığında **Veri Toplama Modu**na geçer. Bu modda model kapalıdır, böylece model müdahalesi etiketleri bozmaz. Her oturumun sonunda satırlar tarayıcının yerel deposuna yazılır. "CSV indir" butonuyla dışa aktarılır. İndirilen dosyalar `data/gercek/` klasörüne konur ve `python data/hazirla.py` ile birleştirilir.
- **Sentetik (`kaynak=sentetik`):** [`data/hazirla.py`](./hazirla.py) ile üretilir. Üretici kuralı ve tohum [`README.md`](../README.md) dosyasında yazılıdır.
