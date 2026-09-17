/* ============================================================
   CUISINE CARITATIVE — Espace donateur (démo front-end)
   ============================================================ */

function compteGuard(){
  if(!ccSession.currentClient()){
    location.href = 'index.html';
  }
}

function compteRenderHeader(){
  const client = ccSession.currentClient();
  if(!client) return;
  document.getElementById('client-name').textContent = client.nom;
  document.getElementById('client-email').textContent = client.email;
  document.getElementById('logout-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    ccSession.logoutClient();
    location.href = 'index.html';
  });
}

function compteRenderDashboard(){
  const client = ccSession.currentClient();
  if(!client) return;
  const commandes = ccStore.getCommandesByContact(client.email);
  const donsHoraire = ccStore.getDonsHoraireByContact(client.email);
  const db = ccStore.get();

  const totalDons = commandes.length + donsHoraire.length;
  const montantTotal = commandes.reduce((s,c) => s + (Number(c.prix)||0), 0)
    + donsHoraire.reduce((s,d) => s + (Number(d.montant)||0), 0);
  const personnesAidees = commandes.reduce((s,c) => {
    const pkg = db.packages.find(p => p.nom === c.package);
    return s + (pkg ? (pkg.beneficiaires||0) : 0);
  }, 0);

  document.getElementById('stat-dons').textContent = totalDons;
  document.getElementById('stat-montant').textContent = ccFormatFcfa(montantTotal);
  document.getElementById('stat-personnes').textContent = personnesAidees;

  const tbody = document.getElementById('historique-body');
  const rowsCommandes = commandes.map(c => `
    <tr>
      <td><b>${c.ref}</b></td>
      <td>${c.package}</td>
      <td>${c.date || '—'}</td>
      <td>${ccFormatFcfa(c.prix)}</td>
      <td><span class="status-pill ${compteStatusClass(c.statut)}">${c.statut}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="compteDownloadInvoice('${c.ref}')">Facture</button>
        <button class="btn btn-sm btn-blue" onclick="comptePhotos('${c.ref}')">Photos</button>
      </td>
    </tr>`);
  const rowsHoraire = donsHoraire.map(d => `
    <tr>
      <td><b>${d.ref}</b></td>
      <td>1h de salaire — ${d.cagnotteNom || ''}</td>
      <td>${d.creeLe || '—'}</td>
      <td>${ccFormatFcfa(d.montant)}</td>
      <td><span class="status-pill ${compteStatusClass(d.statut === 'Confirmé' ? 'Confirmée' : 'Reçue')}">${d.statut}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="compteDownloadInvoiceHoraire('${d.ref}')">Facture</button></td>
    </tr>`);
  const allRows = rowsCommandes.concat(rowsHoraire);
  tbody.innerHTML = allRows.length ? allRows.join('') : `<tr><td colspan="6" class="hint">Vous n'avez pas encore de don enregistré avec cet email. <a href="../commande.html" style="color:var(--blue-deep);font-weight:600;">Faire un premier don</a>.</td></tr>`;

  // Galerie des médias reçus, toutes commandes confondues
  const allMedia = commandes.flatMap(c => ccStore.getMediasByRef(c.ref).map(m => ({...m, package:c.package})));
  const gal = document.getElementById('client-media-gallery');
  gal.innerHTML = allMedia.length ? allMedia.map(m => `
    <div class="gallery-item ${m.dataUrl ? '' : 'tone-1'}" style="${m.dataUrl ? `background:url('${m.dataUrl}') center/cover;` : ''}">
      <span>${m.label}</span><small>${m.package}</small>
    </div>`).join('') : '<p class="hint">Vos photos et vidéos apparaîtront ici dès qu\'une distribution aura été réalisée.</p>';
}

function compteStatusClass(s){
  return { 'Reçue':'status-recue', 'Confirmée':'status-confirmee', 'En préparation':'status-preparation', 'Réalisée':'status-realisee' }[s] || 'status-recue';
}

function comptePhotos(ref){
  document.getElementById('media-section')?.scrollIntoView({ behavior:'smooth' });
}

function compteDownloadInvoice(ref){
  const c = ccStore.getCommandeByRef(ref);
  if(!c) return;
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Facture ${c.ref}</title>
  <style>
    body{ font-family: Arial, sans-serif; color:#1C1A16; max-width:700px; margin:40px auto; padding:0 20px; }
    h1{ color:#1D5975; font-size:1.4rem; }
    table{ width:100%; border-collapse:collapse; margin-top:24px; }
    td, th{ padding:10px; border-bottom:1px solid #eee; text-align:left; }
    .total{ font-weight:bold; font-size:1.1rem; color:#1D5975; }
    .head{ display:flex; justify-content:space-between; align-items:flex-start; }
  </style></head><body>
  <div class="head">
    <div><h1>Cuisine Caritative</h1><p>Cotonou, Bénin<br>contact@cuisinecaritative.bj</p></div>
    <div style="text-align:right;"><p><b>Facture / Reçu de don</b><br>Réf. ${c.ref}<br>${c.date || ''}</p></div>
  </div>
  <table>
    <tr><th>Description</th><th>Détail</th></tr>
    <tr><td>Formule</td><td>${c.package}</td></tr>
    <tr><td>Occasion</td><td>${c.occasion || '—'}</td></tr>
    <tr><td>Zone de distribution</td><td>${c.zone || 'À confirmer'}</td></tr>
    <tr><td>Donateur</td><td>${c.nom || ''} (${c.contact || ''})</td></tr>
    <tr><td class="total">Montant du don</td><td class="total">${ccFormatFcfa(c.prix)}</td></tr>
  </table>
  <p style="margin-top:30px; color:#666; font-size:.85rem;">Ce document atteste d'un don effectué auprès de Cuisine Caritative. Merci pour votre générosité — c'est grâce à des dons comme le vôtre que nous pouvons continuer à distribuer des repas à Cotonou.</p>
  </body></html>`;
  ccDownloadText(`facture-${c.ref}.html`, html, 'text/html;charset=utf-8;');
}

function compteDownloadInvoiceHoraire(ref){
  const d = ccStore.getDonHoraireByRef(ref);
  if(!d) return;
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Facture ${d.ref}</title>
  <style>
    body{ font-family: Arial, sans-serif; color:#1C1A16; max-width:700px; margin:40px auto; padding:0 20px; }
    h1{ color:#1D5975; font-size:1.4rem; }
    table{ width:100%; border-collapse:collapse; margin-top:24px; }
    td, th{ padding:10px; border-bottom:1px solid #eee; text-align:left; }
    .total{ font-weight:bold; font-size:1.1rem; color:#1D5975; }
    .head{ display:flex; justify-content:space-between; align-items:flex-start; }
  </style></head><body>
  <div class="head">
    <div><h1>Cuisine Caritative</h1><p>Cotonou, Bénin<br>contact@cuisinecaritative.bj</p></div>
    <div style="text-align:right;"><p><b>Facture / Reçu de don</b><br>Réf. ${d.ref}<br>${d.creeLe || ''}</p></div>
  </div>
  <table>
    <tr><th>Description</th><th>Détail</th></tr>
    <tr><td>Type de don</td><td>1h de mon salaire${d.recurrent ? ' (mensuel)' : ''}</td></tr>
    <tr><td>Cagnotte soutenue</td><td>${d.cagnotteNom || ''}</td></tr>
    <tr><td>Donateur</td><td>${d.nom || ''} (${d.contact || ''})</td></tr>
    <tr><td class="total">Montant du don</td><td class="total">${ccFormatFcfa(d.montant)}</td></tr>
  </table>
  <p style="margin-top:30px; color:#666; font-size:.85rem;">Ce document atteste d'un don effectué auprès de Cuisine Caritative. Merci pour votre générosité.</p>
  </body></html>`;
  ccDownloadText(`facture-${d.ref}.html`, html, 'text/html;charset=utf-8;');
}

function compteInitAvisForm(){
  const form = document.getElementById('client-avis-form');
  if(!form) return;
  const client = ccSession.currentClient();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const avis = {
      id: 'av-' + Date.now(),
      nom: client.nom,
      ref: document.getElementById('ca-ref').value,
      note: parseInt(document.getElementById('ca-note').value, 10),
      texte: document.getElementById('ca-texte').value,
      publie: false,
      creeLe: ccLocalDateString(new Date()),
    };
    ccStore.addAvis(avis);
    document.getElementById('client-avis-confirm').style.display = 'block';
    form.reset();
    compteRenderShareLinks(avis.texte);
  });
  // Pré-remplit le sélecteur de commande
  const commandes = ccStore.getCommandesByContact(client.email);
  const sel = document.getElementById('ca-ref');
  if(sel) sel.innerHTML = '<option value="">—</option>' + commandes.map(c => `<option value="${c.ref}">${c.ref} — ${c.package}</option>`).join('');
}

function compteRenderShareLinks(texte){
  const box = document.getElementById('share-links');
  if(!box) return;
  const url = location.origin + location.pathname.replace('/compte/tableau-de-bord.html', '/index.html');
  const text = encodeURIComponent(`« ${texte} » — mon avis sur Cuisine Caritative. ${url}`);
  box.innerHTML = `
    <a class="btn btn-sm btn-outline" target="_blank" rel="noopener" href="https://wa.me/?text=${text}">Partager sur WhatsApp</a>
    <a class="btn btn-sm btn-outline" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">Partager sur Facebook</a>`;
  box.style.display = 'flex';
}
