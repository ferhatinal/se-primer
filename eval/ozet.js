/**
 * eval/etiketleme.csv dosyasındaki elle etiketleri okur;
 * oran + örnek sayısı + hata türü dağılımını eval/SONUC.md dosyasına yazar.
 * Çalıştırma: npm run eval
 */
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'etiketleme.csv');
if (!fs.existsSync(csvPath)) {
  console.error('eval/etiketleme.csv bulunamadı. Önce: node eval/sablon-olustur.js');
  process.exit(1);
}

// Basit CSV ayrıştırıcı (tırnak, çift tırnak ve hücre içi satır sonu destekli; ayraç ; veya ,)
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/)[0];
  const sep = firstLine.split(';').length >= firstLine.split(',').length ? ';' : ',';
  const rows = [];
  let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const [header, ...data] = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const idx = (name) => header.indexOf(name);
const items = data.map((r) => ({
  no: r[idx('No')],
  karar: r[idx('Karar')],
  cevap: r[idx('Ogrenci_Cevabi')],
  yanit: (r[idx('Tutor_Yaniti')] || '').trim(),
  ele: (r[idx('Ele_Verdi_Mi')] || '').trim().toLowerCase(),
  tur: (r[idx('Hata_Turu')] || '').trim(),
  not: (r[idx('Not')] || '').trim()
}));

const N = items.length;
const labeled = items.filter((i) => i.ele === 'evet' || i.ele === 'hayır' || i.ele === 'hayir');
const evet = labeled.filter((i) => i.ele === 'evet');
const pct = (k, n) => (n ? ((100 * k) / n).toFixed(1) : '0.0');

const turCounts = {};
labeled.forEach((i) => {
  const t = i.tur || '(belirtilmedi)';
  turCounts[t] = turCounts[t] || [];
  turCounts[t].push(i.no);
});

const kararlar = [...new Set(items.map((i) => i.karar))];
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

let md = `# Tutor Eval Sonuçları (otomatik üretildi: \`npm run eval\`)\n\n`;
md += `- Kaynak: [\`etiketleme.csv\`](./etiketleme.csv) (AI Studio uygulamasındaki Gemini tabanlı Sokratik Tutor, elle etiketlendi)\n`;
md += `- Toplam öğrenci cevabı: **${N}** · Etiketlenen: **${labeled.length}**\n\n`;

if (labeled.length < N) {
  md += `> [!WARNING]\n> ${N - labeled.length} satır henüz etiketlenmedi. Oranlar yalnızca etiketlenen ${labeled.length} örnek üzerinden hesaplandı.\n\n`;
}

md += `## 1. Ana sonuç\n\n| Metrik | Örnek sayısı | Oran |\n| :--- | :---: | :---: |\n`;
md += `| Cevabı ele verdi (Evet) | ${evet.length} / ${labeled.length} | %${pct(evet.length, labeled.length)} |\n`;
md += `| Cevabı ele vermedi (Hayır) | ${labeled.length - evet.length} / ${labeled.length} | %${pct(labeled.length - evet.length, labeled.length)} |\n\n`;

md += `## 2. Hata türü dağılımı\n\n| Hata türü | Örnek sayısı | Oran | Örnek no'ları |\n| :--- | :---: | :---: | :--- |\n`;
Object.entries(turCounts)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([t, nos]) => {
    md += `| ${esc(t)} | ${nos.length} | %${pct(nos.length, labeled.length)} | ${nos.join(', ')} |\n`;
  });

md += `\n## 3. Karar aşamasına göre sızıntı\n\n| Karar | Etiketlenen | Ele verdi | Oran |\n| :--- | :---: | :---: | :---: |\n`;
kararlar.forEach((k) => {
  const l = labeled.filter((i) => i.karar === k);
  const e = l.filter((i) => i.ele === 'evet');
  md += `| ${esc(k)} | ${l.length} | ${e.length} | %${pct(e.length, l.length)} |\n`;
});

md += `\n## 4. 20 cevabın tamamı\n\n| # | Karar | Öğrenci cevabı | Tutor yanıtı | Ele verdi mi? | Hata türü | Not |\n| :-: | :--- | :--- | :--- | :-: | :--- | :--- |\n`;
items.forEach((i) => {
  md += `| ${i.no} | ${esc(i.karar)} | ${esc(i.cevap)} | ${esc(i.yanit || '—')} | ${esc(i.ele || '—')} | ${esc(i.tur || '—')} | ${esc(i.not || '')} |\n`;
});

fs.writeFileSync(path.join(__dirname, 'SONUC.md'), md, 'utf8');
console.log(`SONUC.md yazıldı. Etiketlenen: ${labeled.length}/${N}, ele verdi: ${evet.length} (%${pct(evet.length, labeled.length)})`);
