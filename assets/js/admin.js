/* ============================================================
   CUISINE CARITATIVE — Espace admin (démo front-end)
   ============================================================ */

const ADMIN_NAV = [
  { href:'dashboard.html', label:'Tableau de bord', icon:'📊' },
  { href:'commandes.html', label:'Commandes', icon:'🧾' },
  { href:'dons-horaire.html', label:'Dons "1h de salaire"', icon:'⏱️' },
  { href:'agenda.html', label:'Agenda', icon:'📅' },
  { href:'packages.html', label:'Packages & prix', icon:'💰' },
  { href:'cagnottes.html', label:'Cagnottes (1h)', icon:'🤝' },
  { href:'medias.html', label:'Photos & vidéos', icon:'🖼️' },
  { href:'avis.html', label:'Avis clients', icon:'💬' },
  { href:'parametres.html', label:'Paramètres', icon:'⚙️' },
  { href:'export.html', label:'Export des données', icon:'⬇️' },
];

function adminGuard(){
  if(!ccSession.isAdmin()){
    location.href = 'index.html';
  }
}

function adminRenderShell(activeHref, title, subtitle){
  const navHtml = ADMIN_NAV.map(item => `<a href="${item.href}" class="${item.href===activeHref?'active':''}">${item.icon} ${item.label}</a>`).join('');
  document.getElementById('admin-sidebar').innerHTML = `
    <div class="brand-mini"><img src="../assets/img/logo-icone.png" alt=""><span>Admin</span></div>
    <nav class="admin-nav">${navHtml}</nav>
    <div class="admin-foot">
      <a href="../index.html">← Voir le site public</a><br><br>
      <a href="#" id="admin-logout">Se déconnecter</a>
    </div>`;
  document.getElementById('admin-title').textContent = title;
  if(subtitle) document.getElementById('admin-subtitle').textContent = subtitle;
  document.getElementById('admin-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    ccSession.logoutAdmin();
    location.href = 'index.html';
  });
}

/* ---------- Tableau de bord ---------- */
function adminRenderDashboard(){
  const db = ccStore.get();
  const totalDons = db.commandes.length;
  const montantTotal = db.commandes.reduce((s,c) => s + (Number(c.prix)||0), 0);
  const familles = db.commandes.reduce((s,c) => {
    const pkg = db.packages.find(p => p.nom === c.package);
    return s + (pkg ? (pkg.beneficiaires||0) : 0);
  }, 0);
  const totalVues = db.analytics_pageviews.length;

  document.getElementById('kpi-dons').textContent = totalDons;
  document.getElementById('kpi-montant').textContent = ccFormatFcfa(montantTotal);
  document.getElementById('kpi-beneficiaires').textContent = familles;
  document.getElementById('kpi-vues').textContent = totalVues;

  // Pages les plus vues
  const byPage = {};
  db.analytics_pageviews.forEach(pv => { byPage[pv.page] = (byPage[pv.page]||0) + 1; });
  const pages = Object.entries(byPage).sort((a,b) => b[1]-a[1]).slice(0,8);
  const maxPv = Math.max(1, ...pages.map(p => p[1]));
  document.getElementById('pages-list').innerHTML = pages.length ? pages.map(([page,count]) => `
    <div class="bar-row">
      <span class="label">${page}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxPv*100)}%;"></div></div>
      <span class="val">${count}</span>
    </div>`).join('') : '<p class="hint">Aucune visite enregistrée pour le moment — naviguez sur le site public pour générer des données de démonstration.</p>';

  // Fonctionnalités / éléments les plus cliqués
  const byLabel = {};
  db.analytics_clicks.forEach(c => { const k = c.label; byLabel[k] = (byLabel[k]||0) + 1; });
  const labels = Object.entries(byLabel).sort((a,b) => b[1]-a[1]).slice(0,8);
  const maxCl = Math.max(1, ...labels.map(l => l[1]));
  document.getElementById('clicks-list').innerHTML = labels.length ? labels.map(([label,count]) => `
    <div class="bar-row">
      <span class="label" title="${label}">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/maxCl*100)}%; background:linear-gradient(90deg,var(--gold),var(--gold-deep));"></div></div>
      <span class="val">${count}</span>
    </div>`).join('') : '<p class="hint">Aucun clic enregistré pour le moment.</p>';

  // Carte des zones cliquées (position relative des clics, toutes pages confondues)
  const heat = document.getElementById('heatmap');
  if(heat){
    heat.innerHTML = '';
    db.analytics_clicks.slice(-300).forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'heatmap-dot';
      dot.style.left = Math.min(99, Math.max(1, c.x)) + '%';
      dot.style.top = Math.min(99, Math.max(1, c.y)) + '%';
      dot.title = c.label + ' — ' + c.page;
      heat.appendChild(dot);
    });
    if(!db.analytics_clicks.length){
      heat.innerHTML = '<p class="hint" style="padding:20px;">Aucun clic enregistré pour le moment.</p>';
    }
  }

  // Dernières commandes
  const recent = db.commandes.slice(0, 6);
  document.getElementById('recent-orders').innerHTML = recent.length ? recent.map(c => `
    <tr>
      <td><b>${c.ref}</b></td>
      <td>${c.nom || '—'}</td>
      <td>${c.package}</td>
      <td>${ccFormatFcfa(c.prix)}</td>
      <td><span class="status-pill ${adminStatusClass(c.statut)}">${c.statut}</span></td>
    </tr>`).join('') : '<tr><td colspan="5" class="hint">Aucune commande pour le moment.</td></tr>';
}

function adminStatusClass(s){
  return { 'Reçue':'status-recue', 'Confirmée':'status-confirmee', 'En préparation':'status-preparation', 'Réalisée':'status-realisee' }[s] || 'status-recue';
}

/* ---------- Commandes ---------- */
function adminRenderCommandes(){
  const tbody = document.getElementById('commandes-body');
  const db = ccStore.get();
  if(!db.commandes.length){ tbody.innerHTML = '<tr><td colspan="7" class="hint">Aucune commande.</td></tr>'; return; }
  tbody.innerHTML = db.commandes.map(c => `
    <tr>
      <td><b>${c.ref}</b></td>
      <td>${c.nom||'—'}<br><span class="hint">${c.contact||''}</span></td>
      <td>${c.package}</td>
      <td>${ccFormatFcfa(c.prix)}</td>
      <td>${c.date||'—'}</td>
      <td>
        <select data-ref="${c.ref}" class="statut-select">
          ${['Reçue','Confirmée','En préparation','Réalisée'].map(s => `<option value="${s}" ${s===c.statut?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><a href="medias.html?ref=${encodeURIComponent(c.ref)}" class="btn btn-sm btn-outline">Envoyer médias</a></td>
    </tr>`).join('');

  tbody.querySelectorAll('.statut-select').forEach(sel => {
    sel.addEventListener('change', () => {
      ccStore.updateCommandeStatut(sel.getAttribute('data-ref'), sel.value);
      adminToast('Statut mis à jour.');
    });
  });
}

/* ---------- Packages & prix ---------- */
function adminRenderPackages(){
  const tbody = document.getElementById('packages-body');
  const list = ccStore.getPackages(false);
  tbody.innerHTML = list.map(p => `
    <tr data-id="${p.id}">
      <td><input type="text" class="f-nom" value="${p.nom}"></td>
      <td><input type="text" class="f-tag" value="${p.tag||''}"></td>
      <td><input type="number" class="f-prix" value="${p.prix}" min="0" step="500"></td>
      <td><input type="number" class="f-benef" value="${p.beneficiaires||0}" min="0"></td>
      <td><input type="text" class="f-delai" value="${p.delai||''}"></td>
      <td style="text-align:center;"><input type="checkbox" class="f-actif" ${p.actif?'checked':''}></td>
      <td style="text-align:center;"><input type="checkbox" class="f-vedette" ${p.vedette?'checked':''}></td>
      <td>
        <button class="btn btn-sm btn-blue f-save">Enregistrer</button>
        <button class="btn btn-sm btn-outline f-delete">Suppr.</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    const id = row.getAttribute('data-id');
    row.querySelector('.f-save').addEventListener('click', () => {
      const original = list.find(p => p.id === id);
      const updated = {
        ...original,
        nom: row.querySelector('.f-nom').value,
        tag: row.querySelector('.f-tag').value,
        prix: parseInt(row.querySelector('.f-prix').value, 10) || 0,
        beneficiaires: parseInt(row.querySelector('.f-benef').value, 10) || 0,
        delai: row.querySelector('.f-delai').value,
        actif: row.querySelector('.f-actif').checked,
        vedette: row.querySelector('.f-vedette').checked,
      };
      ccStore.savePackage(updated);
      adminToast(`« ${updated.nom} » enregistré. Le nouveau prix est visible immédiatement sur le site public (même navigateur).`);
    });
    row.querySelector('.f-delete').addEventListener('click', () => {
      if(confirm('Supprimer cette formule ?')){
        ccStore.deletePackage(id);
        adminRenderPackages();
      }
    });
  });
}

function adminAddPackage(){
  const id = 'pk-custom-' + Date.now();
  ccStore.savePackage({
    id, categorie:'surmesure', tag:'Nouvelle formule', nom:'Nouvelle formule',
    prix:20000, unite:'/ opération', beneficiaires:10, delai:'5 à 7 jours',
    description:'Décrivez cette formule.', actif:true, vedette:false,
  });
  adminRenderPackages();
}

/* ---------- Médias : envoi de photos/vidéos aux clients ---------- */
function adminRenderMedias(){
  const select = document.getElementById('media-ref-select');
  const commandes = ccStore.getCommandes();
  select.innerHTML = commandes.map(c => `<option value="${c.ref}">${c.ref} — ${c.nom || 'client'} (${c.package})</option>`).join('');

  const params = new URLSearchParams(location.search);
  const presetRef = params.get('ref');
  if(presetRef) select.value = presetRef;

  adminRenderMediaList();
  select.addEventListener('change', adminRenderMediaList);
}

function adminRenderMediaList(){
  const ref = document.getElementById('media-ref-select').value;
  const list = ccStore.getMediasByRef(ref);
  const el = document.getElementById('media-thumb-row');
  el.innerHTML = list.length ? list.map(m => m.dataUrl
      ? `<img class="media-thumb" src="${m.dataUrl}" alt="${m.label}" title="${m.label}">`
      : `<div class="media-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--blue-pale);font-size:1.4rem;">🎬</div>`
    ).join('') : '<p class="hint">Aucun média envoyé pour cette commande.</p>';
}

function adminHandleMediaUpload(files){
  const ref = document.getElementById('media-ref-select').value;
  if(!ref){ adminToast('Choisissez une commande.'); return; }
  const label = document.getElementById('media-label').value || 'Preuve de distribution';
  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      ccStore.addMedia({
        id: 'md-' + Date.now() + Math.random().toString(36).slice(2,6),
        ref, type: file.type.startsWith('video') ? 'video' : 'photo',
        label, dataUrl: file.type.startsWith('image') ? e.target.result : '',
        envoyeLe: ccLocalDateString(new Date()),
      });
      adminRenderMediaList();
    };
    reader.readAsDataURL(file);
  });
}

function adminSendToClient(){
  const ref = document.getElementById('media-ref-select').value;
  if(!ref){ adminToast('Choisissez une commande.'); return; }
  ccStore.updateCommandeStatut(ref, 'Réalisée');
  ccStore.addNotification({
    ref, canal: (ccStore.getCommandeByRef(ref)||{}).canal || 'email',
    envoyeLe: new Date().toISOString(),
    message: 'Vos photos/vidéos de distribution sont disponibles dans votre espace donateur.',
  });
  adminToast(`Client notifié pour la commande ${ref}. Statut passé à "Réalisée".`);
}

/* ---------- Avis clients ---------- */
function adminRenderAvis(){
  const tbody = document.getElementById('avis-body');
  const list = ccStore.getAvis(false);
  tbody.innerHTML = list.length ? list.map(a => `
    <tr>
      <td><b>${a.nom}</b><br><span class="hint">${a.ref||''}</span></td>
      <td style="max-width:360px;">${a.texte}</td>
      <td>${'★'.repeat(a.note||5)}</td>
      <td><span class="status-pill ${a.publie?'status-realisee':'status-recue'}">${a.publie?'Publié':'En attente'}</span></td>
      <td><button class="btn btn-sm ${a.publie?'btn-outline':'btn-blue'}" data-id="${a.id}" data-next="${!a.publie}">${a.publie?'Dépublier':'Publier'}</button></td>
    </tr>`).join('') : '<tr><td colspan="5" class="hint">Aucun avis pour le moment.</td></tr>';

  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      ccStore.setAvisPublie(btn.getAttribute('data-id'), btn.getAttribute('data-next') === 'true');
      adminRenderAvis();
    });
  });
}

/* ---------- Export ---------- */
function adminExportAll(){ ccDownloadJson('cuisine-caritative-export-complet.json', ccStore.exportAll()); }
function adminExportCommandes(){ ccDownloadCsv('commandes.csv', ccStore.getCommandes()); }
function adminExportPackages(){ ccDownloadCsv('packages.csv', ccStore.getPackages(false)); }
function adminExportAvis(){ ccDownloadCsv('avis.csv', ccStore.getAvis(false)); }
function adminExportAnalytics(){
  const a = ccStore.getAnalytics();
  ccDownloadJson('analytics.json', a);
}

/* ---------- Dons "1h de mon salaire" ---------- */
function adminRenderDonsHoraire(){
  const tbody = document.getElementById('dons-horaire-body');
  const list = ccStore.getDonsHoraire();
  tbody.innerHTML = list.length ? list.map(d => `
    <tr>
      <td><b>${d.ref}</b></td>
      <td>${d.nom||'—'}<br><span class="hint">${d.contact||''}</span></td>
      <td>${d.cagnotteNom||'—'}</td>
      <td>${ccFormatFcfa(d.montant)}${d.recurrent ? ' <span class="hint">/mois</span>' : ''}</td>
      <td>${d.creeLe||'—'}</td>
      <td>
        <select data-ref="${d.ref}" class="hw-statut-select">
          ${['Reçu','Confirmé'].map(s => `<option value="${s}" ${s===d.statut?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('') : '<tr><td colspan="6" class="hint">Aucun don « 1h de salaire » pour le moment.</td></tr>';

  tbody.querySelectorAll('.hw-statut-select').forEach(sel => {
    sel.addEventListener('change', () => {
      ccStore.updateDonHoraireStatut(sel.getAttribute('data-ref'), sel.value);
      adminToast('Statut mis à jour.');
    });
  });
}

/* ---------- Cagnottes (causes du don "1h de mon salaire") ---------- */
function adminRenderCagnottes(){
  const tbody = document.getElementById('cagnottes-body');
  const list = ccStore.getCagnottes(false);
  tbody.innerHTML = list.map(cg => `
    <tr data-id="${cg.id}">
      <td><input type="text" class="f-nom" value="${cg.nom}"></td>
      <td><input type="text" class="f-desc" value="${cg.description||''}" style="min-width:220px;"></td>
      <td><input type="number" class="f-objectif" value="${cg.objectif}" min="0" step="10000"></td>
      <td><input type="number" class="f-collecte" value="${cg.collecte}" min="0" step="1000"></td>
      <td><input type="number" class="f-contrib" value="${cg.contributeurs}" min="0"></td>
      <td style="text-align:center;"><input type="checkbox" class="f-actif" ${cg.actif?'checked':''}></td>
      <td>
        <button class="btn btn-sm btn-blue f-save">Enregistrer</button>
        <button class="btn btn-sm btn-outline f-delete">Suppr.</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    const id = row.getAttribute('data-id');
    row.querySelector('.f-save').addEventListener('click', () => {
      const original = list.find(c => c.id === id);
      const updated = {
        ...original,
        nom: row.querySelector('.f-nom').value,
        description: row.querySelector('.f-desc').value,
        objectif: parseInt(row.querySelector('.f-objectif').value, 10) || 0,
        collecte: parseInt(row.querySelector('.f-collecte').value, 10) || 0,
        contributeurs: parseInt(row.querySelector('.f-contrib').value, 10) || 0,
        actif: row.querySelector('.f-actif').checked,
      };
      ccStore.saveCagnotte(updated);
      adminToast(`« ${updated.nom} » enregistrée.`);
    });
    row.querySelector('.f-delete').addEventListener('click', () => {
      if(confirm('Supprimer cette cagnotte ?')){
        ccStore.deleteCagnotte(id);
        adminRenderCagnottes();
      }
    });
  });
}

function adminAddCagnotte(){
  const id = 'cg-custom-' + Date.now();
  ccStore.saveCagnotte({
    id, nom:'Nouvelle cagnotte', description:'Décrivez cette cause.',
    objectif:500000, collecte:0, contributeurs:0, actif:true,
  });
  adminRenderCagnottes();
}

/* ---------- Agenda (disponibilités) ---------- */
function adminRenderAgenda(){
  if(typeof ccRenderCalendar === 'undefined') return;
  ccRenderCalendar('admin-calendar', {
    mode: 'admin',
    onChange: adminRenderAgendaList,
  });
  adminRenderAgendaList();
}

function adminRenderAgendaList(){
  const box = document.getElementById('agenda-list');
  if(!box) return;
  const db = ccStore.get();
  const todayIso = ccLocalDateString(new Date());
  const entries = Object.entries(db.disponibilites)
    .filter(([iso]) => iso >= todayIso)
    .sort(([a], [b]) => a.localeCompare(b));
  box.innerHTML = entries.length ? entries.map(([iso, cap]) => {
    const pris = db.commandes.filter(c => c.date === iso).length;
    return `<div class="bar-row">
      <span class="label">${iso}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.round(pris/cap*100))}%;"></div></div>
      <span class="val">${pris}/${cap}</span>
    </div>`;
  }).join('') : '<p class="hint">Aucun jour ouvert pour l\'instant — cliquez sur le calendrier pour en ouvrir.</p>';
}

/* ---------- Paramètres ---------- */
function adminRenderSettings(){
  const s = ccStore.getSettings();
  document.getElementById('set-whatsapp').value = s.whatsapp_paiement || '';
  document.getElementById('set-message').value = s.whatsapp_message || '';
}

function adminSaveSettings(){
  const whatsapp = document.getElementById('set-whatsapp').value.trim();
  const message = document.getElementById('set-message').value.trim();
  ccStore.saveSettings({ whatsapp_paiement: whatsapp, whatsapp_message: message });
  adminToast('Paramètres enregistrés.');
}

/* ---------- Petit toast de confirmation ---------- */
function adminToast(msg){
  let t = document.getElementById('admin-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'admin-toast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--ink);color:#fff;padding:14px 22px;border-radius:12px;font-size:.9rem;z-index:999;max-width:340px;box-shadow:0 10px 30px rgba(0,0,0,.3);';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3200);
}
