// ─── STATE
let tickets = [];

// ─── INIT
document.addEventListener('DOMContentLoaded', async () => {
  setTodayDate();
  await loadTickets();
  renderRecords();
  updateBadge();
  setupTabs();
  setupForm();
  setupRecordActions();
  checkCapturedData();
});

function setTodayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  document.getElementById('field-date').value = `${yyyy}-${mm}-${dd}`;
}

// ─── STORAGE
function loadTickets() {
  return new Promise(resolve => {
    chrome.storage.local.get(['tickets'], result => {
      tickets = result.tickets || [];
      resolve();
    });
  });
}

function saveTickets() {
  return new Promise(resolve => {
    chrome.storage.local.set({ tickets }, resolve);
  });
}

// ─── TABS
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
      if (tab.dataset.tab === 'records') renderRecords();
    });
  });
}

// ─── FORM
function setupForm() {
  document.getElementById('btn-save').addEventListener('click', saveTicket);
  document.getElementById('btn-clear-form').addEventListener('click', clearForm);
}

async function saveTicket() {
  const date     = document.getElementById('field-date').value.trim();
  const ticketId = document.getElementById('field-ticket').value.trim();
  const category = document.getElementById('field-category').value.trim();
  const catYou   = document.getElementById('field-category-you').value.trim();
  const issueType= document.getElementById('field-issue-type').value.trim();
  const desc     = document.getElementById('field-desc').value.trim();
  const response = document.getElementById('field-response').value.trim();

  if (!date || !ticketId) {
    showToast('Date and Ticket ID are required.', 'error');
    return;
  }

  const srNo = tickets.length + 1;

  tickets.push({ srNo, date, ticketId, category, catYou, issueType, desc, response });
  await saveTickets();
  updateBadge();
  clearForm();
  showToast('✅ Ticket saved successfully!', 'success');
}

function clearForm() {
  document.getElementById('field-ticket').value   = '';
  document.getElementById('field-category').value = '';
  document.getElementById('field-category-you').value = '';
  document.getElementById('field-issue-type').value   = '';
  document.getElementById('field-desc').value     = '';
  document.getElementById('field-response').value = '';
  setTodayDate();
}

function showToast(msg, type) {
  const el = document.getElementById('form-toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ─── RECORDS
function renderRecords() {
  const list = document.getElementById('records-list');
  document.getElementById('records-count-text').textContent =
    `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} logged`;

  if (tickets.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>📭</div>
        No tickets logged yet.<br/>Use the Log Ticket tab to add one.
      </div>`;
    return;
  }

  list.innerHTML = [...tickets].reverse().map((t, i) => {
    const realIdx = tickets.length - 1 - i;
    return `
    <div class="record-card">
      <div class="sr-num">SR #${t.srNo}</div>
      <div class="record-header">
        <span class="record-ticket">${t.ticketId || '—'}</span>
        <span class="record-date">${formatDate(t.date)}</span>
      </div>
      <div class="record-category">${t.category || '—'} · <em>${t.issueType || '—'}</em></div>
      <div class="record-desc">${t.desc || '—'}</div>
      <button class="record-delete" data-idx="${realIdx}" title="Delete">🗑</button>
    </div>`;
  }).join('');

  list.querySelectorAll('.record-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      tickets.splice(idx, 1);
      // Re-number SR
      tickets.forEach((t, i) => t.srNo = i + 1);
      await saveTickets();
      updateBadge();
      renderRecords();
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

function updateBadge() {
  document.getElementById('count-badge').textContent = tickets.length;
}

// ─── RECORD ACTIONS
function setupRecordActions() {
  document.getElementById('btn-export').addEventListener('click', exportToExcel);
  document.getElementById('btn-clear-all').addEventListener('click', async () => {
    if (confirm('Clear all logged tickets? This cannot be undone.')) {
      tickets = [];
      await saveTickets();
      updateBadge();
      renderRecords();
    }
  });
}

// ─── EXCEL EXPORT (CSV Format - Excel Compatible)
async function exportToExcel() {
  if (tickets.length === 0) {
    alert('No tickets to export yet!');
    return;
  }

  // CSV headers in exact order requested
  const headers = [
    'Sr no',
    'Date',
    'Ticket Id',
    'Category',
    'Category According to you',
    'Issue Type',
    'Description',
    'Response',
    'Issue found at'
  ];

  // Convert tickets to CSV rows
  const rows = tickets.map(t => [
    t.srNo,
    t.date || '',
    t.ticketId || '',
    t.category || '',
    t.category || '',           // Same as Category
    t.issueType || '',
    t.desc || '',
    t.response || '',
    ''                          // Issue found at (blank)
  ]);

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  // Add UTF-8 BOM for better Excel compatibility
  const BOM = '\uFEFF';
  const fullContent = BOM + csvContent;

  // Create blob and download
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const filename = `CelcomDigi_Tickets_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── AUTO-FILL FROM CAPTURED DATA
function checkCapturedData() {
  chrome.storage.local.get(['capturedTicket'], result => {
    if (result.capturedTicket) {
      const data = result.capturedTicket;

      // Auto-fill form fields
      if (data.ticketId) document.getElementById('field-ticket').value = data.ticketId;
      if (data.category) document.getElementById('field-category').value = data.category;
      if (data.description) document.getElementById('field-desc').value = data.description;
      if (data.categoryYou) document.getElementById('field-category-you').value = data.categoryYou;
      if (data.issueType) document.getElementById('field-issue-type').value = data.issueType;
      if (data.response) document.getElementById('field-response').value = data.response;

      // Show success toast
      showToast('✅ Ticket data captured from Daisy!', 'success');

      // Clear captured data
      chrome.storage.local.remove('capturedTicket');
    }
  });
}
