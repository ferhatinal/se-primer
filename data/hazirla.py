"""
data/oturumlar.csv dosyasını üretir:
  1) Sentetik oturumları sabit tohumla üretir (kaynak=sentetik)
  2) data/gercek/*.csv altındaki, uygulamanın Veri Toplama Modu'ndan indirilen
     gerçek oturumları ekler (kaynak=gercek)

Çalıştırma: python data/hazirla.py

SENTETİK ÜRETİCİ KURALI (README.md'de de yazılıdır)
-------------------------------------------------
Her sentetik oturum için gizli bir "dikkat" değeri d ~ Uniform(0, 1) çekilir
(0 = aceleci, 1 = dikkatli) ve seviye ~ Bernoulli(0.5).
Her karar k = 1, 2, 3 için:
  karar_suresi_sn  = exp(Normal(ln(3 + 22*d), 0.45))
  okuma_suresi_sn  = exp(Normal(ln(1.2 + 14*d), 0.50))
  tutor_soru_sayisi ~ Poisson(0.2 + 0.9*d)
  bu sahnede cevap isteme ~ Bernoulli(0.45 * (1 - d))
  logit = 0.9 - 3.2*d + 0.55*onceki_riskli_sayisi + 0.5*cevap_isteme_sayisi
          - 0.35*seviye + 0.15*(k == 3) + Normal(0, 0.6)
  riskli_secim ~ Bernoulli(sigmoid(logit))
Model d'yi görmez; yalnızca önceki kararlardaki davranış izlerini (süre, okuma,
kopya isteme) görür. Bu yüzden sahne 1'de bilgi azdır, sahne 2-3'te artar.
"""
from pathlib import Path
import glob

import numpy as np
import pandas as pd

TOHUM = 42
SENTETIK_OTURUM = 300
KOK = Path(__file__).resolve().parent

SUTUNLAR = [
    "oturum_id", "kaynak", "seviye", "rol", "hedef", "sahne_no",
    "onceki_karar_suresi_sn", "onceki_okuma_suresi_sn", "onceki_riskli_sayisi",
    "tutor_soru_sayisi", "cevap_isteme_sayisi",
    "karar_suresi_sn", "okuma_suresi_sn", "secim", "riskli_secim",
]


def sentetik_uret(n_oturum: int, tohum: int) -> pd.DataFrame:
    rng = np.random.default_rng(tohum)
    satirlar = []
    for _ in range(n_oturum):
        oturum_id = "".join(rng.choice(list("0123456789abcdef"), size=8))
        d = rng.uniform(0, 1)
        seviye = int(rng.random() < 0.5)
        rol = int(rng.integers(0, 3))
        hedef = int(rng.integers(0, 3))
        onceki_karar, onceki_okuma, onceki_riskli, cevap_isteme = 0.0, 0.0, 0, 0
        for k in (1, 2, 3):
            karar = float(np.exp(rng.normal(np.log(3 + 22 * d), 0.45)))
            okuma = float(np.exp(rng.normal(np.log(1.2 + 14 * d), 0.50)))
            tutor = int(rng.poisson(0.2 + 0.9 * d))
            cevap_isteme += int(rng.random() < 0.45 * (1 - d))
            logit = (0.9 - 3.2 * d + 0.55 * onceki_riskli + 0.5 * cevap_isteme
                     - 0.35 * seviye + 0.15 * (k == 3) + rng.normal(0, 0.6))
            riskli = int(rng.random() < 1 / (1 + np.exp(-logit)))
            satirlar.append({
                "oturum_id": oturum_id, "kaynak": "sentetik",
                "seviye": seviye, "rol": rol, "hedef": hedef, "sahne_no": k,
                "onceki_karar_suresi_sn": round(onceki_karar, 2),
                "onceki_okuma_suresi_sn": round(onceki_okuma, 2),
                "onceki_riskli_sayisi": onceki_riskli,
                "tutor_soru_sayisi": tutor,
                "cevap_isteme_sayisi": cevap_isteme,
                "karar_suresi_sn": round(karar, 2),
                "okuma_suresi_sn": round(okuma, 2),
                "secim": "B" if riskli else "A",
                "riskli_secim": riskli,
            })
            onceki_karar, onceki_okuma = karar, okuma
            onceki_riskli += riskli
    return pd.DataFrame(satirlar, columns=SUTUNLAR)


def gercek_oku() -> pd.DataFrame:
    dosyalar = sorted(glob.glob(str(KOK / "gercek" / "*.csv")))
    if not dosyalar:
        return pd.DataFrame(columns=SUTUNLAR)
    df = pd.concat([pd.read_csv(f) for f in dosyalar], ignore_index=True)
    df["kaynak"] = "gercek"
    df = df.drop_duplicates(subset=["oturum_id", "sahne_no"])
    return df[SUTUNLAR]


if __name__ == "__main__":
    sentetik = sentetik_uret(SENTETIK_OTURUM, TOHUM)
    gercek = gercek_oku()
    hepsi = pd.concat([gercek, sentetik], ignore_index=True) if len(gercek) else sentetik
    hepsi.to_csv(KOK / "oturumlar.csv", index=False)
    n_gercek_oturum = gercek["oturum_id"].nunique() if len(gercek) else 0
    print(f"oturumlar.csv yazıldı: {len(hepsi)} satır "
          f"(gerçek: {len(gercek)} satır / {n_gercek_oturum} oturum, "
          f"sentetik: {len(sentetik)} satır / {SENTETIK_OTURUM} oturum)")
    if n_gercek_oturum < 15:
        print(f"UYARI: Ödev en az 15 gerçek oturum istiyor; şu an {n_gercek_oturum}.")
