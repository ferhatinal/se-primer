"""
SE Primer v2 — Hugging Face Hub Model Yayınlama Betiği (`hf_push.py`)

`model/` klasöründeki `model.onnx`, `config.json` ve `README.md` (Model Kartı) dosyalarını
Hugging Face Hub üzerindeki public model reposuna yükler ve commit'e sabitlenmiş
(pinned) `resolve/<commit>/model.onnx` URL'sini ekrana yazdırır.

Kullanım:
  $env:HF_TOKEN="hf_..."
  python hf_push.py --repo ferhatinal/se-primer-risk-radari
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

KOK = Path(__file__).resolve().parent
MODEL_DIR = KOK / "model"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default="ferhatinal/se-primer-risk-radari", help="Hugging Face repo ID (<kullanici>/<repo>)")
    args = parser.parse_args()

    token = os.environ.get("HF_TOKEN")
    api = HfApi(token=token)

    for dosya in ("model.onnx", "config.json", "README.md"):
        if not (MODEL_DIR / dosya).exists():
            print(f"HATA: {MODEL_DIR / dosya} bulunamadı. Önce `python train.py` çalıştırın.")
            return 1

    api.create_repo(repo_id=args.repo, repo_type="model", exist_ok=True, private=False)
    commit_info = api.upload_folder(
        repo_id=args.repo,
        repo_type="model",
        folder_path=str(MODEL_DIR),
        commit_message="Release se-primer-risk-radari v2.0.0 (ONNX + contract config.json + model card)",
    )
    oid = commit_info.oid
    print("\n=== HUGGING FACE YAYINI TAMAMLANDI ===")
    print(f"Repo URL           : https://huggingface.co/{args.repo}")
    print(f"Sabit Commit SHA   : {oid}")
    print(f"Sabit ONNX URL     : https://huggingface.co/{args.repo}/resolve/{oid}/model.onnx")
    print(f"Sabit Config URL   : https://huggingface.co/{args.repo}/resolve/{oid}/config.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
