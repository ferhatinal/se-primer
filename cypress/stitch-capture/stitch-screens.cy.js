/**
 * Google Stitch'ten .zip ile dışa aktarılan 3 mobil ekranın (code.html)
 * 390x844 mobil görünümde PNG görüntüsünü alır.
 * Çalıştırma: npm run stitch:capture
 */

const BASE = '/design/stitch/stitch_se_primer_simulation_app';

const SCREENS = [
  { dir: 'se_primer_kriz_sim_lasyonu', name: '1-giris-ekrani' },
  { dir: 'kriz_karar_konsolu', name: '2-sahne-karar-ekrani' },
  { dir: 'post_mortem_de_erlendirme', name: '3-sonuc-ekrani' }
];

describe('Stitch ekranlarının PNG görüntüsü', () => {
  SCREENS.forEach(({ dir, name }) => {
    it(name, () => {
      cy.viewport(390, 844);
      cy.visit(`${BASE}/${dir}/code.html`);
      cy.wait(2500); // Tailwind CDN ve fontların yüklenmesi için
      // Tam sayfa çekimde sabit (fixed/sticky) başlık ve alt menünün her karede tekrar etmemesi için
      // üsttekileri sayfanın başına (absolute), alttakileri sayfanın sonuna (static) sabitliyoruz.
      cy.window().then((win) => {
        const vh = win.innerHeight;
        win.document.querySelectorAll('*').forEach((el) => {
          const pos = win.getComputedStyle(el).position;
          if (pos === 'fixed' || pos === 'sticky') {
            const rect = el.getBoundingClientRect();
            el.style.position = rect.top < vh / 2 ? 'absolute' : 'static';
          }
        });
      });
      cy.wait(500);
      cy.screenshot(name, { capture: 'fullPage', overwrite: true });
    });
  });
});
