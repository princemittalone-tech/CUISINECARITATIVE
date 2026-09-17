/* ============================================================
   CUISINE CARITATIVE — Mini calendrier partagé
   Deux usages :
   - mode "client" (commande.html) : ne montre cliquables que les
     jours ouverts par l'admin et pas encore complets.
   - mode "admin" (admin/agenda.html) : clic sur un jour pour
     ouvrir/fermer la date et fixer sa capacité (nombre de dons
     acceptés ce jour-là).
   ============================================================ */

function ccRenderCalendar(containerId, opts){
  opts = opts || {};
  const mode = opts.mode || 'client';
  let viewDate = opts.initialDate ? new Date(opts.initialDate) : new Date();
  viewDate.setDate(1);
  let selected = opts.selectedDate || null;

  function pad(n){ return String(n).padStart(2, '0'); }
  function toIso(y, m, d){ return `${y}-${pad(m + 1)}-${pad(d)}`; }

  function render(){
    const container = document.getElementById(containerId);
    if(!container || typeof ccStore === 'undefined') return;

    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const todayIso = ccLocalDateString(new Date());
    const db = ccStore.get();

    let cells = '';
    for(let i = 0; i < startWeekday; i++) cells += '<div class="cal-cell cal-empty"></div>';

    for(let d = 1; d <= daysInMonth; d++){
      const iso = toIso(y, m, d);
      const isPast = iso < todayIso;
      let cls = 'cal-cell';
      let sub = '';
      let disabled = false;

      if(mode === 'client'){
        const cap = db.disponibilites[iso] || 0;
        const pris = db.commandes.filter(c => c.date === iso).length;
        const restant = cap - pris;
        if(isPast || cap === 0 || restant <= 0){
          cls += ' cal-unavailable';
          disabled = true;
        } else {
          cls += ' cal-available';
          sub = `<small>${restant} pl.</small>`;
        }
        if(selected === iso) cls += ' cal-selected';
      } else {
        const cap = db.disponibilites[iso];
        if(isPast){ cls += ' cal-past'; }
        else if(cap){ cls += ' cal-available'; sub = `<small>${cap} pl.</small>`; }
        else { cls += ' cal-closed'; }
      }

      cells += `<button type="button" class="${cls}" data-date="${iso}" ${disabled ? 'disabled' : ''}>${d}${sub}</button>`;
    }

    container.innerHTML = `
      <div class="cal-head">
        <button type="button" class="cal-nav" data-dir="-1" aria-label="Mois précédent">&larr;</button>
        <b>${monthNames[m]} ${y}</b>
        <button type="button" class="cal-nav" data-dir="1" aria-label="Mois suivant">&rarr;</button>
      </div>
      <div class="cal-weekdays"><span>Lu</span><span>Ma</span><span>Me</span><span>Je</span><span>Ve</span><span>Sa</span><span>Di</span></div>
      <div class="cal-grid">${cells}</div>
      ${mode === 'client' ? '<div class="cal-legend"><span><i class="cal-dot cal-dot-available"></i> Disponible</span><span><i class="cal-dot cal-dot-unavailable"></i> Complet / fermé</span></div>' : '<p class="hint">Cliquez un jour pour l\'ouvrir ou fermer aux dons, et fixer sa capacité.</p>'}
    `;

    container.querySelectorAll('.cal-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        viewDate.setMonth(viewDate.getMonth() + parseInt(btn.getAttribute('data-dir'), 10));
        render();
      });
    });

    container.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
      if(cell.hasAttribute('disabled')) return;
      cell.addEventListener('click', () => {
        const iso = cell.getAttribute('data-date');
        if(mode === 'client'){
          selected = iso;
          if(opts.onSelectDate) opts.onSelectDate(iso);
          render();
        } else {
          const current = db.disponibilites[iso] || 0;
          const input = prompt(
            `Capacité pour le ${iso} (nombre de dons acceptés ce jour-là).\nMettez 0 pour fermer ce jour aux réservations.`,
            current || 4
          );
          if(input === null) return;
          const cap = parseInt(input, 10);
          if(isNaN(cap) || cap < 0) return;
          ccStore.setDateCapacite(iso, cap);
          render();
          if(opts.onChange) opts.onChange();
        }
      });
    });
  }

  render();
  return {
    refresh: render,
    setSelected(iso){ selected = iso; render(); },
    getSelected(){ return selected; },
  };
}
