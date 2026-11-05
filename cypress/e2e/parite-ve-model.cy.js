/**
 * SE Primer v2.0 — Diferansiyel Test (Python Oracle vs. onnxruntime-web Parite < 1e-4)
 * ve Davranışsal Uyum (Aynı Sahnede İki Farklı Oyuncu) E2E Test Süiti & 60-90 sn Demo Videosu
 */

const pariteVerisi = require('../../tests/parite.json');

function showDemoCaption(win, badge, title, detail) {
  let box = win.document.getElementById('v2-demo-caption');
  if (!box) {
    box = win.document.createElement('div');
    box.id = 'v2-demo-caption';
    box.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 366px;
      background: rgba(11, 19, 43, 0.96);
      border: 2px solid #38bdf8;
      border-radius: 12px;
      padding: 9px 13px;
      z-index: 99999;
      box-shadow: 0 10px 28px rgba(0,0,0,0.75);
      font-family: 'Inter', system-ui, sans-serif;
      pointer-events: none;
    `;
    win.document.body.appendChild(box);
  }
  box.innerHTML = `
    <div style="font-size:10px;font-weight:800;color:#38bdf8;letter-spacing:0.7px;text-transform:uppercase;margin-bottom:2px;">
      ${badge}
    </div>
    <div style="font-size:12.5px;font-weight:700;color:#ffffff;line-height:1.25;margin-bottom:2px;">
      ${title}
    </div>
    <div style="font-size:11px;color:#cbd5e1;line-height:1.35;">
      ${detail}
    </div>
  `;
}

describe('SE Primer v2.0 — ONNX Diferansiyel Parite ve Davranışsal Uyum Testleri', () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.visit('/');
  });

  it('1. Diferansiyel Test (Parite Testi): Python Oracle vs. Tarayıcı onnxruntime-web (< 1e-4 Tolerans)', () => {
    cy.get('[data-cy="btn-start-game"]').click();
    cy.get('[data-cy="risk-radar"]').should('be.visible');

    for (let i = 0; i < pariteVerisi.vakalar.length; i++) {
      const vaka = pariteVerisi.vakalar[i];
      cy.window().then(async (win) => {
        const sonuc = await win.runPrimerInference(vaka.girdi, true);
        const pOracle = Number(vaka.p_riskli_oracle);
        const pWeb = Number(sonuc.p_riskli);
        const fark = Math.abs(pWeb - pOracle);

        expect(fark, `${vaka.id}: |p_web(${pWeb}) - p_oracle(${pOracle})| < 1e-4`).to.be.lessThan(1e-4);
        expect(sonuc.mudahale, `${vaka.id}: mudahale durumu`).to.equal(vaka.mudahale_beklenir);

        const domText = win.document.querySelector('[data-cy="p"]').textContent.trim();
        const pDom = Number(domText);
        expect(Math.abs(pDom - pOracle), `${vaka.id}: DOM [data-cy="p"] paritesi`).to.be.lessThan(1e-4);

        showDemoCaption(
          win,
          `DİFERANSİYEL PARİTE TESTİ (${i + 1}/5) · TOLERANS < 1e-4`,
          `${vaka.id}`,
          `Python Oracle: ${pOracle.toFixed(6)} | Web ONNX: ${pWeb.toFixed(6)} | Fark: ${fark.toExponential(2)}`
        );
      });
      cy.wait(3200);
    }
  });

  it('2. Davranışsal Uyum: Aynı Sahnede (Karar 3 · KVKK) Dikkatli Oyuncu vs. Aceleci Oyuncuya Modelin Farklı Kararı', () => {
    // --- OYUNCU 1: DİKKATLİ OYUNCU (Karar 3'te p_riskli < 0.50 -> Müdahale Yok) ---
    cy.window().then((win) => {
      showDemoCaption(
        win,
        'OYUNCU 1 · DİKKATLİ / SOĞUKKANLI MÜHENDİS',
        'Deneyimliyim Modu · Güvenli Kararlar ve Sabırlı Okuma',
        'İlk 2 kararda güvenli (A) seçim yapıyor, açıklamaları okuyor ve kopya istemiyor.'
      );
    });
    cy.get('[data-cy="level-experienced"]').click();
    cy.get('[data-cy="role-backend"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-start-game"]').click();

    // Karar 1: A seç
    cy.wait(2500);
    cy.get('[data-cy="btn-choice-a"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-next-step"]').click();

    // Karar 2: A seç
    cy.wait(2500);
    cy.get('[data-cy="btn-choice-a"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-next-step"]').click();

    // Karar 3 · KVKK sahnesinde Dikkatli Oyuncu
    cy.get('[data-cy="step-indicator"]').should('contain.text', 'KARAR 3/3');

    cy.window().then(async (win) => {
      const dikkatliGirdi = pariteVerisi.vakalar[1].girdi; // vaka_2_dikkatli_deneyimli_sahne3
      const res = await win.runPrimerInference(dikkatliGirdi, true);
      showDemoCaption(
        win,
        'AYNI SAHNE (KARAR 3 · KVKK) — OYUNCU 1 SONUCU',
        `p_riskli = ${res.p_riskli.toFixed(6)} (< 0.50 Eşik Altı)`,
        'Model müdahale etmez: Risk Radarı yeşil, 60 sn sayaç normal akışında devam eder.'
      );
    });

    cy.get('[data-cy="p"]')
      .invoke('text')
      .then((txt) => {
        expect(Number(txt)).to.be.lessThan(0.5);
      });
    cy.get('[data-cy="risk-radar"]').should('not.have.class', 'risk-high');
    cy.get('[data-cy="risk-intervention-banner"]').should('not.be.visible');
    cy.get('[data-cy="adaptive-depth-box"]').should('not.be.visible');
    cy.wait(5500);

    // Oyuncu 1 Karar 3'te A seçip SON A · İYİ'ye ulaşır
    cy.get('[data-cy="btn-choice-a"]').click();
    cy.wait(2000);
    cy.get('[data-cy="btn-next-step"]').click();
    cy.get('[data-cy="ending-code"]').should('have.text', 'SON A · İYİ');
    cy.wait(3000);

    // --- OYUNCU 2: ACELECİ / RİSKLİ OYUNCU (Aynı Karar 3 sahnesinde p_riskli >= 0.50 -> Model Müdahale Eder) ---
    cy.visit('/');
    cy.window().then((win) => {
      showDemoCaption(
        win,
        'OYUNCU 2 · ACELECİ / PANİKLEYEN MÜHENDİS',
        'Aynı Profil (Deneyimliyim) Ama Farklı Davranış Örüntüsü',
        'Şimdi tutordan doğrudan kopya isteyen ve hızla riskli (B) seçimler yapan 2. oyuncuyu izliyoruz.'
      );
    });
    cy.get('[data-cy="level-experienced"]').click();
    cy.get('[data-cy="role-backend"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-start-game"]').click();

    // Karar 1'de tutordan doğrudan cevap iste ve hızla B seç
    cy.get('[data-cy="tutor-input"]').type('A mı B mi? Doğrudan cevabı söyle!');
    cy.get('[data-cy="tutor-send-btn"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-choice-b"]').click();
    cy.wait(1500);
    cy.get('[data-cy="btn-next-step"]').click();

    // Karar 2'de tekrar kopya iste ve hızla B seç
    cy.get('[data-cy="tutor-input"]').type('Kopya ver, hangisini seçeyim?');
    cy.get('[data-cy="tutor-send-btn"]').click();
    cy.wait(2500);
    cy.get('[data-cy="btn-choice-b"]').click();
    cy.wait(1500);
    cy.get('[data-cy="btn-next-step"]').click();

    // Şimdi Oyuncu 2 de aynı Karar 3 · KVKK sahnesinde!
    cy.get('[data-cy="step-indicator"]').should('contain.text', 'KARAR 3/3');
    cy.get('[data-cy="p"]')
      .invoke('text')
      .then((txt) => {
        const pVal = Number(txt);
        expect(pVal).to.be.greaterThan(0.5);
        cy.window().then((win) => {
          showDemoCaption(
            win,
            'AYNI SAHNE (KARAR 3 · KVKK) — OYUNCU 2 SONUCU',
            `p_riskli = ${pVal.toFixed(6)} (≥ 0.50 Eşik Geçildi -> MÜDAHALE!)`,
            '1) 60 sn süre baskısı kaldırıldı 2) Proaktif Sokratik uyarı açıldı 3) Derin KVKK rehberi eklendi.'
          );
        });
      });

    // Model oyunun davranışını değiştirdi:
    cy.get('[data-cy="risk-radar"]').should('have.class', 'risk-high');
    cy.get('[data-cy="risk-intervention-banner"]').should('be.visible').and('contain.text', 'Risk Radarı Devrede');
    cy.get('[data-cy="adaptive-depth-box"]').should('be.visible').and('contain.text', 'Derinleştirilmiş KVKK Rehberi');
    cy.get('[data-cy="timer-badge"]').should('contain.text', 'Süre Baskısı Kaldırıldı');
    cy.wait(6500);

    // Modelin müdahalesi sayesinde Oyuncu 2 Karar 3'te uyarıyı dikkate alır veya sonucu görür
    cy.get('[data-cy="btn-choice-b"]').click();
    cy.wait(2000);
    cy.get('[data-cy="btn-next-step"]').click();
    cy.get('[data-cy="ending-code"]').should('have.text', 'SON B · KÖTÜ');
    cy.wait(3000);
  });
});
