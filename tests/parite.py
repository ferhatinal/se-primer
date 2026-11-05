"""
SE Primer v2 — Test Kahini (Oracle) ve Diferansiyel Parite Betiği (`tests/parite.py`)

5 referans girdi üzerinde `model/model.onnx` modelini Python `onnxruntime` ile çalıştırır,
`tests/parite.json` referans dosyasını üretir / doğrular ve isteğe bağlı olarak
FastAPI sunucusu (`--api http://localhost:8000`) ile parite (< 1e-4) kontrolü yapar.

Kullanım:
  python tests/parite.py                 # parite.json doğrular (yoksa veya --yaz ile günceller)
  python tests/parite.py --yaz           # parite.json dosyasını model.onnx'ten yeniden üretir
  python tests/parite.py --api http://localhost:8000  # Sunucu tüketicisiyle parite testi yapar
"""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort

KOK = Path(__file__).resolve().parents[1]
MODEL_YOLU = KOK / "model" / "model.onnx"
CONFIG_YOLU = KOK / "model" / "config.json"
PARITE_YOLU = Path(__file__).resolve().parent / "parite.json"
TOLERANS = 1e-4

REFERANS_VAKALAR = [
    {
        "id": "vaka_1_dikkatli_yeni_sahne2",
        "aciklama": "Yeni başlayan dikkatli oyuncu: 1. kararda 16 sn düşündü, 10 sn okudu, A seçti ve tutorla konuştu.",
        "girdi": {
            "seviye": 0,
            "sahne_no": 2,
            "onceki_karar_suresi_sn": 16.0,
            "onceki_okuma_suresi_sn": 10.0,
            "onceki_riskli_sayisi": 0,
            "tutor_soru_sayisi": 1,
            "cevap_isteme_sayisi": 0,
        },
    },
    {
        "id": "vaka_2_dikkatli_deneyimli_sahne3",
        "aciklama": "Deneyimli soğukkanlı oyuncu: İlk iki kararda güvenli (A) gitti, açıklamaları 11 sn okudu, kopya istemedi.",
        "girdi": {
            "seviye": 1,
            "sahne_no": 3,
            "onceki_karar_suresi_sn": 18.5,
            "onceki_okuma_suresi_sn": 11.0,
            "onceki_riskli_sayisi": 0,
            "tutor_soru_sayisi": 1,
            "cevap_isteme_sayisi": 0,
        },
    },
    {
        "id": "vaka_3_sinirda_kararsiz_sahne2",
        "aciklama": "Orta hızda ilerleyen, henüz riskli seçim yapmamış ancak tutora hiç soru sormamış yeni oyuncu.",
        "girdi": {
            "seviye": 0,
            "sahne_no": 2,
            "onceki_karar_suresi_sn": 7.5,
            "onceki_okuma_suresi_sn": 4.5,
            "onceki_riskli_sayisi": 0,
            "tutor_soru_sayisi": 0,
            "cevap_isteme_sayisi": 0,
        },
    },
    {
        "id": "vaka_4_kopya_isteyen_sahne2",
        "aciklama": "1. kararda hızlıca B seçip açıklamayı 2 sn'de geçen ve tutordan doğrudan şık isteyen oyuncu.",
        "girdi": {
            "seviye": 0,
            "sahne_no": 2,
            "onceki_karar_suresi_sn": 4.0,
            "onceki_okuma_suresi_sn": 2.0,
            "onceki_riskli_sayisi": 1,
            "tutor_soru_sayisi": 1,
            "cevap_isteme_sayisi": 1,
        },
    },
    {
        "id": "vaka_5_yuksek_riskli_aceleci_sahne3",
        "aciklama": "Deneyimli modda panikleyen oyuncu: İlk 2 kararda B seçti, 1.5 sn okudu ve 2 kez cevabı doğrudan istedi.",
        "girdi": {
            "seviye": 1,
            "sahne_no": 3,
            "onceki_karar_suresi_sn": 3.0,
            "onceki_okuma_suresi_sn": 1.5,
            "onceki_riskli_sayisi": 2,
            "tutor_soru_sayisi": 0,
            "cevap_isteme_sayisi": 2,
        },
    },
]


def python_oracle_tahmin(sess: ort.InferenceSession, ozellik_sirasi: list[str], girdi: dict) -> float:
    vektor = np.array([[float(girdi[k]) for k in ozellik_sirasi]], dtype=np.float32)
    probs = sess.run(["probabilities"], {"input": vektor})[0]
    return float(probs[0, 1])


def main() -> int:
    cfg = json.loads(CONFIG_YOLU.read_text(encoding="utf-8"))
    ozellik_sirasi = cfg["girdi"]["ozellikler"]
    esik = float(cfg["karar_esigi"])
    sess = ort.InferenceSession(str(MODEL_YOLU), providers=["CPUExecutionProvider"])

    yaz_modu = "--yaz" in sys.argv or not PARITE_YOLU.exists()

    if yaz_modu:
        kayitlar = []
        for v in REFERANS_VAKALAR:
            p = python_oracle_tahmin(sess, ozellik_sirasi, v["girdi"])
            kayitlar.append({
                "id": v["id"],
                "aciklama": v["aciklama"],
                "girdi": v["girdi"],
                "vektor": [float(v["girdi"][k]) for k in ozellik_sirasi],
                "p_riskli_oracle": round(p, 6),
                "mudahale_beklenir": bool(p >= esik),
            })
        cikti = {
            "model_adi": cfg["model_adi"],
            "versiyon": cfg["versiyon"],
            "tolerans": TOLERANS,
            "karar_esigi": esik,
            "ozellik_sirasi": ozellik_sirasi,
            "vakalar": kayitlar,
        }
        PARITE_YOLU.write_text(json.dumps(cikti, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"parite.json yazıldı ({len(kayitlar)} referans vaka).")

    referans = json.loads(PARITE_YOLU.read_text(encoding="utf-8"))
    print("\n=== PYTHON ORACLE PARİTE KONTROLÜ ===")
    max_fark = 0.0
    for v in referans["vakalar"]:
        p_now = python_oracle_tahmin(sess, ozellik_sirasi, v["girdi"])
        fark = abs(p_now - float(v["p_riskli_oracle"]))
        max_fark = max(max_fark, fark)
        durum = "OK" if fark < TOLERANS else "HATA"
        print(f"  [{durum}] {v['id']:36s} oracle={v['p_riskli_oracle']:.6f}  hesap={p_now:.6f}  fark={fark:.2e}  mudahale={v['mudahale_beklenir']}")

    if max_fark >= TOLERANS:
        print(f"HATA: Maksimum fark {max_fark:.2e} >= {TOLERANS}")
        return 1

    if "--api" in sys.argv:
        api_base = sys.argv[sys.argv.index("--api") + 1].rstrip("/")
        print(f"\n=== SUNUCU (API) DİFERANSİYEL PARİTE TESTİ ({api_base}) ===")
        for v in referans["vakalar"]:
            req = urllib.request.Request(
                f"{api_base}/predict",
                data=json.dumps(v["girdi"]).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            p_api = float(body["p_riskli"])
            fark = abs(p_api - float(v["p_riskli_oracle"]))
            assert fark < TOLERANS, f"API parite hatası ({v['id']}): fark={fark}"
            print(f"  [OK] {v['id']:36s} oracle={v['p_riskli_oracle']:.6f}  api={p_api:.6f}  fark={fark:.2e}")

    print(f"\nTAMAM: Tüm referans vakalarda parite doğrulandı (max fark = {max_fark:.2e} < {TOLERANS}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
