"""
Eval kapısı testi: etiketleri karıştırılmış (anlamsız) veriyle train.py çalıştırılır.
Beklenen: çıkış kodu 1 ve model/ klasöründeki artefaktların DEĞİŞMEMESİ.

Çalıştırma: python tests/test_eval_kapisi.py
"""
import hashlib
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

KOK = Path(__file__).resolve().parents[1]
ONNX = KOK / "model" / "model.onnx"


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else "-"


df = pd.read_csv(KOK / "data" / "oturumlar.csv")
df["riskli_secim"] = np.random.default_rng(0).permutation(df["riskli_secim"].to_numpy())
tmp = Path(tempfile.mkdtemp()) / "karisik.csv"
df.to_csv(tmp, index=False)

once = sha(ONNX)
sonuc = subprocess.run([sys.executable, str(KOK / "train.py"), "--veri", str(tmp)], capture_output=True, text=True, encoding="utf-8")
sonra = sha(ONNX)

print(sonuc.stdout[-600:])
assert sonuc.returncode == 1, f"Beklenen çıkış kodu 1, gelen {sonuc.returncode}"
assert once == sonra, "Eşik altı modelde model.onnx değişmemeliydi!"
print("TEST GEÇTİ: Etiketleri karıştırılmış veride kapı modeli durdurdu, artefakt değişmedi.")
