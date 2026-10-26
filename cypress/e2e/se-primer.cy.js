/**
 * SE Primer — Kapsamlı Uçtan Uca (E2E) Cypress Test Süiti
 * Tüm kişiselleştirme modlarını, Sokratik AI Tutor kurallarını ve 8 karar yolunun tamamını test eder.
 */

describe('SE Primer — Yazılım Mühendisliği Karar Simülasyonu E2E Testleri', () => {
  beforeEach(() => {
    cy.viewport(390, 844); // Mobil ekran (iPhone 14/15)
    cy.visit('/');
  });

  it('1. Kişiselleştirme ve Sokratik AI Tutor Etkileşimi ("Yeni başladım" vs "Deneyimliyim")', () => {
    // Ekran 1: Giriş ekranı kontrolü ve ekran görüntüsü
    cy.get('[data-cy="screen-onboarding"]').should('be.visible');
    cy.get('[data-cy="hero-title"]').should('contain.text', '08:00, randevu sistemi çöktü. Nöbetçi sensin.');
    cy.wait(1200);
    cy.screenshot('1-giris-ekrani', { capture: 'viewport' });

    // "Yeni başladım" + "SRE / DevOps" + "Veri Güvenliği ve KVKK Uyum" seçimi
    cy.get('[data-cy="level-beginner"]').click();
    cy.get('[data-cy="role-sre"]').click();
    cy.get('[data-cy="goal-kvkk"]').click();
    cy.wait(800);
    cy.get('[data-cy="btn-start-game"]').click();

    // Sahne 1: Yeni başladım modunda ipucu açık, sayaç gizli olmalı
    cy.get('[data-cy="screen-scene"]').should('be.visible');
    cy.get('[data-cy="beginner-hint-card"]').should('be.visible');
    cy.get('[data-cy="timer-badge"]').should('not.be.visible');
    cy.get('[data-cy="profile-summary-bar"]')
      .should('contain.text', 'Yeni başladım')
      .and('contain.text', 'SRE / DevOps');

    // Sokratik AI Tutor ilk soruyu sormalı
    cy.get('[data-cy="tutor-msg-ai"]')
      .first()
      .should('contain.text', 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?');

    // Öğrenci doğrudan cevabı istediğinde AI Tutor cevabı ele vermemeli, soru sormalı
    cy.get('[data-cy="tutor-input"]').type('A mı seçmeliyim B mi? Doğrudan cevabı söyle!');
    cy.get('[data-cy="tutor-send-btn"]').click();
    cy.wait(1000);

    cy.get('[data-cy="tutor-msg-ai"]')
      .last()
      .invoke('text')
      .then((replyText) => {
        const lower = replyText.toLowerCase();
        expect(lower).to.not.include('a şıkkını seç');
        expect(lower).to.not.include('b şıkkını seç');
        expect(replyText.trim()).to.match(/\?”$/);
      });

    // Karar 1'de A seçildiğinde "Ne oldu" ve "Neden oldu" görünmeli (Görünmez varsayım kabul kriteri)
    cy.get('[data-cy="btn-choice-a"]').click();
    cy.get('[data-cy="feedback-card"]').should('be.visible');
    cy.get('[data-cy="feedback-what"]').should('not.be.empty');
    cy.get('[data-cy="feedback-why"]').should('not.be.empty');
    cy.wait(1200);
    cy.screenshot('2-sahne-karar-ekrani', { capture: 'viewport' });

    // Şimdi "Deneyimliyim" modunu ve 60 sn süre baskısını doğrula
    cy.visit('/');
    cy.get('[data-cy="level-experienced"]').click();
    cy.get('[data-cy="btn-start-game"]').click();
    cy.get('[data-cy="beginner-hint-card"]').should('not.be.visible');
    cy.get('[data-cy="timer-badge"]').should('be.visible').and('contain.text', '60 sn');
    cy.wait(1200);
  });

  // Tüm 8 Karar Yolunun (2^3 = 8) Uçtan Uca (E2E) Test Edilmesi
  const allPaths = [
    {
      pathName: 'Yol 1: A -> A -> A (Kusursuz Mühendislik)',
      choices: ['a', 'a', 'a'],
      expectedCode: 'SON A · İYİ',
      expectedHeadline: '08:25 sistem ayakta, veri güvende',
      captureEndingScreenshot: true
    },
    {
      pathName: 'Yol 2: A -> A -> B (KVKK İhlali)',
      choices: ['a', 'a', 'b'],
      expectedCode: 'SON B · KÖTÜ',
      expectedHeadline: 'Sistem ayakta ama KVKK ihlali',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 3: A -> B -> A (Rollback + Hızlı Yayın + Maskeleme)',
      choices: ['a', 'b', 'a'],
      expectedCode: 'SON A · İYİ',
      expectedHeadline: '08:25 sistem ayakta, veri güvende',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 4: A -> B -> B (Test Atlandı + KVKK İhlali)',
      choices: ['a', 'b', 'b'],
      expectedCode: 'SON B · KÖTÜ',
      expectedHeadline: 'Sistem ayakta ama KVKK ihlali',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 5: B -> A -> A (Canlı Yama + Kısa Test + Maskeleme)',
      choices: ['b', 'a', 'a'],
      expectedCode: 'SON A · İYİ',
      expectedHeadline: '08:25 sistem ayakta, veri güvende',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 6: B -> A -> B (Canlı Yama + KVKK İhlali)',
      choices: ['b', 'a', 'b'],
      expectedCode: 'SON B · KÖTÜ',
      expectedHeadline: 'Sistem ayakta ama KVKK ihlali',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 7: B -> B -> A (Testsiz Canlı Yama Çökmesi)',
      choices: ['b', 'b', 'a'],
      expectedCode: 'SON B · KÖTÜ',
      expectedHeadline: 'Sistem ayakta ama KVKK ihlali',
      captureEndingScreenshot: false
    },
    {
      pathName: 'Yol 8: B -> B -> B (Tam Kriz ve KVKK İhlali)',
      choices: ['b', 'b', 'b'],
      expectedCode: 'SON B · KÖTÜ',
      expectedHeadline: 'Sistem ayakta ama KVKK ihlali',
      captureEndingScreenshot: false
    }
  ];

  allPaths.forEach((scenario, idx) => {
    it(`2.${idx + 1} E2E Durum Geçiş Testi — ${scenario.pathName}`, () => {
      // Kişiselleştirme seçimi
      if (idx % 2 === 0) {
        cy.get('[data-cy="level-beginner"]').click();
        cy.get('[data-cy="role-backend"]').click();
        cy.get('[data-cy="goal-uptime"]').click();
      } else {
        cy.get('[data-cy="level-experienced"]').click();
        cy.get('[data-cy="role-security"]').click();
        cy.get('[data-cy="goal-kvkk"]').click();
      }

      cy.get('[data-cy="btn-start-game"]').click();

      // 3 Karar Adımı
      scenario.choices.forEach((choiceLetter, stepIdx) => {
        cy.get('[data-cy="step-indicator"]').should('contain.text', `KARAR ${stepIdx + 1}/3`);
        cy.wait(500);
        cy.get(`[data-cy="btn-choice-${choiceLetter}"]`).click();

        // Her seçimden sonra Ne Oldu & Neden Oldu kartı doğrulanır
        cy.get('[data-cy="feedback-card"]').should('be.visible');
        cy.get('[data-cy="feedback-what"]').should('not.be.empty');
        cy.get('[data-cy="feedback-why"]').should('not.be.empty');
        cy.wait(600);
        cy.get('[data-cy="btn-next-step"]').click();
      });

      // Sonuç Ekranı Doğrulaması
      cy.get('[data-cy="screen-ending"]').should('be.visible');
      cy.get('[data-cy="ending-code"]').should('have.text', scenario.expectedCode);
      cy.get('[data-cy="ending-headline"]').should('have.text', scenario.expectedHeadline);
      cy.get('[data-cy="timeline-step-1"]').should('be.visible');
      cy.get('[data-cy="timeline-step-2"]').should('be.visible');
      cy.get('[data-cy="timeline-step-3"]').should('be.visible');
      cy.wait(1000);

      if (scenario.captureEndingScreenshot) {
        cy.screenshot('3-sonuc-ekrani', { capture: 'viewport' });
      }
    });
  });
});
