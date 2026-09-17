/* ============================================================
   CUISINE CARITATIVE — Store de données (démo front-end)
   ------------------------------------------------------------
   Tout est persisté dans le localStorage du navigateur. C'est un
   prototype fonctionnel pour valider les parcours admin / donateur
   avant de brancher une vraie base de données côté serveur.
   Aucune donnée n'est partagée entre appareils ou navigateurs.
   ============================================================ */

const CC_DB_KEY = 'cc_db_v1';

const CC_SEED = {
  packages: [
    { id:'pk-enfants-50', categorie:'enfance', tag:'Le plus demandé', nom:'Panier repas x50 enfants', prix:45000, unite:'/ opération', beneficiaires:50, delai:'5 à 7 jours', description:"Un repas chaud complet préparé et distribué à 50 enfants dans le quartier de votre choix.", actif:true, vedette:true },
    { id:'pk-enfants-100', categorie:'enfance', tag:'Panier repas', nom:'Panier repas x100 enfants', prix:85000, unite:'/ opération', beneficiaires:100, delai:'7 à 10 jours', description:"Le format double pour les écoles, orphelinats ou grands quartiers.", actif:true, vedette:false },
    { id:'pk-famille-1m', categorie:'famille', tag:'Aide durable', nom:'Vivres pour 1 famille / 1 mois', prix:35000, unite:'/ mois', beneficiaires:6, delai:'3 à 5 jours', description:"Un panier de vivres de base livré à une famille pour tenir un mois.", actif:true, vedette:false },
    { id:'pk-famille-3m', categorie:'famille', tag:'Aide durable', nom:'Vivres pour 1 famille / 3 mois', prix:95000, unite:'/ trimestre', beneficiaires:6, delai:'3 à 5 jours', description:"Un accompagnement plus long pour une famille suivie avec nos partenaires de quartier.", actif:true, vedette:false },
    { id:'pk-deuil', categorie:'deuil', tag:'Hommage', nom:'Aumône funérailles', prix:60000, unite:'/ opération', beneficiaires:15, delai:'5 à 7 jours', description:"Distribution de vivres au nom d'un défunt, avec dédicace lue aux familles bénéficiaires.", actif:true, vedette:true },
    { id:'pk-deuil-xl', categorie:'deuil', tag:'Hommage', nom:'Aumône funérailles — grand format', prix:120000, unite:'/ opération', beneficiaires:30, delai:'7 à 10 jours', description:"Pour honorer une mémoire à plus grande échelle.", actif:true, vedette:false },
    { id:'pk-ramadan', categorie:'religieux', tag:'Occasion religieuse', nom:'Aumône Ramadan', prix:70000, unite:'/ opération', beneficiaires:20, delai:'Avant l\'Iftar', description:"Panier repas pour la rupture du jeûne, distribué aux familles du quartier de votre choix.", actif:true, vedette:false },
    { id:'pk-tabaski', categorie:'religieux', tag:'Occasion religieuse', nom:'Aumône Tabaski', prix:80000, unite:'/ opération', beneficiaires:20, delai:'Le jour J', description:"Distribution de viande et vivres à l'occasion de la Tabaski.", actif:true, vedette:false },
    { id:'pk-surmesure', categorie:'surmesure', tag:'Sur-mesure', nom:'Formule sur-mesure', prix:10000, unite:'dès', beneficiaires:0, delai:'Variable', description:"Indiquez votre budget : nous calculons ce qu'il permet de réaliser.", actif:true, vedette:true },
  ],
  commandes: [
    { ref:'CC-482913', package:'Aumône funérailles', prix:60000, date:'2026-08-18', occasion:'Deuil / funérailles', zone:'Cadjèhoun', nom:'Rachida A.', contact:'rachida@email.com', canal:'email', statut:'Réalisée', creeLe:'2026-08-10' },
    { ref:'CC-556201', package:'Panier repas x50 enfants', prix:45000, date:'2026-09-02', occasion:'Geste spontané', zone:'Akpakpa', nom:'Sandra M.', contact:'sandra@email.com', canal:'whatsapp', statut:'En préparation', creeLe:'2026-08-29' },
    { ref:'CC-119284', package:'Aumône Ramadan', prix:70000, date:'2026-09-10', occasion:'Ramadan / Tabaski', zone:'Fidjrossè', nom:'Brice K.', contact:'brice@entreprise.bj', canal:'email', statut:'Confirmée', creeLe:'2026-09-01' },
  ],
  medias: [
    { id:'md-1', ref:'CC-482913', type:'photo', label:'Distribution du 18 août', dataUrl:'', envoyeLe:'2026-08-19' },
  ],
  avis: [
    { id:'av-1', nom:'Rachida A.', ref:'CC-482913', note:5, texte:"Cuisine Caritative a organisé la distribution en mon nom le jour même de l'enterrement. J'ai reçu les photos avant même de me reconnecter à internet.", publie:true, creeLe:'2026-08-20' },
    { id:'av-2', nom:'Brice K.', ref:'CC-119284', note:5, texte:"Le rapport d'impact envoyé après chaque campagne facilite énormément notre communication interne.", publie:true, creeLe:'2026-09-03' },
    { id:'av-3', nom:'Sandra M.', ref:'CC-556201', note:5, texte:"Je n'ai jamais eu un gros budget à donner, mais mon heure de salaire chaque mois s'additionne à celle de 127 autres personnes.", publie:true, creeLe:'2026-08-05' },
  ],
  comptes: [
    { email:'rachida@email.com', nom:'Rachida A.', motdepasse:'demo1234' },
  ],
  cagnottes: [
    { id:'cg-ramadan', nom:'Ramadan — 50 familles', description:"Panier repas pour la rupture du jeûne, distribué à 50 familles du quartier.", objectif:500000, collecte:310000, contributeurs:128, actif:true },
    { id:'cg-rentree', nom:'Rentrée scolaire', description:"Fournitures scolaires pour 80 enfants de familles suivies.", objectif:500000, collecte:190000, contributeurs:76, actif:true },
    { id:'cg-inondations', nom:'Urgence inondations', description:"Vivres d'urgence pour le quartier lacustre touché par les inondations.", objectif:500000, collecte:405000, contributeurs:203, actif:true },
  ],
  dons_horaire: [],
  disponibilites: {},
  settings: {
    whatsapp_paiement: 'https://wa.me/22900000000',
    whatsapp_message: "Bonjour, je souhaite finaliser le paiement de mon don {ref} d'un montant de {montant}. Merci !",
  },
  notifications: [],
  analytics_pageviews: [],
  analytics_clicks: [],
};

function ccLocalDateString(date = new Date()){
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

// Pré-remplit quelques jours disponibles pour la démo (les 3 prochaines semaines,
// dimanches fermés) — l'admin peut ensuite tout reconfigurer depuis l'agenda.
function ccGenerateSeedDisponibilites(){
  const dates = {};
  const today = new Date();
  for(let i = 1; i <= 21; i++){
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if(d.getDay() === 0) continue; // dimanche fermé par défaut
    const iso = ccLocalDateString(d);
    dates[iso] = 4; // capacité par défaut : 4 commandes / jour
  }
  return dates;
}

function ccLoadDb(){
  try{
    const raw = localStorage.getItem(CC_DB_KEY);
    if(!raw){
      const fresh = JSON.parse(JSON.stringify(CC_SEED));
      fresh.disponibilites = ccGenerateSeedDisponibilites();
      fresh._disponibilites_init = true;
      localStorage.setItem(CC_DB_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw);
    // Complète les collections manquantes si le schéma évolue
    Object.keys(CC_SEED).forEach(k => { if(!(k in parsed)) parsed[k] = CC_SEED[k]; });
    if(!parsed._disponibilites_init){
      parsed.disponibilites = ccGenerateSeedDisponibilites();
      parsed._disponibilites_init = true;
    }
    return parsed;
  } catch(e){
    console.error('Erreur de lecture du store', e);
    const fresh = JSON.parse(JSON.stringify(CC_SEED));
    fresh.disponibilites = ccGenerateSeedDisponibilites();
    fresh._disponibilites_init = true;
    return fresh;
  }
}

function ccSaveDb(db){
  try{
    localStorage.setItem(CC_DB_KEY, JSON.stringify(db));
    return true;
  } catch(e){
    console.error('Erreur d\'écriture du store (quota localStorage dépassé ?)', e);
    return false;
  }
}

const ccStore = {
  get(){ return ccLoadDb(); },

  resetDemo(){
    localStorage.setItem(CC_DB_KEY, JSON.stringify(CC_SEED));
    return ccLoadDb();
  },

  // ---------- Packages ----------
  getPackages(onlyActive){
    const db = ccLoadDb();
    return onlyActive ? db.packages.filter(p => p.actif) : db.packages;
  },
  savePackage(pkg){
    const db = ccLoadDb();
    const i = db.packages.findIndex(p => p.id === pkg.id);
    if(i >= 0) db.packages[i] = pkg; else db.packages.push(pkg);
    ccSaveDb(db);
  },
  deletePackage(id){
    const db = ccLoadDb();
    db.packages = db.packages.filter(p => p.id !== id);
    ccSaveDb(db);
  },

  // ---------- Commandes ----------
  getCommandes(){ return ccLoadDb().commandes; },
  getCommandeByRef(ref){ return ccLoadDb().commandes.find(c => c.ref === ref); },
  getCommandesByContact(contact){
    const c = (contact || '').trim().toLowerCase();
    return ccLoadDb().commandes.filter(cm => (cm.contact || '').toLowerCase() === c);
  },
  addCommande(cmd){
    const db = ccLoadDb();
    db.commandes.unshift(cmd);
    ccSaveDb(db);
  },
  updateCommandeStatut(ref, statut){
    const db = ccLoadDb();
    const c = db.commandes.find(c => c.ref === ref);
    if(c){ c.statut = statut; ccSaveDb(db); }
  },
  countCommandesOnDate(dateIso){
    const db = ccLoadDb();
    return db.commandes.filter(c => c.date === dateIso).length;
  },

  // ---------- Cagnottes (dons "1h de mon salaire") ----------
  getCagnottes(onlyActive){
    const db = ccLoadDb();
    return onlyActive ? db.cagnottes.filter(c => c.actif) : db.cagnottes;
  },
  getCagnotteById(id){ return ccLoadDb().cagnottes.find(c => c.id === id); },
  saveCagnotte(cagnotte){
    const db = ccLoadDb();
    const i = db.cagnottes.findIndex(c => c.id === cagnotte.id);
    if(i >= 0) db.cagnottes[i] = cagnotte; else db.cagnottes.push(cagnotte);
    ccSaveDb(db);
  },
  deleteCagnotte(id){
    const db = ccLoadDb();
    db.cagnottes = db.cagnottes.filter(c => c.id !== id);
    ccSaveDb(db);
  },

  // ---------- Dons "1h de mon salaire" ----------
  getDonsHoraire(){ return ccLoadDb().dons_horaire; },
  getDonHoraireByRef(ref){ return ccLoadDb().dons_horaire.find(d => d.ref === ref); },
  getDonsHoraireByContact(contact){
    const c = (contact || '').trim().toLowerCase();
    return ccLoadDb().dons_horaire.filter(d => (d.contact || '').toLowerCase() === c);
  },
  addDonHoraire(don){
    const db = ccLoadDb();
    db.dons_horaire.unshift(don);
    const cg = db.cagnottes.find(c => c.id === don.cagnotteId);
    if(cg){ cg.collecte = (cg.collecte||0) + Number(don.montant||0); cg.contributeurs = (cg.contributeurs||0) + 1; }
    ccSaveDb(db);
  },
  updateDonHoraireStatut(ref, statut){
    const db = ccLoadDb();
    const d = db.dons_horaire.find(d => d.ref === ref);
    if(d){ d.statut = statut; ccSaveDb(db); }
  },

  // ---------- Disponibilités (agenda admin) ----------
  getDisponibilites(){ return ccLoadDb().disponibilites; },
  setDateCapacite(dateIso, capacite){
    const db = ccLoadDb();
    if(capacite > 0) db.disponibilites[dateIso] = capacite;
    else delete db.disponibilites[dateIso];
    ccSaveDb(db);
  },
  isDateDisponible(dateIso){
    const db = ccLoadDb();
    const cap = db.disponibilites[dateIso];
    if(!cap) return false;
    const pris = db.commandes.filter(c => c.date === dateIso).length;
    return pris < cap;
  },
  getPlacesRestantes(dateIso){
    const db = ccLoadDb();
    const cap = db.disponibilites[dateIso] || 0;
    const pris = db.commandes.filter(c => c.date === dateIso).length;
    return Math.max(0, cap - pris);
  },

  // ---------- Paramètres (lien WhatsApp de paiement, etc.) ----------
  getSettings(){ return ccLoadDb().settings; },
  saveSettings(settings){
    const db = ccLoadDb();
    db.settings = { ...db.settings, ...settings };
    ccSaveDb(db);
  },

  // ---------- Médias ----------
  getMedias(){ return ccLoadDb().medias; },
  getMediasByRef(ref){ return ccLoadDb().medias.filter(m => m.ref === ref); },
  addMedia(media){
    const db = ccLoadDb();
    db.medias.push(media);
    return ccSaveDb(db);
  },

  // ---------- Notifications (traçabilité des envois aux clients) ----------
  addNotification(note){
    const db = ccLoadDb();
    db.notifications.unshift(note);
    ccSaveDb(db);
  },
  getNotifications(){ return ccLoadDb().notifications; },

  // ---------- Avis ----------
  getAvis(onlyPublished){
    const db = ccLoadDb();
    return onlyPublished ? db.avis.filter(a => a.publie) : db.avis;
  },
  addAvis(avis){
    const db = ccLoadDb();
    db.avis.unshift(avis);
    ccSaveDb(db);
  },
  setAvisPublie(id, publie){
    const db = ccLoadDb();
    const a = db.avis.find(a => a.id === id);
    if(a){ a.publie = publie; ccSaveDb(db); }
  },

  // ---------- Comptes donateurs ----------
  getComptes(){ return ccLoadDb().comptes; },
  findCompte(email){
    const e = (email || '').trim().toLowerCase();
    return ccLoadDb().comptes.find(c => c.email.toLowerCase() === e);
  },
  createCompte(compte){
    const db = ccLoadDb();
    db.comptes.push(compte);
    ccSaveDb(db);
  },

  // ---------- Analytics ----------
  logPageview(page){
    const db = ccLoadDb();
    db.analytics_pageviews.push({ page, ts: Date.now() });
    if(db.analytics_pageviews.length > 4000) db.analytics_pageviews.splice(0, 1000);
    ccSaveDb(db);
  },
  logClick(entry){
    const db = ccLoadDb();
    db.analytics_clicks.push({ ...entry, ts: Date.now() });
    if(db.analytics_clicks.length > 4000) db.analytics_clicks.splice(0, 1000);
    ccSaveDb(db);
  },
  getAnalytics(){
    const db = ccLoadDb();
    return { pageviews: db.analytics_pageviews, clicks: db.analytics_clicks };
  },
  clearAnalytics(){
    const db = ccLoadDb();
    db.analytics_pageviews = [];
    db.analytics_clicks = [];
    ccSaveDb(db);
  },

  // ---------- Export ----------
  exportAll(){ return ccLoadDb(); },
};

// ---------- Session courante (admin + client) ----------
const ccSession = {
  isAdmin(){ return sessionStorage.getItem('cc_admin') === '1'; },
  loginAdmin(pass){
    // Démo uniquement — un vrai back-office doit authentifier côté serveur.
    if(pass === 'caritative2026'){ sessionStorage.setItem('cc_admin', '1'); return true; }
    return false;
  },
  logoutAdmin(){ sessionStorage.removeItem('cc_admin'); },

  currentClient(){
    const raw = localStorage.getItem('cc_client_session');
    return raw ? JSON.parse(raw) : null;
  },
  loginClient(email, motdepasse){
    const compte = ccStore.findCompte(email);
    if(compte && compte.motdepasse === motdepasse){
      localStorage.setItem('cc_client_session', JSON.stringify({ email: compte.email, nom: compte.nom }));
      return true;
    }
    return false;
  },
  registerClient(nom, email, motdepasse){
    if(ccStore.findCompte(email)) return false;
    ccStore.createCompte({ email, nom, motdepasse });
    localStorage.setItem('cc_client_session', JSON.stringify({ email, nom }));
    return true;
  },
  logoutClient(){ localStorage.removeItem('cc_client_session'); },
};

// ---------- Utilitaires ----------
function ccFormatFcfa(n){ return (Number(n) || 0).toLocaleString('fr-FR') + ' FCFA'; }
function ccDownloadJson(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function ccDownloadCsv(filename, rows){
  if(!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function ccDownloadText(filename, text, mime){
  const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
