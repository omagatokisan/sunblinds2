/**
 * Lead Manager for Google Sheets
 * Setup: Run "Setup sheet" from the Leads menu once.
 */

const CONFIG = {
  SHEET_NAME: 'Leads',
  HEADERS: ['ID', 'Name', 'Number', 'Predicted Price', 'Email', 'Website', 'Description', 'Status', 'Created', 'Updated'],
  STATUSES: ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'On hold'],
  HEADER_ROW: 1,
  DATA_START_ROW: 2,
};

// ─── Menu ───────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Leads')
    .addItem('Open manager', 'showSidebar')
    .addItem('Setup sheet', 'setupSheet')
    .addSeparator()
    .addItem('Export all (CSV)', 'exportAllCsv')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle('Lead Manager')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── Setup ──────────────────────────────────────────────────────────────────

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('@');
  sheet.getRange('D:D').setNumberFormat('#,##0.00 "Kč"');
  sheet.getRange('I:J').setNumberFormat('dd.mm.yyyy hh:mm');

  const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
  headerRange
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  sheet.setColumnWidths(1, CONFIG.HEADERS.length, 120);
  sheet.setColumnWidth(2, 180); // Name
  sheet.setColumnWidth(7, 260); // Description
  sheet.setColumnWidth(8, 100); // Status

  // Status dropdown for column H
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('H2:H1000').setDataValidation(statusRule);

  sheet.getRange('H2:H1000').setValues(
    Array.from({ length: 999 }, () => ['New'])
  );

  SpreadsheetApp.getUi().alert('Sheet "' + CONFIG.SHEET_NAME + '" is ready. Use Leads → Open manager.');
}

// ─── Data access ────────────────────────────────────────────────────────────

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" not found. Run Leads → Setup sheet first.');
  }
  return sheet;
}

function rowToObject_(row) {
  return {
    id: String(row[0] || ''),
    name: String(row[1] || ''),
    number: String(row[2] || ''),
    predictedPrice: row[3] === '' || row[3] == null ? null : Number(row[3]),
    email: String(row[4] || ''),
    website: String(row[5] || ''),
    description: String(row[6] || ''),
    status: String(row[7] || 'New'),
    created: row[8] ? String(row[8]) : '',
    updated: row[9] ? String(row[9]) : '',
  };
}

function objectToRow_(obj) {
  return [
    obj.id || '',
    obj.name || '',
    obj.number || '',
    obj.predictedPrice != null && obj.predictedPrice !== '' ? Number(obj.predictedPrice) : '',
    obj.email || '',
    obj.website || '',
    obj.description || '',
    obj.status || 'New',
    obj.created || '',
    obj.updated || '',
  ];
}

function getAllLeads() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.DATA_START_ROW) {
    return [];
  }

  const values = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - 1, CONFIG.HEADERS.length).getValues();
  return values
    .map(rowToObject_)
    .filter(function (lead) {
      return lead.name || lead.email || lead.number || lead.website || lead.description;
    });
}

function nextId_() {
  const leads = getAllLeads();
  if (!leads.length) return '1';
  const max = leads.reduce(function (m, l) {
    const n = parseInt(l.id, 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1);
}

// ─── Filtering & sorting ────────────────────────────────────────────────────

function normalize_(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesText_(value, query) {
  if (!query) return true;
  return normalize_(value).indexOf(normalize_(query)) !== -1;
}

function matchesPrice_(price, filter) {
  if (!filter || (!filter.min && !filter.max)) return true;
  const p = price == null || price === '' ? null : Number(price);
  if (p == null) return filter.includeEmpty === true;
  const min = filter.min !== '' && filter.min != null ? Number(filter.min) : null;
  const max = filter.max !== '' && filter.max != null ? Number(filter.max) : null;
  if (min != null && !isNaN(min) && p < min) return false;
  if (max != null && !isNaN(max) && p > max) return false;
  return true;
}

function queryLeads(filters) {
  filters = filters || {};
  let leads = getAllLeads();

  if (filters.globalSearch) {
    const q = filters.globalSearch;
    leads = leads.filter(function (l) {
      return (
        matchesText_(l.name, q) ||
        matchesText_(l.number, q) ||
        matchesText_(l.email, q) ||
        matchesText_(l.website, q) ||
        matchesText_(l.description, q) ||
        matchesText_(l.status, q) ||
        matchesText_(String(l.predictedPrice), q)
      );
    });
  }

  if (filters.name) leads = leads.filter(function (l) { return matchesText_(l.name, filters.name); });
  if (filters.number) leads = leads.filter(function (l) { return matchesText_(l.number, filters.number); });
  if (filters.email) leads = leads.filter(function (l) { return matchesText_(l.email, filters.email); });
  if (filters.website) leads = leads.filter(function (l) { return matchesText_(l.website, filters.website); });
  if (filters.description) leads = leads.filter(function (l) { return matchesText_(l.description, filters.description); });
  if (filters.status) leads = leads.filter(function (l) { return l.status === filters.status; });

  if (filters.hasEmail === true) leads = leads.filter(function (l) { return !!l.email; });
  if (filters.hasEmail === false) leads = leads.filter(function (l) { return !l.email; });
  if (filters.hasWebsite === true) leads = leads.filter(function (l) { return !!l.website; });
  if (filters.hasWebsite === false) leads = leads.filter(function (l) { return !l.website; });

  leads = leads.filter(function (l) {
    return matchesPrice_(l.predictedPrice, filters.price || {});
  });

  const sortBy = filters.sortBy || 'updated';
  const sortDir = filters.sortDir === 'asc' ? 1 : -1;

  leads.sort(function (a, b) {
    let va = a[sortBy];
    let vb = b[sortBy];
    if (sortBy === 'predictedPrice') {
      va = va == null ? -Infinity : Number(va);
      vb = vb == null ? -Infinity : Number(vb);
    } else {
      va = normalize_(va);
      vb = normalize_(vb);
    }
    if (va < vb) return -1 * sortDir;
    if (va > vb) return 1 * sortDir;
    return 0;
  });

  const stats = {
    total: getAllLeads().length,
    filtered: leads.length,
    priceSum: leads.reduce(function (s, l) {
      return s + (l.predictedPrice != null && !isNaN(l.predictedPrice) ? Number(l.predictedPrice) : 0);
    }, 0),
    noWebsite: leads.filter(function (l) { return !l.website; }).length,
    noEmail: leads.filter(function (l) { return !l.email; }).length,
  };

  return { leads: leads, stats: stats, statuses: CONFIG.STATUSES };
}

// ─── CRUD ───────────────────────────────────────────────────────────────────

function validateLead_(lead, isUpdate) {
  const errors = [];
  if (!lead.name || !String(lead.name).trim()) errors.push('Name is required.');
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.push('Invalid email format.');
  if (lead.website && !/^https?:\/\/.+/i.test(lead.website) && !/^[\w.-]+\.[a-z]{2,}/i.test(lead.website)) {
    errors.push('Website should be a valid URL or domain.');
  }
  if (lead.predictedPrice != null && lead.predictedPrice !== '' && isNaN(Number(lead.predictedPrice))) {
    errors.push('Predicted price must be a number.');
  }
  if (!isUpdate && findDuplicate_(lead)) {
    errors.push('Possible duplicate (same email or name + number).');
  }
  return errors;
}

function findDuplicate_(lead) {
  const all = getAllLeads().filter(function (l) { return l.id !== lead.id; });
  return all.some(function (l) {
    if (lead.email && l.email && normalize_(lead.email) === normalize_(l.email)) return true;
    if (
      lead.name && l.name &&
      normalize_(lead.name) === normalize_(l.name) &&
      normalize_(lead.number) === normalize_(l.number)
    ) return true;
    return false;
  });
}

function findRowById_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.DATA_START_ROW) return -1;
  const ids = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return CONFIG.DATA_START_ROW + i;
  }
  return -1;
}

function saveLead(lead) {
  const sheet = getSheet_();
  const now = new Date();
  const isUpdate = !!lead.id;
  const errors = validateLead_(lead, isUpdate);
  if (errors.length) return { ok: false, errors: errors };

  if (isUpdate) {
    const rowNum = findRowById_(sheet, lead.id);
    if (rowNum < 0) return { ok: false, errors: ['Lead not found.'] };
    const existing = sheet.getRange(rowNum, 1, 1, CONFIG.HEADERS.length).getValues()[0];
    const obj = rowToObject_(existing);
    obj.name = lead.name;
    obj.number = lead.number;
    obj.predictedPrice = lead.predictedPrice;
    obj.email = lead.email;
    obj.website = lead.website ? normalizeWebsite_(lead.website) : '';
    obj.description = lead.description;
    obj.status = lead.status || obj.status;
    obj.updated = now;
    sheet.getRange(rowNum, 1, 1, CONFIG.HEADERS.length).setValues([objectToRow_(obj)]);
    return { ok: true, lead: obj };
  }

  const newLead = {
    id: nextId_(),
    name: String(lead.name).trim(),
    number: lead.number || '',
    predictedPrice: lead.predictedPrice != null && lead.predictedPrice !== '' ? Number(lead.predictedPrice) : null,
    email: lead.email || '',
    website: lead.website ? normalizeWebsite_(lead.website) : '',
    description: lead.description || '',
    status: lead.status || 'New',
    created: now,
    updated: now,
  };

  sheet.appendRow(objectToRow_(newLead));
  return { ok: true, lead: newLead };
}

function deleteLead(id) {
  const sheet = getSheet_();
  const rowNum = findRowById_(sheet, id);
  if (rowNum < 0) return { ok: false, errors: ['Lead not found.'] };
  sheet.deleteRow(rowNum);
  return { ok: true };
}

function deleteLeads(ids) {
  if (!ids || !ids.length) return { ok: false, errors: ['No rows selected.'] };
  const sheet = getSheet_();
  const rows = ids
    .map(function (id) { return findRowById_(sheet, id); })
    .filter(function (r) { return r > 0; })
    .sort(function (a, b) { return b - a; });
  rows.forEach(function (r) { sheet.deleteRow(r); });
  return { ok: true, deleted: rows.length };
}

function bulkUpdateStatus(ids, status) {
  if (!CONFIG.STATUSES.includes(status)) return { ok: false, errors: ['Invalid status.'] };
  const sheet = getSheet_();
  const now = new Date();
  ids.forEach(function (id) {
    const rowNum = findRowById_(sheet, id);
    if (rowNum > 0) {
      sheet.getRange(rowNum, 8).setValue(status);
      sheet.getRange(rowNum, 10).setValue(now);
    }
  });
  return { ok: true };
}

function normalizeWebsite_(url) {
  url = String(url).trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

// ─── Import / Export ────────────────────────────────────────────────────────

function exportLeadsCsv(filters) {
  const result = queryLeads(filters || {});
  const leads = result.leads;
  const header = ['ID', 'Name', 'Number', 'Predicted Price', 'Email', 'Website', 'Description', 'Status', 'Created', 'Updated'];
  const rows = leads.map(function (l) {
    return [l.id, l.name, l.number, l.predictedPrice, l.email, l.website, l.description, l.status, l.created, l.updated];
  });
  return { csv: toCsv_([header].concat(rows)), filename: 'leads-export-' + formatDateFile_() + '.csv' };
}

function exportAllCsv() {
  const csv = exportLeadsCsv({}).csv;
  const blob = Utilities.newBlob(csv, 'text/csv', 'leads-export-' + formatDateFile_() + '.csv');
  const file = DriveApp.createFile(blob);
  SpreadsheetApp.getUi().alert('CSV saved to Google Drive:\n' + file.getName());
}

function importLeadsCsv(csvText, mode) {
  mode = mode || 'append'; // append | replace
  const rows = parseCsv_(csvText);
  if (!rows.length) return { ok: false, errors: ['CSV is empty.'] };

  const header = rows[0].map(function (h) { return normalize_(h); });
  const col = function (names) {
    for (var i = 0; i < names.length; i++) {
      var idx = header.indexOf(normalize_(names[i]));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const map = {
    name: col(['name', 'jmeno', 'název', 'nazev']),
    number: col(['number', 'phone', 'tel', 'telefon', 'cislo', 'číslo']),
    price: col(['predicted price', 'price', 'cena', 'predicted_price']),
    email: col(['email', 'e-mail', 'mail']),
    website: col(['website', 'web', 'url']),
    description: col(['description', 'popis', 'note', 'notes']),
    status: col(['status', 'stav']),
  };

  if (map.name < 0) return { ok: false, errors: ['CSV must have a Name column.'] };

  if (mode === 'replace') {
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow >= CONFIG.DATA_START_ROW) {
      sheet.deleteRows(CONFIG.DATA_START_ROW, lastRow - CONFIG.DATA_START_ROW + 1);
    }
  }

  var imported = 0;
  var skipped = 0;
  var errors = [];

  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    if (!row.some(function (c) { return String(c).trim(); })) continue;
    var lead = {
      name: map.name >= 0 ? row[map.name] : '',
      number: map.number >= 0 ? row[map.number] : '',
      predictedPrice: map.price >= 0 ? row[map.price] : '',
      email: map.email >= 0 ? row[map.email] : '',
      website: map.website >= 0 ? row[map.website] : '',
      description: map.description >= 0 ? row[map.description] : '',
      status: map.status >= 0 ? row[map.status] : 'New',
    };
    var res = saveLead(lead);
    if (res.ok) imported++;
    else {
      skipped++;
      if (errors.length < 5) errors.push('Row ' + (r + 1) + ': ' + res.errors.join(' '));
    }
  }

  return { ok: true, imported: imported, skipped: skipped, errors: errors };
}

function toCsv_(rows) {
  return rows
    .map(function (row) {
      return row
        .map(function (cell) {
          var s = cell == null ? '' : String(cell);
          if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
          return s;
        })
        .join(',');
    })
    .join('\r\n');
}

function parseCsv_(text) {
  var rows = [];
  var row = [];
  var cell = '';
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(cell); cell = '';
        rows.push(row); row = [];
        if (ch === '\r') i++;
      } else cell += ch;
    }
  }
  row.push(cell);
  if (row.some(function (c) { return String(c).trim(); })) rows.push(row);
  return rows;
}

function formatDateFile_() {
  var d = new Date();
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd-HHmm');
}

// ─── Sheet sync (optional: highlight row from sidebar) ──────────────────────

function focusLeadInSheet(id) {
  const sheet = getSheet_();
  const rowNum = findRowById_(sheet, id);
  if (rowNum > 0) {
    sheet.setActiveRange(sheet.getRange(rowNum, 1, 1, CONFIG.HEADERS.length));
    SpreadsheetApp.flush();
  }
  return { ok: rowNum > 0 };
}

function getConfig() {
  return { statuses: CONFIG.STATUSES, headers: CONFIG.HEADERS };
}
