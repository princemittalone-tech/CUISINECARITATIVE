// ============================================================
// CUISINE CARITATIVE — comportements partagés
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initHeaderShadow();
  initCompactNav();
  initNav();
  initFaq();
  initCounters();
  initFilters();
  initAnalyticsTracking();
  renderPackageGrid('pkg-grid');
  renderPackageGrid('home-pkg-grid', { featuredOnly:true, limit:3 });
  renderTestimonials('home-testi-grid', 3);
});

function initCompactNav(){
  const nav = document.getElementById('nav-links');
  if(!nav) return;

  const livePath = (location.pathname || '/').split('/').pop() || 'index.html';
  const isActive = (paths) => paths.includes(livePath) ? 'active' : '';

  nav.innerHTML = `
    <li class="nav-item ${isActive(['index.html'])}"><a href="index.html" class="nav-link">Accueil</a></li>
    <li class="nav-item has-menu ${isActive(['commande.html', 'don-horaire.html', 'comment-ca-marche.html'])}">
      <button type="button" class="nav-trigger" aria-expanded="false">
        <span>Donner</span>
        <span class="caret" aria-hidden="true">▾</span>
      </button>
      <ul class="nav-submenu">
        <li><a href="commande.html">Faire un don</a></li>
        <li><a href="don-horaire.html">1h de mon salaire</a></li>
        <li><a href="comment-ca-marche.html">Comment ça marche</a></li>
      </ul>
    </li>
    <li class="nav-item has-menu ${isActive(['galerie.html', 'blog.html', 'avis.html'])}">
      <button type="button" class="nav-trigger" aria-expanded="false">
        <span>Impact</span>
        <span class="caret" aria-hidden="true">▾</span>
      </button>
      <ul class="nav-submenu">
        <li><a href="galerie.html">Nos actions</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="avis.html">Avis</a></li>
      </ul>
    </li>
    <li class="nav-item has-menu ${isActive(['organisations.html', 'a-propos.html', 'contact.html','mentions-legales.html'])}">
      <button type="button" class="nav-trigger" aria-expanded="false">
        <span>À propos</span>
        <span class="caret" aria-hidden="true">▾</span>
      </button>
      <ul class="nav-submenu">
        <li><a href="organisations.html">Entreprises</a></li>
        <li><a href="a-propos.html">Notre histoire</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </li>
    <li class="nav-item ${isActive(['packages.html'])}"><a href="packages.html" class="nav-link">Packages</a></li>
  `;

  const menuButtons = nav.querySelectorAll('.nav-trigger');
  menuButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = button.closest('.nav-item');
      const isOpen = item.classList.contains('open');
      nav.querySelectorAll('.nav-item').forEach(entry => {
        entry.classList.remove('open');
        const trigger = entry.querySelector('.nav-trigger');
        if(trigger) trigger.setAttribute('aria-expanded', 'false');
      });
      if(!isOpen){
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  nav.querySelectorAll('.nav-submenu a').forEach(link => {
    link.addEventListener('click', () => {
      nav.querySelectorAll('.nav-item').forEach(entry => entry.classList.remove('open'));
      const toggle = document.querySelector('.nav-toggle');
      if(toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if(!event.target.closest('.nav-item')) {
      nav.querySelectorAll('.nav-item').forEach(entry => entry.classList.remove('open'));
      nav.querySelectorAll('.nav-trigger').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }
  });
}

/* ---------- Suivi d'usage (démo) : pages vues + clics ----------
   Alimente le tableau de bord admin (visites, zones cliquées,
   fonctionnalités les plus utilisées). Stocké en local uniquement. */
function initAnalyticsTracking(){
  if(typeof ccStore === 'undefined') return;
  const page = location.pathname.split('/').pop() || 'index.html';
  ccStore.logPageview(page);

  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button');
    if(!el) return;
    const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || '').trim().slice(0, 60);
    if(!label) return;
    ccStore.logClick({
      page,
      label,
      x: Math.round((e.clientX / window.innerWidth) * 100),
      y: Math.round((e.pageY / document.documentElement.scrollHeight) * 100),
    });
  });
}

/* ---------- Navigation mobile ---------- */
function initHeaderShadow(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    links.querySelectorAll('.nav-item').forEach(entry => entry.classList.remove('open'));
    links.querySelectorAll('.nav-trigger').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  };

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const expanded = links.classList.contains('open');
    toggle.setAttribute('aria-expanded', expanded);
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  links.querySelectorAll('.nav-trigger').forEach(trigger => trigger.addEventListener('click', (event) => {
    event.stopPropagation();
  }));
}

/* ---------- FAQ accordion ---------- */
function initFaq(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
}

/* ---------- Compteurs animés ---------- */
function initCounters(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;
  if(!('IntersectionObserver' in window)){
    counters.forEach(animateCount);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => observer.observe(c));
}
function animateCount(el){
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = val.toLocaleString('fr-FR') + suffix;
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   Rendu dynamique des packages depuis le store (prix modifiables
   par l'admin -> répercutés partout où les formules s'affichent)
   ============================================================ */
const CC_CHECK_SVG = '<svg viewBox="0 0 20 20"><path d="M7.5 13.5 4 10l-1.4 1.4L7.5 16.3 17.4 6.4 16 5z"/></svg>';

function ccPackageCardHtml(p){
  const priceLabel = p.categorie === 'surmesure'
    ? `${ccFormatFcfa(p.prix)} <span>${p.unite || ''}</span>`
    : `${ccFormatFcfa(p.prix)} <span>${p.unite || ''}</span>`;
  const feats = [];
  if(p.beneficiaires) feats.push(`${p.beneficiaires} bénéficiaires`);
  if(p.delai) feats.push(`Délai ${p.delai}`);
  feats.push('Preuve photo incluse');
  const featsHtml = feats.map(f => `<li>${CC_CHECK_SVG} ${f}</li>`).join('');
  const nomUrl = encodeURIComponent(p.nom);
  return `
    <div class="pkg-card" data-category="${p.categorie}">
      <div class="pkg-top">
        <span class="pkg-tag">${p.tag || ''}</span>
        <h3>${p.nom}</h3>
        <p class="pkg-price">${priceLabel}</p>
      </div>
      <div class="pkg-body">
        <p>${p.description || ''}</p>
        <ul class="pkg-list">${featsHtml}</ul>
        <a href="commande.html?package=${nomUrl}&prix=${p.prix}" class="btn btn-blue btn-block">Choisir cette formule</a>
      </div>
    </div>`;
}

function renderPackageGrid(containerId, opts){
  const el = document.getElementById(containerId);
  if(!el || typeof ccStore === 'undefined') return;
  opts = opts || {};
  let list = ccStore.getPackages(true);
  if(opts.featuredOnly) list = list.filter(p => p.vedette);
  if(opts.limit) list = list.slice(0, opts.limit);
  el.innerHTML = list.map(ccPackageCardHtml).join('');
  initFilters();
}

function renderTestimonials(containerId, limit){
  const el = document.getElementById(containerId);
  if(!el || typeof ccStore === 'undefined') return;
  let list = ccStore.getAvis(true);
  if(!list.length) return; // garde le contenu statique de secours déjà présent
  if(limit) list = list.slice(0, limit);
  el.innerHTML = list.map(a => `
    <div class="testi-card">
      <p>« ${a.texte} »</p>
      <div class="testi-who">
        <div class="testi-avatar">${(a.nom || '?').charAt(0)}</div>
        <div><b>${a.nom}</b><span>Donateur·rice vérifié·e</span></div>
      </div>
    </div>`).join('');
}

/* ---------- Filtres packages ---------- */
function initFilters(){
  const chips = document.querySelectorAll('.filter-chip[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  if(!chips.length || !cards.length) return;
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        card.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
      });
    });
  });
}

/* ============================================================
   Calculateur "1 heure de mon salaire"
   ============================================================ */
function initHourlyCalculator(){
  const select = document.getElementById('wage-bracket');
  const customInput = document.getElementById('wage-custom');
  const resultAmount = document.getElementById('calc-amount');
  const resultNote = document.getElementById('calc-note');
  const recurringBox = document.getElementById('calc-recurring');
  if(!select) return;

  function currentValue(){
    if(select.value === 'custom'){
      return parseFloat(customInput.value) || 0;
    }
    return parseFloat(select.value) || 0;
  }

  function update(){
    const isCustom = select.value === 'custom';
    customInput.style.display = isCustom ? 'block' : 'none';
    const amount = currentValue();
    resultAmount.textContent = amount > 0 ? Math.round(amount).toLocaleString('fr-FR') + ' FCFA' : '— FCFA';
    if(recurringBox && recurringBox.checked && amount > 0){
      resultNote.textContent = `Soit ${Math.round(amount*12).toLocaleString('fr-FR')} FCFA sur l'année si vous donnez votre heure chaque mois.`;
    } else {
      resultNote.textContent = amount > 0 ? "Ce montant sera versé à la cagnotte en cours que vous choisissez ci-dessous." : "Choisissez votre tranche de revenu horaire pour voir le montant.";
    }
  }

  select.addEventListener('change', update);
  customInput.addEventListener('input', update);
  if(recurringBox) recurringBox.addEventListener('change', update);
  update();
}

function ccGetHourlyWageAmount(){
  const select = document.getElementById('wage-bracket');
  const customInput = document.getElementById('wage-custom');
  if(!select) return 0;
  if(select.value === 'custom') return parseFloat(customInput.value) || 0;
  return parseFloat(select.value) || 0;
}

/* ============================================================
    "1h de mon salaire" — choix de la cause + suivi du don
    ============================================================ */
let hwSelectedCagnotteId = null;
let hwLastRef = null;
let hwLastAmount = 0;

function renderCagnottes(){
  const grid = document.getElementById('cagnottes-grid');
  if(!grid || typeof ccStore === 'undefined') return;
  const list = ccStore.getCagnottes(true);
  grid.innerHTML = list.length ? list.map(cg => {
    const pct = cg.objectif ? Math.min(100, Math.round((cg.collecte / cg.objectif) * 100)) : 0;
    return `
    <div class="pot-card selectable" data-id="${cg.id}">
      <h3>${cg.nom}</h3>
      <p style="font-size:.9rem; color:var(--ink-soft);">${cg.description}</p>
      <div class="pot-bar"><div class="pot-bar-fill" style="width:${pct}%;"></div></div>
      <div class="pot-meta"><span><b style="color:var(--blue-deep);">${cg.collecte.toLocaleString('fr-FR')}</b> / ${cg.objectif.toLocaleString('fr-FR')} FCFA</span><span>${pct}%</span></div>
      <p class="chip-count" style="margin-top:14px;">🤝 <b>${cg.contributeurs}</b> contributeurs</p>
      <div class="pot-check">✓ Cagnotte sélectionnée</div>
    </div>`;
  }).join('') : '<p class="hint">Aucune cagnotte active pour le moment — revenez bientôt !</p>';

  grid.querySelectorAll('.pot-card').forEach(card => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.pot-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      hwSelectedCagnotteId = card.getAttribute('data-id');
      updateChosenCauseHint();
    });
  });
}

function updateChosenCauseHint(){
  const hint = document.getElementById('chosen-cause-hint');
  if(!hint) return;
  const amount = ccGetHourlyWageAmount();
  const cg = (hwSelectedCagnotteId && typeof ccStore !== 'undefined') ? ccStore.getCagnotteById(hwSelectedCagnotteId) : null;
  if(amount > 0 && cg){
    hint.innerHTML = `Vous contribuez <b style="color:var(--blue-deep);">${Math.round(amount).toLocaleString('fr-FR')} FCFA</b> à « ${cg.nom} ».`;
  } else if(!cg){
    hint.textContent = "Sélectionnez d'abord une cagnotte ci-dessus.";
  } else {
    hint.textContent = "Choisissez votre tranche de revenu horaire plus haut.";
  }
}

function initHourlyDonationFlow(){
  if(!document.getElementById('cagnottes-grid')) return;
  renderCagnottes();
  const select = document.getElementById('wage-bracket');
  const customInput = document.getElementById('wage-custom');
  const recurringBox = document.getElementById('calc-recurring');
  if(select) select.addEventListener('change', updateChosenCauseHint);
  if(customInput) customInput.addEventListener('input', updateChosenCauseHint);
  if(recurringBox) recurringBox.addEventListener('change', updateChosenCauseHint);
  updateChosenCauseHint();

  document.getElementById('hw-submit')?.addEventListener('click', submitHourlyDonation);
  document.getElementById('hw-goto-payment')?.addEventListener('click', showHourlyPaymentPanel);
  document.getElementById('hw-confirm-pay')?.addEventListener('click', confirmAndPayHourly);
}

function submitHourlyDonation(){
  const errBox = document.getElementById('hw-error');
  errBox.style.display = 'none';
  const amount = ccGetHourlyWageAmount();
  const nom = document.getElementById('hw-nom').value.trim();
  const contact = document.getElementById('hw-contact').value.trim();
  const recurring = document.getElementById('calc-recurring')?.checked || false;

  if(!(amount > 0)){ errBox.textContent = "Choisissez d'abord votre tranche de revenu horaire."; errBox.style.display = 'block'; return; }
  if(!hwSelectedCagnotteId){ errBox.textContent = "Choisissez une cagnotte à soutenir."; errBox.style.display = 'block'; return; }
  if(!nom || !contact){ errBox.textContent = "Merci de renseigner votre nom et un moyen de vous contacter."; errBox.style.display = 'block'; return; }

  const cg = ccStore.getCagnotteById(hwSelectedCagnotteId);
  const ref = 'CCH-' + Math.floor(100000 + Math.random() * 900000);
  ccStore.addDonHoraire({
    ref, montant: Math.round(amount), cagnotteId: hwSelectedCagnotteId, cagnotteNom: cg ? cg.nom : '',
    recurrent: recurring, nom, contact, statut: 'Reçu', creeLe: ccLocalDateString(new Date()),
  });

  hwLastRef = ref;
  hwLastAmount = Math.round(amount);

  document.getElementById('hw-form-panel').style.display = 'none';
  document.getElementById('hw-confirmation').style.display = 'block';
  document.getElementById('hw-ref').textContent = ref;
  renderCagnottes(); // rafraîchit la barre de progression avec la nouvelle contribution
}

function showHourlyPaymentPanel(){
  document.getElementById('hw-confirmation').style.display = 'none';
  const payPanel = document.getElementById('hw-payment');
  payPanel.style.display = 'block';
  document.getElementById('hw-payment-summary').innerHTML = `
    <div class="summary-row"><span>Numéro de suivi</span><span>${hwLastRef || '—'}</span></div>
    <div class="summary-row"><span>Montant à régler</span><span>${hwLastAmount.toLocaleString('fr-FR')} FCFA</span></div>
  `;
  payPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmAndPayHourly(){
  let waLink = 'https://wa.me/22900000000';
  let template = "Bonjour, je souhaite finaliser le paiement de mon don {ref} d'un montant de {montant}.";
  if(typeof ccStore !== 'undefined'){
    const settings = ccStore.getSettings();
    if(settings.whatsapp_paiement) waLink = settings.whatsapp_paiement;
    if(settings.whatsapp_message) template = settings.whatsapp_message;
    ccStore.updateDonHoraireStatut(hwLastRef, 'Confirmé');
  }
  const message = template
    .replace('{ref}', hwLastRef || '')
    .replace('{montant}', hwLastAmount.toLocaleString('fr-FR') + ' FCFA');
  const url = waLink.includes('?') ? `${waLink}&text=${encodeURIComponent(message)}` : `${waLink}?text=${encodeURIComponent(message)}`;
  window.location.href = url;
}

/* ============================================================
    Formulaire de commande — assistant en plusieurs étapes
    ============================================================ */
const orderState = {
  step: 1,
  totalSteps: 4,
  package: null,
  packagePrice: 0,
  date: '',
  occasion: '',
  zone: '',
  message: '',
  name: '',
  contact: '',
  channel: 'whatsapp'
};

function initOrderWizard(){
  const wizard = document.getElementById('order-wizard');
  if(!wizard) return;

  renderOrderPackageChoices();

  if(document.getElementById('order-calendar') && typeof ccRenderCalendar !== 'undefined'){
    ccRenderCalendar('order-calendar', {
      mode: 'client',
      onSelectDate(iso){
        orderState.date = iso;
        const chip = document.getElementById('order-date-chip');
        if(chip){
          const d = new Date(iso + 'T00:00:00');
          const label = d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
          chip.innerHTML = `<span class="selected-date-chip">📅 Date choisie : ${label}</span>`;
        }
        const err = document.getElementById('order-error');
        if(err) err.textContent = '';
      },
    });
  }

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('package');
  const preselectPrice = params.get('prix');
  if(preselect){
    orderState.package = preselect;
    orderState.packagePrice = parseInt(preselectPrice, 10) || 0;
    document.querySelectorAll('input[name="package-radio"]').forEach(r => {
      if(r.value === preselect){
        r.checked = true;
        r.closest('.radio-card')?.classList.add('is-selected');
      }
    });
  }

  document.getElementById('order-next')?.addEventListener('click', () => goToStep(orderState.step + 1));
  document.getElementById('order-prev')?.addEventListener('click', () => goToStep(orderState.step - 1));
  document.getElementById('goto-payment-btn')?.addEventListener('click', showPaymentPanel);
  document.getElementById('confirm-pay-btn')?.addEventListener('click', confirmAndPay);

  renderStep();
}

function renderOrderPackageChoices(){
  const el = document.getElementById('order-package-choices');
  if(!el || typeof ccStore === 'undefined') return;
  const list = ccStore.getPackages(true);
  el.innerHTML = list.map((p, i) => `
    <div class="radio-card">
      <input type="radio" name="package-radio" id="pk${i}" value="${p.nom}">
      <label for="pk${i}"><button type="button" class="pkg-select-btn" data-package="${p.nom}" data-price="${p.prix}" style="all:unset;display:block;width:100%;">${p.nom}<br><small style="color:var(--ink-soft); font-size:.78rem;">${p.description || ''}</small></button></label>
    </div>`).join('');
  document.querySelectorAll('.pkg-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      orderState.package = btn.getAttribute('data-package');
      orderState.packagePrice = parseInt(btn.getAttribute('data-price'), 10) || 0;
      document.querySelectorAll('.radio-card').forEach(rc => rc.classList.remove('is-selected'));
      btn.closest('.radio-card')?.classList.add('is-selected');
      document.querySelectorAll('input[name="package-radio"]').forEach(r => {
        r.checked = r.value === orderState.package;
      });
    });
  });
}

function goToStep(n){
  if(n < 1 || n > orderState.totalSteps) return;
  if(n > orderState.step && !validateStep(orderState.step)) return;
  orderState.step = n;
  renderStep();
  window.scrollTo({ top: document.getElementById('order-wizard').offsetTop - 100, behavior:'smooth' });
}

function validateStep(step){
  const errBox = document.getElementById('order-error');
  if(errBox) errBox.textContent = '';
  if(step === 1 && !orderState.package){
    if(errBox) errBox.textContent = "Merci de choisir une formule pour continuer.";
    return false;
  }
  if(step === 2){
    const occasion = document.getElementById('order-occasion')?.value;
    if(!orderState.date || !occasion){
      if(errBox) errBox.textContent = "Merci de choisir une date disponible dans le calendrier et une occasion.";
      return false;
    }
    orderState.occasion = occasion;
    orderState.zone = document.getElementById('order-zone')?.value || '';
    orderState.message = document.getElementById('order-message')?.value || '';
  }
  if(step === 3){
    const name = document.getElementById('order-name')?.value;
    const contact = document.getElementById('order-contact')?.value;
    if(!name || !contact){
      if(errBox) errBox.textContent = "Merci de renseigner votre nom et un moyen de vous contacter.";
      return false;
    }
    orderState.name = name;
    orderState.contact = contact;
    const channel = document.querySelector('input[name="channel"]:checked');
    orderState.channel = channel ? channel.value : 'whatsapp';
  }
  return true;
}

function renderStep(){
  document.querySelectorAll('.wizard-step').forEach((el, i) => {
    el.classList.remove('active','done');
    if(i + 1 < orderState.step) el.classList.add('done');
    if(i + 1 === orderState.step) el.classList.add('active');
  });
  document.querySelectorAll('.order-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('panel-' + orderState.step);
  if(panel) panel.style.display = 'block';

  const prevBtn = document.getElementById('order-prev');
  const nextBtn = document.getElementById('order-next');
  if(prevBtn) prevBtn.style.visibility = orderState.step === 1 ? 'hidden' : 'visible';
  if(nextBtn){
    nextBtn.textContent = orderState.step === orderState.totalSteps ? 'Confirmer et payer le dépôt' : 'Continuer';
  }

  if(orderState.step === orderState.totalSteps){
    renderSummary();
  }

  if(orderState.step === orderState.totalSteps){
    nextBtn.onclick = submitOrder;
  } else {
    nextBtn.onclick = () => goToStep(orderState.step + 1);
  }
}

function submitOrder(e){
  if(!validateStep(orderState.step)) return;
  const ref = 'CC-' + Math.floor(100000 + Math.random()*900000);
  orderState.ref = ref;
  if(typeof ccStore !== 'undefined'){
    ccStore.addCommande({
      ref,
      package: orderState.package,
      prix: orderState.packagePrice,
      date: orderState.date,
      occasion: orderState.occasion,
      zone: orderState.zone,
      message: orderState.message,
      nom: orderState.name,
      contact: orderState.contact,
      canal: orderState.channel,
      statut: 'Reçue',
      creeLe: ccLocalDateString(new Date()),
    });
  }
  document.querySelectorAll('.order-panel').forEach(p => p.style.display = 'none');
  document.getElementById('order-confirmation').style.display = 'block';
  document.getElementById('order-ref').textContent = ref;
  document.querySelector('.wizard-track').style.display = 'none';
}

function renderSummary(){
  const box = document.getElementById('order-summary');
  if(!box) return;
  const depot = Math.round(orderState.packagePrice * 0.3);
  const dateLabel = orderState.date ? new Date(orderState.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' }) : '—';
  box.innerHTML = `
    <div class="summary-row"><span>Formule choisie</span><span>${orderState.package || '—'}</span></div>
    <div class="summary-row"><span>Date souhaitée</span><span>${dateLabel}</span></div>
    <div class="summary-row"><span>Occasion</span><span>${orderState.occasion || '—'}</span></div>
    <div class="summary-row"><span>Zone de distribution</span><span>${orderState.zone || 'À confirmer'}</span></div>
    <div class="summary-row"><span>Prix indicatif</span><span>${orderState.packagePrice ? orderState.packagePrice.toLocaleString('fr-FR') + ' FCFA' : 'Sur devis'}</span></div>
    <div class="summary-row"><span>Dépôt à régler maintenant (30%)</span><span>${orderState.packagePrice ? depot.toLocaleString('fr-FR') + ' FCFA' : '—'}</span></div>
  `;
}

/* ============================================================
    Paiement — redirection vers le WhatsApp configuré par l'admin
    ============================================================ */
function showPaymentPanel(){
  document.getElementById('order-confirmation').style.display = 'none';
  const payPanel = document.getElementById('order-payment');
  payPanel.style.display = 'block';
  const depot = Math.round(orderState.packagePrice * 0.3);
  const box = document.getElementById('payment-summary');
  box.innerHTML = `
    <div class="summary-row"><span>Numéro de suivi</span><span>${orderState.ref || '—'}</span></div>
    <div class="summary-row"><span>Formule</span><span>${orderState.package || '—'}</span></div>
    <div class="summary-row"><span>Montant du dépôt (30%)</span><span>${depot.toLocaleString('fr-FR')} FCFA</span></div>
  `;
  payPanel.scrollIntoView({ behavior:'smooth', block:'start' });
}

function confirmAndPay(){
  const depot = Math.round(orderState.packagePrice * 0.3);
  let waLink = 'https://wa.me/22900000000';
  let template = "Bonjour, je souhaite finaliser le paiement de mon don {ref} d'un montant de {montant}.";
  if(typeof ccStore !== 'undefined'){
    const settings = ccStore.getSettings();
    if(settings.whatsapp_paiement) waLink = settings.whatsapp_paiement;
    if(settings.whatsapp_message) template = settings.whatsapp_message;
    ccStore.updateCommandeStatut(orderState.ref, 'Confirmée');
  }
  const message = template
    .replace('{ref}', orderState.ref || '')
    .replace('{montant}', depot.toLocaleString('fr-FR') + ' FCFA');
  const url = waLink.includes('?')
    ? `${waLink}&text=${encodeURIComponent(message)}`
    : `${waLink}?text=${encodeURIComponent(message)}`;
  window.location.href = url;
}

/* ============================================================
    Suivi de commande (démo)
    ============================================================ */
function initTracking(){
  const form = document.getElementById('track-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ref = document.getElementById('track-ref').value.trim().toUpperCase();
    const result = document.getElementById('track-result');
    const resultHw = document.getElementById('track-result-hw');
    const notFound = document.getElementById('track-notfound');
    const empty = document.getElementById('track-empty');
    result.style.display = 'none';
    resultHw.style.display = 'none';
    notFound.style.display = 'none';
    if(!ref || typeof ccStore === 'undefined') return;

    const commande = ccStore.getCommandeByRef(ref);
    const donHoraire = ccStore.getDonHoraireByRef(ref);

    if(commande){
      result.style.display = 'block';
      if(empty) empty.style.display = 'none';
      document.getElementById('track-ref-display').textContent = commande.ref;
      document.getElementById('track-package-display').textContent = commande.package;
      const stages = ['Reçue', 'Confirmée', 'En préparation', 'Réalisée'];
      const stageIndex = stages.indexOf(commande.statut);
      document.querySelectorAll('#track-result .track-status').forEach((el, i) => {
        el.classList.toggle('done', stageIndex >= 0 && i <= stageIndex);
      });
      const mediaBox = document.getElementById('track-media-box');
      const medias = ccStore.getMediasByRef(commande.ref);
      if(commande.statut === 'Réalisée' && medias.length){
        mediaBox.innerHTML = `<h3>Preuves de distribution</h3><div class="gallery-grid" style="margin-top:14px;">${
          medias.map(m => m.dataUrl
            ? `<div class="gallery-item" style="background:url('${m.dataUrl}') center/cover;"><span>${m.label}</span></div>`
            : `<div class="gallery-item tone-1"><span>${m.label}</span></div>`
          ).join('')
        }</div>`;
      }
    } else if(donHoraire){
      resultHw.style.display = 'block';
      if(empty) empty.style.display = 'none';
      document.getElementById('track-hw-ref-display').textContent = donHoraire.ref;
      document.getElementById('track-hw-cause-display').textContent = donHoraire.cagnotteNom || '';
      document.getElementById('track-hw-amount').textContent = `${Number(donHoraire.montant).toLocaleString('fr-FR')} FCFA${donHoraire.recurrent ? ' — renouvelé chaque mois' : ''}`;
      const stages = ['Reçu', 'Confirmé'];
      const stageIndex = stages.indexOf(donHoraire.statut);
      document.querySelectorAll('#track-result-hw .track-status').forEach((el, i) => {
        el.classList.toggle('done', stageIndex >= 0 && i <= stageIndex);
      });
    } else {
      notFound.style.display = 'block';
    }
  });
}

/* ============================================================
    Formulaire de contact / RSE (démo front-end)
    ============================================================ */
function initSimpleForm(formId, confirmId){
  const form = document.getElementById(formId);
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    const confirmBox = document.getElementById(confirmId);
    if(confirmBox) confirmBox.style.display = 'block';
  });
}
