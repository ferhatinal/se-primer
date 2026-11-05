"""
SE Primer v2 — Sunucu Tarafı ONNX Model Tüketicisi (`api/server_api.py`, Bonus +10 Puan)

Aynı `model/model.onnx` ve `model/config.json` sözleşmesini yükler;
`GET /health`, `GET /config` ve `POST /predict` uç noktalarını sunar.
Python referans kahini (`tests/parite.py`) ve tarayıcı (`onnxruntime-web`) ile
`< 1e-4` hata toleransı dahilinde birebir aynı `p_riskli` olasılığını üretir.

Çalıştırma:
  python api/server_api.py                  # http://localhost:8000 üzerinde başlar
  python tests/parite.py --api http://localhost:8000
"""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import numpy as np
import onnxruntime as ort

KOK = Path(__file__).resolve().parents[1]
CONFIG = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
OZELLIKLER = CONFIG["girdi"]["ozellikler"]
KARAR_ESIGI = float(CONFIG["karar_esigi"])
SESSION = ort.InferenceSession(str(KOK / "model" / "model.onnx"), providers=["CPUExecutionProvider"])


def tahmin_et(payload: dict) -> dict:
    eksik = [k for k in OZELLIKLER if k not in payload]
    if eksik:
        raise ValueError(f"Sözleşme hatası — eksik özellikler: {eksik}")
    vektor = np.array([[float(payload[k]) for k in OZELLIKLER]], dtype=np.float32)
    probs = SESSION.run(["probabilities"], {"input": vektor})[0]
    p_riskli = float(probs[0, 1])
    return {
        "model_adi": CONFIG["model_adi"],
        "versiyon": CONFIG["versiyon"],
        "p_riskli": round(p_riskli, 6),
        "p_guvenli": round(float(probs[0, 0]), 6),
        "karar_esigi": KARAR_ESIGI,
        "mudahale": bool(p_riskli >= KARAR_ESIGI),
        "vektor": [float(payload[k]) for k in OZELLIKLER],
    }


class RiskRadariHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send_json(200, {"ok": True})

    def do_GET(self) -> None:
        if self.path == "/health" or self.path == "/":
            self._send_json(200, {
                "durum": "ayakta",
                "model_adi": CONFIG["model_adi"],
                "versiyon": CONFIG["versiyon"],
                "ozellikler": OZELLIKLER,
            })
        elif self.path == "/config":
            self._send_json(200, CONFIG)
        else:
            self._send_json(404, {"hata": "Uç nokta bulunamadı"})

    def do_POST(self) -> None:
        if self.path != "/predict":
            self._send_json(404, {"hata": "Yalnızca POST /predict desteklenir"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw)
            sonuc = tahmin_et(payload)
            self._send_json(200, sonuc)
        except Exception as exc:
            self._send_json(400, {"hata": str(exc)})

    def log_message(self, fmt: str, *args) -> None:
        return


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    server = HTTPServer(("0.0.0.0", port), RiskRadariHandler)
    print(f"Risk Radari ONNX API sunucusu calisiyor: http://localhost:{port}")
    server.serve_forever()
