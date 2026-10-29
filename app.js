/**
 * SE Primer — Yazılım Mühendisliği Karar Simülasyonu ve Sokratik AI Tutor
 * YZM301 Ödevi: Kişiye uyum sağlayan mühendislik kitabı
 */

const SCENARIO_STEPS = [
  {
    id: 1,
    stepLabel: 'KARAR 1/3 · MİMARİ',
    title: 'KARAR 1 · MİMARİ',
    clock: '08:00 · KRİZ',
    baseNarrative:
      'Saat 08:00. Dün gece yeni sürüm (v2.4.0) çıktı. Poliklinikte 300 hasta bekliyor ve randevu servisi 500 Internal Server Error dönüyor.',
    roleAdaptation: {
      'Backend Mühendisi':
        'Backend perspektifi: Yeni sürümde `appointments` tablosu sorgusunda kilitlenme (deadlock) ve ORM bağlantı havuzu taşması görülüyor.',
      'SRE / DevOps':
        'SRE perspektifi: Kubernetes podları CrashLoopBackOff durumuna düşüyor; bir önceki kararlı imaj `v2.3.9` registry üzerinde hazır bekliyor.',
      'Güvenlik / KVKK Uzmanı':
        'Güvenlik perspektifi: Hata yanıtları istemciye ham stack-trace dönme riski taşıyor; servisi hızla kararlı ve güvenli duruma çekmelisin.'
    },
    logSnippet: `[08:00:12 ERROR] AppointmentService v2.4.0 - PoolExhaustedException
[08:00:14 WARN ] Active waiting queue: 300 patients (Polyclinic #1-#8)
[08:00:15 INFO ] Last known stable image: registry.hospital.local/app:v2.3.9`,
    beginnerHint:
      'Kriz anında temel prensip önce kanamayı durdurmaktır (MTTR düşürme). Ancak geri dönüş (rollback) veya canlı yama (hotfix) yaparken veritabanı şema uyumluluğunu düşünmelisin.',
    tutorInitialQuestion:
      'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?',
    choices: {
      A: {
        text: 'Eski sürüme geri dön',
        whatHappened:
          'Saat 08:07 itibarıyla v2.3.9 konteyner imajı devreye alındı. Veritabanı migration geçmişi kontrol edildiğinde yıkıcı (destructive) bir şema değişikliği olmadığı doğrulandı ve randevu istekleri yanıt vermeye başladı.',
        whyHappened:
          'Üretim krizlerinde bilinen en son kararlı sürüme (immutable artifact rollback) dönmek, canlı ortamda aceleyle kod yazmaktan çok daha düşük risklidir ve Ortalama Kurtarma Süresini (MTTR) minimize eder.'
      },
      B: {
        text: 'Canlıda yama yap',
        whatHappened:
          'Canlı sunucuda bağlantı havuzu ayarlarını ve sorguyu elle değiştirdin. İlk 5 dakika trafik rahatladı ancak kod tabanı ile canlı ortam arasında yapılandırma kayması (configuration drift) oluştu.',
        whyHappened:
          '300 hasta beklerken yüksek stres altında canlıda yama (hotfix) yapmak, gözden kaçan yan etkilere ve versiyon kontrol dışı değişikliklere yol açar.'
      }
    }
  },
  {
    id: 2,
    stepLabel: 'KARAR 2/3 · TEST',
    title: 'KARAR 2 · TEST',
    clock: '08:12 · DOĞRULAMA',
    baseNarrative:
      'Müdahale paketini hazırladın. Poliklinik bankolarından telefonlar geliyor, 300 hasta sırada bekliyor. Paketi tüm sunuculara dağıtmadan önce ne yaparsın?',
    roleAdaptation: {
      'Backend Mühendisi':
        'Backend perspektifi: Randevu oluşturma (`POST /appointments`) ve iptal uç noktalarının temel sözleşme (contract) doğrulaması sırada bekliyor.',
      'SRE / DevOps':
        'SRE perspektifi: CI/CD hattında 3 dakikalık otomatik Duman Testi (Smoke Test) aşaması var; dilersen baypas edip doğrudan tüm nodlara basabilirsin.',
      'Güvenlik / KVKK Uzmanı':
        'Güvenlik perspektifi: Yetkilendirme (AuthZ) filtrelerinin yeni pakette devre dışı kalmadığından emin olmak için doğrulama adımı kritik.'
    },
    logSnippet: `[08:12:04 PIPELINE] Artifact ready for cluster-wide rollout (12 replicas)
[08:12:05 SUITE   ] smoke_test_appointment_flow.spec (Est. duration: 180s)
[08:12:06 ALERT   ] Helpdesk: "Hastalar sırada bekliyor, sistem ne zaman açılacak?"`,
    beginnerHint:
      'Kısa bir duman testi (smoke test) 2-3 dakika sürer ama kritik fonksiyonların (giriş, randevu alma, veritabanı yazma) gerçekten çalıştığını garanti eder.',
    tutorInitialQuestion:
      '3 dakikalık kısa testi atlayıp hemen yayına aldığında, pakette gizli bir konfigürasyon hatası varsa 300 hastanın beklediği kuyrukta nasıl bir zincirleme etki oluşur?',
    choices: {
      A: {
        text: 'Önce kısa test koş',
        whatHappened:
          '3 dakikalık otomatik duman testi (smoke test) koşuldu. Test sırasında Redis önbellek anahtarındaki küçük bir uyumsuzluk yakalanıp düzeltildi ve saat 08:18’de tüm sunucular hatasız ayağa kalktı.',
        whyHappened:
          'Duman testleri (Smoke Testing), dağıtım öncesi sistemin en hayati işlevlerini hızlıca doğrulayarak bozuk bir paketin tüm üretim ortamını kilitlemesini önler.'
      },
      B: {
        text: 'Hemen yayına al',
        whatHappened:
          'Test adımını atlayıp paketi doğrudan 12 sunucuya bastın. İlk 2 dakika hızlı görünse de önbellek serileştirme hatası yüzünden bazı hastaların randevu saatleri çift yazıldı (race condition).',
        whyHappened:
          'Kriz anında zaman kazanmak için temel doğrulama testlerini atlamak, mevcut arızanın üzerine yeni regresyon hataları ekleyerek kurtarma süresini uzatır.'
      }
    }
  },
  {
    id: 3,
    stepLabel: 'KARAR 3/3 · KVKK',
    title: 'KARAR 3 · KVKK',
    clock: '08:20 · LOG PAYLAŞIMI',
    baseNarrative:
      'Sistem toparlanıyor ancak kök neden analizi için ekip lideri hata loglarını Slack/Jira kanalına atmanı istedi. Logda hasta adı, TC kimlik numarası ve poliklinik tanı bilgisi açıkça görünüyor.',
    roleAdaptation: {
      'Backend Mühendisi':
        'Backend perspektifi: Exception log satırında `patientName="Ayşe Yılmaz", tcNo="12345678901", diagnosis="Kardiyoloji"` alanları maskelenmemiş durumda.',
      'SRE / DevOps':
        'SRE perspektifi: Merkezi log (ELK) çıktısını dış mesajlaşma kanalına aktarırken PII (Kişisel Veriler) temizleme filtresi henüz çalıştırılmadı.',
      'Güvenlik / KVKK Uzmanı':
        'Güvenlik perspektifi: 6698 sayılı KVKK Madde 6 kapsamında sağlık verileri "Özel Nitelikli Kişisel Veri"dir; açık paylaşımı doğrudan yasal ihlaldir.'
    },
    logSnippet: `[08:20:01 ERROR] FailedTx: { "txId": "TX-9941", "tcKimlik": "28491048210",
  "hastaAdi": "Mehmet Demir", "poliklinik": "Onkoloji", "err": "Timeout" }
[08:20:03 SLACK] #incident-room: "Log çıktısını hemen buraya yapıştırır mısın?"`,
    beginnerHint:
      '6698 sayılı KVKK’ya göre ad-soyad, TC kimlik ve özellikle sağlık verileri kişisel veridir. Hata ayıklarken teknik ekip içinde bile olsa bu veriler maskelenmelidir (`***`).',
    tutorInitialQuestion:
      'Hata ayıklamak için geliştiricinin hastanın gerçek adına ve TC kimlik numarasına mı ihtiyacı vardır, yoksa sadece işlem kimliği (`txId`) ve hata koduna mı?',
    choices: {
      A: {
        text: 'Maskele',
        whatHappened:
          'Logdaki `hastaAdi` ve `tcKimlik` alanlarını `***MASKED***` olarak temizleyip sadece `txId: TX-9941` ve teknik hata izini ekiple paylaştın. Kök neden 3 dakikada güvenle doğrulandı.',
        whyHappened:
          'Veri minimizasyonu ve PII maskeleme (Data Masking / Anonymization), teknik hata ayıklama kalitesini düşürmeden 6698 sayılı KVKK uyumluluğunu ve hasta mahremiyetini korur.'
      },
      B: {
        text: 'Ekibe olduğu gibi at',
        whatHappened:
          'Log dosyasını hasta adları, TC kimlik numaraları ve poliklinik bilgileriyle birlikte 45 kişilik genel Slack kanalına ve bulut bilet sistemine olduğu gibi yapıştırdın.',
        whyHappened:
          'Aciliyet bahanesiyle özel nitelikli sağlık verilerinin maskelenmeden üçüncü parti/genel kanallara aktarılması, 6698 sayılı KVKK kapsamında açık bir kişisel veri ihlalidir.'
      }
    }
  }
];

/**
 * Sokratik AI Tutor Yanıt Motoru
 * KURAL: Asla doğrudan "A seç" veya "B seç" demez; cevabı ele vermez, yönlendirici soru sorar.
 */
function generateSocraticTutorResponse(userMessage, stepId, profile = {}) {
  const text = (userMessage || '').trim().toLowerCase();
  const step = SCENARIO_STEPS.find((s) => s.id === stepId) || SCENARIO_STEPS[0];

  // 1. Oyuncu doğrudan cevabı / şıkkı soruyorsa (Sızıntı Önleme - Guardrail)
  const asksDirectAnswer =
    text.includes('hangisi') ||
    text.includes('a mı b mi') ||
    text.includes('cevabı söyle') ||
    text.includes('cevap ne') ||
    text.includes('ne seçeyim') ||
    text.includes('hangisini seç') ||
    text.includes('doğru şık') ||
    text.includes('söyle geç') ||
    text.includes('ignore previous') ||
    text.includes('system prompt');

  if (asksDirectAnswer) {
    if (stepId === 1) {
      return 'Benim görevim hangi şıkkı seçeceğini söylemek değil, nöbetçi mühendis olarak riski senin tartmanı sağlamak. Şimdi birlikte düşünelim: Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın ve canlıda acele yama yapmanın 300 bekleyen hasta üzerindeki riski nedir?';
    }
    if (stepId === 2) {
      return 'Doğrudan bir seçeneği işaret edemem; kararı sen vermelisin. Şunu sorarak başlayalım: 3 dakikalık bir doğrulama testinin maliyeti ile test edilmemiş bir paketin 12 sunucuyu birden çökertme maliyeti arasında nasıl bir fark var?';
    }
    return 'Sana doğrudan hangi seçeneği seçeceğini söyleyemem. Ancak şu soruyu düşün: Hata ayıklarken bir mühendisin hastanın gerçek kimlik bilgisine gerçekten ihtiyacı var mıdır, yoksa 6698 sayılı KVKK açısından bu veriyi korumanın başka bir yolu mevcut mudur?';
  }

  // 2. Karar 1 (Mimari) özel bağlamları
  if (stepId === 1) {
    if (text.includes('migration') || text.includes('şema') || text.includes('schema') || text.includes('flyway') || text.includes('alembic') || text.includes('veritabanı')) {
      return 'Harika bir noktaya değindin! Veritabanı migration tablosuna (ör. `schema_migrations`) baktığında dün geceki sürümün yeni bir sütun mu eklediğini yoksa mevcut bir sütunu mu sildiğini görsen, bu durum eski koda dönüş kararını nasıl etkiler?';
    }
    if (text.includes('yama') || text.includes('hotfix') || text.includes('canlı')) {
      return 'Canlı ortamda doğrudan kod değiştirdiğinde, bu değişikliğin versiyon kontrol sistemindeki (Git) karşılığı ve diğer sunucu kopyalarıyla senkronizasyonu hakkında ne düşünüyorsun?';
    }
    return 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın? Ayrıca 300 hasta beklerken hangi yöntem sistemi bilinen kararlı bir duruma daha öngörülebilir şekilde taşır?';
  }

  // 3. Karar 2 (Test) özel bağlamları
  if (stepId === 2) {
    if (text.includes('bekliyor') || text.includes('acele') || text.includes('zaman') || text.includes('hemen')) {
      return 'Zaman baskısını hissedebiliyorum; 300 hasta sırada. Peki hiç test koşmadan dağıttığın pakette tek bir yanlış konfigürasyon varsa, sistemi ikinci kez çökertmek hastaları daha mı az bekletir yoksa daha mı çok?';
    }
    if (text.includes('smoke') || text.includes('duman') || text.includes('test')) {
      return 'Güzel yaklaşım. Kısa bir duman testinin (smoke test) tüm birim testlerinden farkı nedir ve kriz anında hangi kritik akışları doğrulaması yeterli olur?';
    }
    return 'Şunu düşün: Dağıtım öncesi koşulan 2-3 dakikalık temel bir doğrulama testi hangi tür kritik hataları canlıya çıkmadan yakalar?';
  }

  // 4. Karar 3 (KVKK) özel bağlamları
  if (stepId === 3) {
    if (text.includes('maske') || text.includes('anonim') || text.includes('kvkk') || text.includes('gizle')) {
      return 'Çok önemli bir kavram! Logdaki hasta adını ve TC kimlik numarasını gizlediğinde, yazılımcı hatayı çözmek için logdaki hangi teknik tanımlayıcıları (identifier) kullanmaya devam edebilir?';
    }
    if (text.includes('ekip') || text.includes('slack') || text.includes('içeride') || text.includes('yabancı değil')) {
      return 'Sadece şirket içi ekip görecek diye düşünmek yaygın bir yanılgıdır. 6698 sayılı KVKK’daki "Veri Minimizasyonu" ve "Özel Nitelikli Kişisel Verilerin Korunması" ilkelerine göre, yetkisiz kişilerin erişebileceği bir sohbet kanalına sağlık verisi koymak ne tür sonuçlar doğurur?';
    }
    return 'Log satırına baktığında, hatanın teknik kök nedenini bulmak için hastanın gerçek adına mı ihtiyacın var, yoksa işlem numarası (`txId`) ve hata yığını yeterli mi?';
  }

  return `${step.tutorInitialQuestion} Bu açıdan baktığında iki seçeneğin teknik sonuçları nasıl farklılaşır?`;
}

/**
 * 3 Kararın Bileşkesine Göre Sonuç (SON A · İYİ vs SON B · KÖTÜ) Hesaplama
 */
function evaluateGameOutcome(decisions, profile) {
  const d1 = decisions[1];
  const d2 = decisions[2];
  const d3 = decisions[3];

  // Karar 3'te B (Ekibe olduğu gibi at) seçilirse kesinlikle KVKK ihlali (SON B · KÖTÜ)
  // Veya hem Karar 1'de B (Canlıda yama) hem Karar 2'de B (Hemen yayına al) seçilirse sistemik kriz (SON B · KÖTÜ)
  const isKvkkViolation = d3 === 'B';
  const isUnstableHotfix = d1 === 'B' && d2 === 'B';
  const isGoodEnding = !isKvkkViolation && !isUnstableHotfix;

  if (isGoodEnding) {
    let nuance = 'Mimari geri dönüş, duman testi ve KVKK maskeleme adımlarının tamamında en güvenli mühendislik pratiğini uyguladın.';
    if (d1 === 'B' && d2 === 'A') {
      nuance = 'Canlıda yama yaparak risk aldın ancak yayın öncesi kısa test koşman ve hasta verilerini maskelemen sayesinde sistemi güvenle kurtardın.';
    } else if (d1 === 'A' && d2 === 'B') {
      nuance = 'Kararlı sürüme döndün ve KVKK maskelemesini doğru yaptın; ancak testi atlamak küçük bir risk oluşturdu. Yine de sistem ayakta ve veri güvende.';
    }

    return {
      code: 'SON A · İYİ',
      isGood: true,
      headline: '08:25 sistem ayakta, veri güvende',
      summary: `${nuance} Saat 08:25 itibarıyla bekleyen 300 hastanın randevu işlemleri sorunsuz tamamlandı ve hiçbir kişisel veri sızmadı.`,
      personalEval: `${profile.role} rolünde ve "${profile.goal}" hedefin doğrultusunda krizi soğukkanlılıkla yönettin. Durum makinesindeki güvenli geçişleri tamamladın.`
    };
  } else {
    let reason = 'Logdaki hasta adını ve TC kimlik verilerini maskelemeden paylaşman 6698 sayılı KVKK kapsamında veri ihlaline yol açtı.';
    if (isKvkkViolation && isUnstableHotfix) {
      reason = 'Hem canlıda testsiz yama yaparak ikincil çökmeye yol açtın hem de hasta verilerini maskelemeden paylaşarak KVKK ihlali gerçekleştirdin.';
    } else if (!isKvkkViolation && isUnstableHotfix) {
      reason = 'Hasta verilerini maskeledin ancak canlıda yaptığın yamayı hiç test koşmadan yayına aldığın için randevu veritabanında tutarsızlık ve çökme yaşandı.';
    }

    return {
      code: 'SON B · KÖTÜ',
      isGood: false,
      headline: 'Sistem ayakta ama KVKK ihlali',
      summary: `${reason} Teknik müdahale sırasında alınan güvensiz kararlar kurumu ağır idari yaptırımlar ve güvenlik riskiyle karşı karşıya bıraktı.`,
      personalEval: `${profile.role} rolünde "${profile.goal}" hedefine ulaşmaya çalışırken hız uğruna temel doğrulama/mahremiyet bariyerlerini devre dışı bıraktın.`
    };
  }
}

// Tarayıcı Ortamı (DOM Yönetimi)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const state = {
    profile: {
      level: 'Yeni başladım',
      role: 'Backend Mühendisi',
      goal: 'Sistem Sürekliliği (Uptime)'
    },
    currentStepIndex: 0,
    decisions: {},
    timerInterval: null,
    remainingSeconds: 60
  };

  function initApp() {
    // Kişiselleştirme seçenek butonları
    const optionButtons = document.querySelectorAll('.option-pill');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-group');
        const value = btn.getAttribute('data-value');
        state.profile[group] = value;

        document
          .querySelectorAll(`.option-pill[data-group="${group}"]`)
          .forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Nöbete Başla butonu
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        state.currentStepIndex = 0;
        state.decisions = {};
        document.getElementById('screen-onboarding').classList.add('hidden');
        document.getElementById('screen-ending').classList.add('hidden');
        document.getElementById('screen-scene').classList.remove('hidden');
        renderCurrentScene();
      });
    }

    // Karar A ve B butonları
    document.getElementById('btn-choice-a').addEventListener('click', () => handleDecision('A'));
    document.getElementById('btn-choice-b').addEventListener('click', () => handleDecision('B'));

    // Sonraki Karara Geç butonu
    document.getElementById('btn-next-step').addEventListener('click', () => {
      if (state.currentStepIndex < SCENARIO_STEPS.length - 1) {
        state.currentStepIndex += 1;
        renderCurrentScene();
      } else {
        renderEndingScreen();
      }
    });

    // AI Tutor mesaj gönderme
    const tutorSendBtn = document.getElementById('tutor-send-btn');
    const tutorInput = document.getElementById('tutor-input');
    const sendTutorQuestion = () => {
      const val = tutorInput.value.trim();
      if (!val) return;
      appendTutorMessage(val, 'user');
      tutorInput.value = '';
      const step = SCENARIO_STEPS[state.currentStepIndex];
      const reply = generateSocraticTutorResponse(val, step.id, state.profile);
      appendTutorMessage(reply, 'tutor');
    };

    tutorSendBtn.addEventListener('click', sendTutorQuestion);
    tutorInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendTutorQuestion();
    });

    // Yeniden Oyna
    document.getElementById('btn-restart').addEventListener('click', () => {
      stopCountdown();
      document.getElementById('screen-ending').classList.add('hidden');
      document.getElementById('screen-scene').classList.add('hidden');
      document.getElementById('screen-onboarding').classList.remove('hidden');
      document.getElementById('header-clock').textContent = '08:00 · KRİZ';
    });
  }

  function renderCurrentScene() {
    const step = SCENARIO_STEPS[state.currentStepIndex];
    document.getElementById('header-clock').textContent = step.clock;
    document.getElementById('step-indicator').textContent = step.stepLabel;
    document.getElementById('scene-title').textContent = step.title;

    // Profil özeti ve anlatı uyarlaması
    document.getElementById('profile-summary-bar').textContent =
      `Profil: ${state.profile.level} · ${state.profile.role} · Hedef: ${state.profile.goal}`;

    const roleNote = step.roleAdaptation[state.profile.role] || '';
    document.getElementById('scene-narrative').textContent = `${step.baseNarrative} ${roleNote}`;
    document.getElementById('scene-log').textContent = step.logSnippet;

    // Kişiselleştirme: "Yeni başladım" -> İpucu kutusu göster; "Deneyimliyim" -> 60 sn sayaç başlat
    const hintCard = document.getElementById('beginner-hint-card');
    const hintText = document.getElementById('beginner-hint-text');
    const timerBadge = document.getElementById('timer-badge');

    stopCountdown();
    if (state.profile.level === 'Yeni başladım') {
      hintCard.classList.remove('hidden');
      hintText.textContent = step.beginnerHint;
      timerBadge.classList.add('hidden');
    } else {
      hintCard.classList.add('hidden');
      timerBadge.classList.remove('hidden');
      startCountdown(60);
    }

    // Seçenek butonlarını sıfırla
    const btnA = document.getElementById('btn-choice-a');
    const btnB = document.getElementById('btn-choice-b');
    btnA.disabled = false;
    btnB.disabled = false;
    btnA.classList.remove('chosen');
    btnB.classList.remove('chosen');
    document.getElementById('choice-a-text').textContent = step.choices.A.text;
    document.getElementById('choice-b-text').textContent = step.choices.B.text;

    // Geri bildirim kartını gizle
    document.getElementById('feedback-card').classList.add('hidden');

    // Sokratik AI Tutor başlangıç sorusunu yükle
    const tutorMessages = document.getElementById('tutor-messages');
    tutorMessages.innerHTML = '';
    appendTutorMessage(step.tutorInitialQuestion, 'tutor');
  }

  function handleDecision(choiceKey) {
    stopCountdown();
    const step = SCENARIO_STEPS[state.currentStepIndex];
    state.decisions[step.id] = choiceKey;

    const btnA = document.getElementById('btn-choice-a');
    const btnB = document.getElementById('btn-choice-b');
    btnA.disabled = true;
    btnB.disabled = true;

    if (choiceKey === 'A') {
      btnA.classList.add('chosen');
    } else {
      btnB.classList.add('chosen');
    }

    const choiceData = step.choices[choiceKey];
    document.getElementById('feedback-what').textContent = choiceData.whatHappened;
    document.getElementById('feedback-why').textContent = choiceData.whyHappened;

    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.textContent =
      state.currentStepIndex < SCENARIO_STEPS.length - 1
        ? 'Sonraki Karara Geç →'
        : 'Sonucu ve Karneyi Gör →';

    const feedbackCard = document.getElementById('feedback-card');
    feedbackCard.classList.remove('hidden');
    // Arkadaş testi bulgusu: kart açıldığında ekranı karta kaydır ki oyuncu "donma" sanmasın
    if (typeof feedbackCard.scrollIntoView === 'function') {
      feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function appendTutorMessage(text, sender) {
    const container = document.getElementById('tutor-messages');
    const div = document.createElement('div');
    div.className = `msg-bubble ${sender === 'user' ? 'msg-user' : 'msg-tutor'}`;
    div.setAttribute('data-cy', sender === 'user' ? 'tutor-msg-user' : 'tutor-msg-ai');
    div.textContent = sender === 'user' ? `Sen: ${text}` : `AI Tutor: “${text}”`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function startCountdown(seconds) {
    state.remainingSeconds = seconds;
    const timerBadge = document.getElementById('timer-badge');
    timerBadge.textContent = `⏱ ${state.remainingSeconds} sn`;

    state.timerInterval = setInterval(() => {
      state.remainingSeconds -= 1;
      if (state.remainingSeconds <= 0) {
        state.remainingSeconds = 0;
        timerBadge.textContent = '⏱ 0 sn (Süre Doldu!)';
        stopCountdown();
      } else {
        timerBadge.textContent = `⏱ ${state.remainingSeconds} sn`;
      }
    }, 1000);
  }

  function stopCountdown() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function renderEndingScreen() {
    stopCountdown();
    document.getElementById('screen-scene').classList.add('hidden');
    document.getElementById('screen-ending').classList.remove('hidden');

    const outcome = evaluateGameOutcome(state.decisions, state.profile);
    document.getElementById('header-clock').textContent = outcome.isGood ? '08:25 · ÇÖZÜLDÜ' : '08:25 · İHLAL';

    const banner = document.getElementById('ending-banner');
    banner.className = `ending-banner ${outcome.isGood ? 'good' : 'bad'}`;
    document.getElementById('ending-code').textContent = outcome.code;
    document.getElementById('ending-headline').textContent = outcome.headline;
    document.getElementById('ending-summary').textContent = outcome.summary;
    document.getElementById('ending-personal-eval').textContent = outcome.personalEval;

    const timeline = document.getElementById('ending-timeline');
    timeline.innerHTML = '';
    SCENARIO_STEPS.forEach((step) => {
      const chosenKey = state.decisions[step.id];
      const chosenObj = step.choices[chosenKey];
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.setAttribute('data-cy', `timeline-step-${step.id}`);
      item.innerHTML = `
        <div class="timeline-item-header">
          <span>${step.title}</span>
          <span>Seçim: ${chosenKey}) ${chosenObj.text}</span>
        </div>
        <div>${chosenObj.whatHappened}</div>
      `;
      timeline.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', initApp);
}

// Node.js / Eval Test Ortamı İçin Dışa Aktarım
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCENARIO_STEPS,
    generateSocraticTutorResponse,
    evaluateGameOutcome
  };
}
