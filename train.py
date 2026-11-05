"""
SE Primer v2 — "Risk Radarı" modelini eğitir, ölçer ve paketler.

Tek komut:  python train.py

Akış:
  data/oturumlar.csv  ->  grup bazlı train/test (oturum_id, random_state=42)
  ->  StandardScaler + LogisticRegression
  ->  EVAL KAPISI (spec.md §6: AUC >= 0.70, Recall >= 0.60, ONNX farkı <= 1e-4)
  ->  geçerse model/model.onnx + model/config.json; geçmezse çıkış kodu 1, artefakt YOK
"""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
from datetime import date
from pathlib import Path

import numpy as np
import onnxruntime as ort
import pandas as pd
import sklearn
import skl2onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

KOK = Path(__file__).resolve().parent
VERI = KOK / "data" / "oturumlar.csv"
MODEL_DIR = KOK / "model"

RANDOM_STATE = 42
TEST_ORANI = 0.25
VERSIYON = "2.0.0"

# Sözleşme: özellik adları ve SIRASI. İstemciler (web, Python oracle, sunucu) bu sırayla gönderir.
OZELLIKLER = [
    "seviye",
    "sahne_no",
    "onceki_karar_suresi_sn",
    "onceki_okuma_suresi_sn",
    "onceki_riskli_sayisi",
    "tutor_soru_sayisi",
    "cevap_isteme_sayisi",
]
HEDEF = "riskli_secim"
SINIFLAR = ["guvenli", "riskli"]  # 0, 1

# spec.md §6 — eğitimden ÖNCE yazılmış kabul eşikleri. Burada DEĞİŞTİRİLMEZ.
ESIK_AUC = 0.70
ESIK_RECALL = 0.60
ESIK_ONNX_FARK = 1e-4
KARAR_ESIGI = 0.50


def onnx_aktar(model: Pipeline, X_ornek: np.ndarray, yol: Path) -> float:
    """sklearn -> ONNX. Olasılık çıktısını sklearn ile karşılaştırır, maksimum mutlak farkı döndürür."""
    onx = convert_sklearn(
        model,
        initial_types=[("input", FloatTensorType([None, len(OZELLIKLER)]))],
        options={id(model.named_steps["clf"]): {"zipmap": False}},
        target_opset=17,
    )
    yol.write_bytes(onx.SerializeToString())

    sess = ort.InferenceSession(str(yol), providers=["CPUExecutionProvider"])
    p_onnx = sess.run(["probabilities"], {"input": X_ornek.astype(np.float32)})[0][:, 1]
    p_skl = model.predict_proba(X_ornek.astype(np.float32))[:, 1]
    return float(np.max(np.abs(p_onnx - p_skl)))


def main() -> int:
    global VERI
    if "--veri" in sys.argv:  # test amaçlı: farklı veri dosyasıyla kapıyı denemek için
        VERI = Path(sys.argv[sys.argv.index("--veri") + 1]).resolve()
    df = pd.read_csv(VERI)
    X = df[OZELLIKLER].to_numpy(dtype=np.float32)
    y = df[HEDEF].to_numpy(dtype=int)
    gruplar = df["oturum_id"].to_numpy()

    gss = GroupShuffleSplit(n_splits=1, test_size=TEST_ORANI, random_state=RANDOM_STATE)
    tr, te = next(gss.split(X, y, gruplar))

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=RANDOM_STATE)),
    ])
    model.fit(X[tr], y[tr])

    p_te = model.predict_proba(X[te])[:, 1]
    yhat = (p_te >= KARAR_ESIGI).astype(int)
    metrikler = {
        "test_auc": round(float(roc_auc_score(y[te], p_te)), 4),
        "test_recall_riskli": round(float(recall_score(y[te], yhat)), 4),
        "test_precision_riskli": round(float(precision_score(y[te], yhat, zero_division=0)), 4),
        "test_accuracy": round(float(accuracy_score(y[te], yhat)), 4),
        "n_train_satir": int(len(tr)),
        "n_test_satir": int(len(te)),
        "test_riskli_orani": round(float(y[te].mean()), 4),
    }

    # Bilgi amaçlı: yalnız gerçek satırlar (test kümesindeki)
    gercek_te = te[df.iloc[te]["kaynak"].to_numpy() == "gercek"]
    if len(gercek_te) >= 10 and len(set(y[gercek_te])) == 2:
        metrikler["gercek_test_auc"] = round(float(roc_auc_score(y[gercek_te], model.predict_proba(X[gercek_te])[:, 1])), 4)
    else:
        metrikler["gercek_test_auc"] = None
    metrikler["n_gercek_test_satir"] = int(len(gercek_te))

    # ONNX'i önce geçici klasöre yaz; kapılar geçerse model/ altına taşı
    tmp = Path(tempfile.mkdtemp())
    onnx_tmp = tmp / "model.onnx"
    onnx_fark = onnx_aktar(model, X, onnx_tmp)
    metrikler["onnx_sklearn_max_fark"] = float(f"{onnx_fark:.3e}")

    kapilar = {
        f"AUC >= {ESIK_AUC}": metrikler["test_auc"] >= ESIK_AUC,
        f"Recall(riskli) >= {ESIK_RECALL}": metrikler["test_recall_riskli"] >= ESIK_RECALL,
        f"ONNX farkı <= {ESIK_ONNX_FARK}": onnx_fark <= ESIK_ONNX_FARK,
    }

    print("\n=== METRİKLER ===")
    for k, v in metrikler.items():
        print(f"  {k:28s} {v}")
    print("\n=== EVAL KAPISI (spec.md §6) ===")
    for k, ok in kapilar.items():
        print(f"  [{'GEÇTİ' if ok else 'KALDI'}] {k}")

    if not all(kapilar.values()):
        shutil.rmtree(tmp, ignore_errors=True)
        print("\nHATA: Kabul eşiği geçilemedi. Model YAYINLANMADI, model/ klasörüne artefakt yazılmadı.")
        return 1

    clf = model.named_steps["clf"]
    config = {
        "model_adi": "se-primer-risk-radari",
        "versiyon": VERSIYON,
        "egitim_tarihi": date.today().isoformat(),
        "gorev": "Oyuncunun mevcut kararda riskli seçeneği (B) seçme olasılığını tahmin etmek",
        "girdi": {
            "onnx_girdi_adi": "input",
            "tip": "float32",
            "boyut": [None, len(OZELLIKLER)],
            "ozellikler": OZELLIKLER,
        },
        "cikti": {
            "onnx_cikti_adi": "probabilities",
            "siniflar": SINIFLAR,
            "kullanilacak_indeks": 1,
            "aciklama": "probabilities[:, 1] = p_riskli",
        },
        "karar_esigi": KARAR_ESIGI,
        "kabul_esikleri": {"test_auc": ESIK_AUC, "test_recall_riskli": ESIK_RECALL, "onnx_sklearn_max_fark": ESIK_ONNX_FARK},
        "metrikler": metrikler,
        "veri": {
            "dosya": "data/oturumlar.csv",
            "sha256": hashlib.sha256(VERI.read_bytes()).hexdigest(),
            "n_satir": int(len(df)),
            "n_oturum": int(df["oturum_id"].nunique()),
            "n_gercek_oturum": int(df.loc[df["kaynak"] == "gercek", "oturum_id"].nunique()),
            "n_sentetik_oturum": int(df.loc[df["kaynak"] == "sentetik", "oturum_id"].nunique()),
        },
        "egitim": {
            "algoritma": "StandardScaler + LogisticRegression(class_weight=balanced)",
            "random_state": RANDOM_STATE,
            "bolme": f"GroupShuffleSplit(test_size={TEST_ORANI}, gruplar=oturum_id)",
            "katsayilar_olcekli": dict(zip(OZELLIKLER, [round(float(c), 4) for c in clf.coef_[0]])),
            "sabit": round(float(clf.intercept_[0]), 4),
        },
        "surumler": {
            "python": sys.version.split()[0],
            "sklearn": sklearn.__version__,
            "skl2onnx": skl2onnx.__version__,
            "onnxruntime": ort.__version__,
            "onnx_opset": 17,
        },
        "json_semasi": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "RiskRadariIstegi",
            "type": "object",
            "required": OZELLIKLER,
            "additionalProperties": False,
            "properties": {
                "seviye": {"type": "integer", "enum": [0, 1]},
                "sahne_no": {"type": "integer", "enum": [1, 2, 3]},
                "onceki_karar_suresi_sn": {"type": "number", "minimum": 0},
                "onceki_okuma_suresi_sn": {"type": "number", "minimum": 0},
                "onceki_riskli_sayisi": {"type": "integer", "minimum": 0, "maximum": 2},
                "tutor_soru_sayisi": {"type": "integer", "minimum": 0},
                "cevap_isteme_sayisi": {"type": "integer", "minimum": 0},
            },
        },
    }

    MODEL_DIR.mkdir(exist_ok=True)
    shutil.move(str(onnx_tmp), MODEL_DIR / "model.onnx")
    (MODEL_DIR / "config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"\nTAMAM: Tüm kapılar geçti. model/model.onnx ve model/config.json yazıldı (v{VERSIYON}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
