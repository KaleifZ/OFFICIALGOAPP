const $ = id => document.getElementById(id);
const modeInputs = [...document.querySelectorAll('#modes input')];
let lastSearch = null;
modeInputs.forEach(input => input.addEventListener('change', () => input.closest('.mode').classList.toggle('active', input.checked)));

$('searchBtn').addEventListener('click', async () => {
  const modes = modeInputs.filter(x => x.checked).map(x => x.value);
  if (!$('origin').value.trim() || !$('destination').value.trim() || !$('date').value || !modes.length) {
    showNotice('Complete your trip details', 'Enter an origin, destination, departure date and at least one transport mode.');
    return;
  }
  $('searchBtn').disabled = true;
  $('searchBtn').textContent = 'Searching…';
  lastSearch = { origin:$('origin').value.trim(), destination:$('destination').value.trim(), date:$('date').value, modes, sort:$('sort').value };
  try {
    const response = await fetch('/api/search', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(lastSearch)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.explanation || data.error || 'Search could not be completed.');
    renderRoutes(data.routes || []);
  } catch (err) {
    $('results').innerHTML = '';
    $('resultCount').textContent = '0 routes';
    showNotice('Live travel sources need to be connected', err.message + ' This preview does not make up fares or schedules. Once provider APIs are connected, results will display in this panel.');
  } finally {
    $('searchBtn').disabled = false;
    $('searchBtn').innerHTML = 'Find routes <span>→</span>';
  }
});

function showNotice(title, body) {
  $('notice').style.display = 'flex';
  $('notice').innerHTML = `<div class="notice-icon">✦</div><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}
function escapeHtml(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderRoutes(routes) {
  $('notice').style.display = routes.length ? 'none' : 'flex';
  $('resultCount').textContent = `${routes.length} routes`;
  $('results').innerHTML = routes.map((r, index) => `
    <article class="route">
      <div class="route-top"><span class="tag">${escapeHtml(r.mode)} · ${escapeHtml(r.fareType || 'estimate')}</span><span class="price">${r.totalPrice == null ? 'Price unavailable' : escapeHtml(r.currency || '$') + escapeHtml(r.totalPrice)}</span></div>
      <h3>${escapeHtml(r.title)}</h3>
      <p>${escapeHtml(r.durationLabel || '')} · ${escapeHtml(r.source || 'Source not specified')}</p>
      ${(r.legs || []).map(leg => `<div class="leg"><strong>${escapeHtml(leg.from)} → ${escapeHtml(leg.to)}</strong><br>${escapeHtml(leg.departure || 'Time not supplied')} – ${escapeHtml(leg.arrival || 'Time not supplied')} · ${escapeHtml(leg.operator || '')}</div>`).join('')}
      <p>${escapeHtml(r.checkedAt ? 'Checked ' + r.checkedAt : 'Schedule timestamp not supplied')}</p>
      <div class="route-actions">
        <button type="button" onclick="this.closest('.route').querySelector('.details').hidden = !this.closest('.route').querySelector('.details').hidden">Itinerary details</button>
        <button type="button" onclick="saveCurrentRoute(${index})">☆ Save this trip</button>
        ${r.bookingUrl ? `<a href="${escapeHtml(r.bookingUrl)}" target="_blank" rel="noopener">Pay / book ↗</a>` : ''}
      </div>
      <p class="details" hidden>${escapeHtml(r.notes || '')}</p>
    </article>`).join('');
  window.currentRoutes = routes;
}

window.saveCurrentRoute = function(index) {
  const route = (window.currentRoutes || [])[index];
  if (!route || !lastSearch) return;
  const saved = getSavedTrips();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    trip: {...lastSearch},
    route: route,
    savedAt: new Date().toISOString()
  };
  saved.unshift(item);
  localStorage.setItem('goanywhere-explicit-saved-trips', JSON.stringify(saved));
  renderSavedTrips();
  const buttons = document.querySelectorAll('.route-actions button');
  if (buttons[index * 2 + 1]) buttons[index * 2 + 1].textContent = '✓ Saved';
};

function getSavedTrips() {
  try { return JSON.parse(localStorage.getItem('goanywhere-explicit-saved-trips') || '[]'); }
  catch { return []; }
}
function renderSavedTrips() {
  const saved = getSavedTrips();
  $('savedTrips').innerHTML = saved.length ? saved.map(item => `
    <article class="saved-item">
      <div><strong>${escapeHtml(item.trip.origin)} → ${escapeHtml(item.trip.destination)}</strong>
      <p>${escapeHtml(item.trip.date)} · ${escapeHtml(item.route.mode)} · ${escapeHtml(item.route.title)}</p></div>
      <button type="button" aria-label="Remove saved trip" onclick="removeSavedTrip('${escapeHtml(item.id)}')">Remove</button>
    </article>`).join('') : '<p class="empty-saved">You haven’t saved any trips yet. Search for a route and tap “Save this trip”.</p>';
}
window.removeSavedTrip = function(id) {
  localStorage.setItem('goanywhere-explicit-saved-trips', JSON.stringify(getSavedTrips().filter(x => x.id !== id)));
  renderSavedTrips();
};
renderSavedTrips();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
