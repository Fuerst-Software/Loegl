/* =========================================================
   LÖGL Haus- & Küchengeräte — Owner Admin Portal Engine
   Products & Aktionen Management with Live Upload
   (Zero Emojis - 100% SVG Vector Icons)
   ========================================================= */

const DEFAULT_PRODUCTS = [
  {
    id: 'WMF-101',
    title: 'WMF Gourmet Plus Topf-Set 4-teilig',
    brand: 'WMF',
    category: 'haushalt wmf',
    price: '249,00 €',
    stock: 6,
    active: true,
    img: 'assets/products/wmf_topfset.jpg',
    desc: 'Das WMF Gourmet Plus Topfset vereint höchste Verarbeitungsqualität mit zeitloser Eleganz. Gefertigt aus rostfreiem Cromargan® Edelstahl 18/10 mit TransTherm®-Allherdboden.',
    specs: 'Material: Cromargan® Edelstahl 18/10 | Inhalt: 3x Fleischtopf, 1x Bratentopf'
  },
  {
    id: 'BOSCH-301',
    title: 'Bosch MUM5 Küchenmaschine Serie 4',
    brand: 'Bosch',
    category: 'elektro bosch',
    price: '299,90 €',
    stock: 4,
    active: true,
    img: 'assets/products/bosch_mum5.jpg',
    desc: 'Die Bosch MUM5 ist der vielseitige Allrounder in der modernen Küche. Dank 3D PlanetaryMixing verbleiben keine Teigreste am Schüsselrand.',
    specs: 'Leistung: 1000 Watt | Schüssel: 3,9L Edelstahl'
  },
  {
    id: 'MIELE-401',
    title: 'Miele Complete C3 PowerLine Staubsauger',
    brand: 'Miele',
    category: 'elektro miele',
    price: '289,00 €',
    stock: 5,
    active: true,
    img: 'assets/products/miele_c3.jpg',
    desc: 'Spitzenklasse in der Bodenpflege: Der Miele Complete C3 besticht durch extrem hohe Saugleistung und hygienischen AirClean Filter.',
    specs: 'Motor: PowerLine 890W | Filter: AirClean Plus Filter'
  },
  {
    id: 'RIESS-601',
    title: 'Riess Classic Emaille-Kasserolle 20cm',
    brand: 'Riess',
    category: 'haushalt riess',
    price: '54,90 €',
    stock: 8,
    active: true,
    img: 'assets/products/riess_emaille.jpg',
    desc: 'Traditionelles Emaille-Geschirr aus dem Mostviertel in Österreich. Ideal für schonendes Kochen, Braten und Servieren.',
    specs: 'Material: Porzellan-Emaille auf Stahlkern | Durchmesser: 20 cm'
  },
  {
    id: 'KAISER-501',
    title: 'Kaiser Inspiration Springform 26cm',
    brand: 'Kaiser',
    category: 'backen kaiser',
    price: '29,95 €',
    stock: 12,
    active: true,
    img: 'assets/products/kaiser_form.jpg',
    desc: 'Hochwertige Backform für feinste Kuchen und Torten. Der auslaufsichere Rand verhindert ein Überlaufen im Backofen.',
    specs: 'Durchmesser: 26 cm | Beschichtung: KeraVis 2-fach Antihaft'
  }
];

const DEFAULT_AKTIONEN = [
  {
    id: 'AKT-1',
    title: 'WMF Alt-gegen-Neu Eintauschaktion',
    type: 'angebot',
    date: 'Gültig bis 31. August 2026',
    active: true,
    img: 'assets/products/wmf_topfset.jpg',
    desc: 'Bringen Sie Ihr altes Kochgeschirr (egal welcher Marke) zu uns ins Fachgeschäft nach Mattsee und sichern Sie sich sofort 20% Eintausch-Rabatt auf ein neues WMF Topfset!',
    badge: '-20% Eintausch-Rabatt auf WMF Topfsets'
  },
  {
    id: 'AKT-2',
    title: 'Miele Jubiläums-Cashback Aktion',
    type: 'angebot',
    date: 'Gültig bis 15. September 2026',
    active: true,
    img: 'assets/products/miele_c3.jpg',
    desc: 'Beim Kauf eines Miele Complete C3 Bodenstaubsaugers schenken wir Ihnen 50 € Direkt-Gutschrift an der Kassa in Mattsee.',
    badge: '50 € Direkt-Gutschrift vor Ort'
  },
  {
    id: 'AKT-4',
    title: 'Sommer-Kochgeschirr Aktionswochen',
    type: 'saisonal',
    date: 'Gültig solange der Vorrat reicht',
    active: true,
    img: 'assets/products/riess_emaille.jpg',
    desc: 'Zu jeder Riess Emaille Kasserolle oder WMF Gourmet-Pfanne erhalten Sie ein hochwertiges 3-teiliges Edelstahl-Silikon Küchenhelfer-Set gratis dazu.',
    badge: 'Gratis Küchenhelfer-Set dazu'
  }
];

function getStoredProducts() {
  const data = localStorage.getItem('loegl_products');
  if (!data) {
    localStorage.setItem('loegl_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_PRODUCTS; }
}

function saveStoredProducts(products) {
  localStorage.setItem('loegl_products', JSON.stringify(products));
}

function getStoredAktionen() {
  const data = localStorage.getItem('loegl_aktionen');
  if (!data) {
    localStorage.setItem('loegl_aktionen', JSON.stringify(DEFAULT_AKTIONEN));
    return DEFAULT_AKTIONEN;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_AKTIONEN; }
}

function saveStoredAktionen(aktionen) {
  localStorage.setItem('loegl_aktionen', JSON.stringify(aktionen));
}

document.addEventListener('DOMContentLoaded', () => {

  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tab Navigation Elements
  const navTabProducts = document.getElementById('navTabProducts');
  const navTabAktionen = document.getElementById('navTabAktionen');
  const tabProductsView = document.getElementById('tabProductsView');
  const tabAktionenView = document.getElementById('tabAktionenView');

  if (navTabProducts && navTabAktionen) {
    navTabProducts.addEventListener('click', () => {
      navTabProducts.classList.add('is-active');
      navTabAktionen.classList.remove('is-active');
      tabProductsView.style.display = 'block';
      tabAktionenView.style.display = 'none';
      renderDashboard();
    });

    navTabAktionen.addEventListener('click', () => {
      navTabAktionen.classList.add('is-active');
      navTabProducts.classList.remove('is-active');
      tabAktionenView.style.display = 'block';
      tabProductsView.style.display = 'none';
      renderAktionenDashboard();
    });
  }

  // Session Check
  function checkSession() {
    const isLoggedIn = sessionStorage.getItem('loegl_admin_logged_in') === 'true';
    if (isLoggedIn) {
      if (loginView) loginView.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'flex';
      renderDashboard();
      renderAktionenDashboard();
    } else {
      if (loginView) loginView.style.display = 'flex';
      if (dashboardView) dashboardView.style.display = 'none';
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (loginUser.value.trim() === 'admin' && loginPass.value.trim() === 'admin') {
        sessionStorage.setItem('loegl_admin_logged_in', 'true');
        if (loginError) loginError.style.display = 'none';
        checkSession();
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('loegl_admin_logged_in');
      checkSession();
    });
  }

  /* ---------------------------------------------------------
     1. PRODUCTS DASHBOARD ENGINE
     --------------------------------------------------------- */
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiActive = document.getElementById('kpiActive');
  const kpiInactive = document.getElementById('kpiInactive');
  const adminProductTableBody = document.getElementById('adminProductTableBody');
  const adminSearch = document.getElementById('adminSearch');

  function renderDashboard() {
    const products = getStoredProducts();
    
    if (kpiTotal) kpiTotal.textContent = products.length;
    if (kpiActive) kpiActive.textContent = products.filter(p => p.active !== false).length;
    if (kpiInactive) kpiInactive.textContent = products.filter(p => p.active === false).length;

    const query = adminSearch ? adminSearch.value.toLowerCase().trim() : '';
    const filtered = products.filter(p => p.title.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));

    if (!adminProductTableBody) return;
    adminProductTableBody.innerHTML = '';

    if (filtered.length === 0) {
      adminProductTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--ink-soft);">Keine Produkte gefunden.</td></tr>`;
      return;
    }

    filtered.forEach(prod => {
      const tr = document.createElement('tr');
      let imgPath = prod.img;
      if (!imgPath.startsWith('../') && !imgPath.startsWith('http') && !imgPath.startsWith('data:')) imgPath = '../' + imgPath;

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${imgPath}" alt="${prod.title}" style="width: 52px; height: 52px; object-fit: contain; background: #fff; padding: 0.3rem; border-radius: 8px; border: 1px solid var(--line); flex-shrink: 0;" />
            <div>
              <strong style="display: block; color: var(--ink); font-size: 0.98rem;">${prod.title}</strong>
              <span style="font-size: 0.76rem; color: var(--ink-soft); font-family: monospace;">ID: ${prod.id}</span>
            </div>
          </div>
        </td>
        <td>
          <strong style="color: var(--gold-dark); font-size: 0.85rem; text-transform: uppercase;">${prod.brand}</strong><br />
          <span style="font-size: 0.8rem; color: var(--ink-soft);">${prod.category}</span>
        </td>
        <td><strong style="font-family: var(--serif); font-size: 1.2rem; color: var(--ink);">${prod.price}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="stock-btn" onclick="adjustStock('${prod.id}', -1)">-</button>
            <span style="font-weight: 700; min-width: 24px; text-align: center; color: var(--ink);">${prod.stock}</span>
            <button class="stock-btn" onclick="adjustStock('${prod.id}', 1)">+</button>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <label class="switch">
              <input type="checkbox" ${prod.active !== false ? 'checked' : ''} onchange="toggleProductActive('${prod.id}', this.checked)" />
              <span class="slider"></span>
            </label>
            <span style="font-size: 0.82rem; font-weight: 700; color: ${prod.active !== false ? '#2e7d32' : '#e0934a'};">
              ${prod.active !== false ? 'Aktiv (Im Shop)' : 'Pausiert'}
            </span>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem;" onclick="editProduct('${prod.id}')">Bearbeiten</button>
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem; color: #c62828; border-color: rgba(198,40,40,0.25);" onclick="deleteProduct('${prod.id}')">Löschen</button>
          </div>
        </td>
      `;
      adminProductTableBody.appendChild(tr);
    });
  }

  if (adminSearch) adminSearch.addEventListener('input', renderDashboard);

  window.adjustStock = function(id, delta) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, (prod.stock || 0) + delta);
      saveStoredProducts(products);
      renderDashboard();
    }
  };

  window.toggleProductActive = function(id, state) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === id);
    if (prod) {
      prod.active = state;
      saveStoredProducts(products);
      renderDashboard();
    }
  };

  window.deleteProduct = function(id) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === id);
    if (prod && confirm(`Möchten Sie das Produkt "${prod.title}" löschen?`)) {
      saveStoredProducts(products.filter(p => p.id !== id));
      renderDashboard();
    }
  };

  /* ---------------------------------------------------------
     2. AKTIONEN DASHBOARD ENGINE
     --------------------------------------------------------- */
  const kpiAktionenTotal = document.getElementById('kpiAktionenTotal');
  const kpiAktionenActive = document.getElementById('kpiAktionenActive');
  const kpiAktionenSaisonal = document.getElementById('kpiAktionenSaisonal') || document.getElementById('kpiAktionenRueckruf');
  const adminAktionTableBody = document.getElementById('adminAktionTableBody');
  const adminAktionSearch = document.getElementById('adminAktionSearch');

  function renderAktionenDashboard() {
    const aktionen = getStoredAktionen();

    if (kpiAktionenTotal) kpiAktionenTotal.textContent = aktionen.length;
    if (kpiAktionenActive) kpiAktionenActive.textContent = aktionen.filter(a => a.active !== false).length;
    if (kpiAktionenSaisonal) kpiAktionenSaisonal.textContent = aktionen.filter(a => a.type === 'saisonal').length;

    const query = adminAktionSearch ? adminAktionSearch.value.toLowerCase().trim() : '';
    const filtered = aktionen.filter(a => a.title.toLowerCase().includes(query) || a.desc.toLowerCase().includes(query));

    if (!adminAktionTableBody) return;
    adminAktionTableBody.innerHTML = '';

    if (filtered.length === 0) {
      adminAktionTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--ink-soft);">Keine Aktionen gefunden.</td></tr>`;
      return;
    }

    filtered.forEach(akt => {
      const tr = document.createElement('tr');
      let imgPath = akt.img;
      if (!imgPath.startsWith('../') && !imgPath.startsWith('http') && !imgPath.startsWith('data:')) imgPath = '../' + imgPath;

      let typeBadgeHtml = `<span style="font-size: 0.72rem; font-weight: 700; color: var(--gold-dark); background: var(--gold-light); padding: 0.25em 0.6em; border-radius: 4px;">Sonderangebot</span>`;
      if (akt.type === 'saisonal') {
        typeBadgeHtml = `<span style="font-size: 0.72rem; font-weight: 700; color: #1565c0; background: rgba(21, 101, 192, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">Saisonales Highlight</span>`;
      }

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${imgPath}" alt="${akt.title}" style="width: 52px; height: 52px; object-fit: contain; background: #fff; padding: 0.3rem; border-radius: 8px; border: 1px solid var(--line); flex-shrink: 0;" />
            <div>
              <strong style="display: block; color: var(--ink); font-size: 0.98rem;">${akt.title}</strong>
              <span style="font-size: 0.76rem; color: var(--ink-soft); font-family: monospace;">ID: ${akt.id}</span>
            </div>
          </div>
        </td>
        <td>${typeBadgeHtml}</td>
        <td><strong style="font-size: 0.88rem; color: var(--ink);">${akt.date}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <label class="switch">
              <input type="checkbox" ${akt.active !== false ? 'checked' : ''} onchange="toggleAktionActive('${akt.id}', this.checked)" />
              <span class="slider"></span>
            </label>
            <span style="font-size: 0.82rem; font-weight: 700; color: ${akt.active !== false ? '#2e7d32' : '#e0934a'};">
              ${akt.active !== false ? 'Aktiv (Im Shop)' : 'Pausiert'}
            </span>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem;" onclick="editAktion('${akt.id}')">Bearbeiten</button>
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem; color: #c62828; border-color: rgba(198,40,40,0.25);" onclick="deleteAktion('${akt.id}')">Löschen</button>
          </div>
        </td>
      `;
      adminAktionTableBody.appendChild(tr);
    });
  }

  if (adminAktionSearch) adminAktionSearch.addEventListener('input', renderAktionenDashboard);

  window.toggleAktionActive = function(id, state) {
    const aktionen = getStoredAktionen();
    const akt = aktionen.find(a => a.id === id);
    if (akt) {
      akt.active = state;
      saveStoredAktionen(aktionen);
      renderAktionenDashboard();
    }
  };

  window.deleteAktion = function(id) {
    const aktionen = getStoredAktionen();
    const akt = aktionen.find(a => a.id === id);
    if (akt && confirm(`Möchten Sie die Aktion "${akt.title}" wirklich löschen?`)) {
      saveStoredAktionen(aktionen.filter(a => a.id !== id));
      renderAktionenDashboard();
    }
  };

  /* ---------------------------------------------------------
     3. PRODUCT MODAL HANDLERS
     --------------------------------------------------------- */
  const productModal = document.getElementById('productModal');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const productModalClose = document.getElementById('productModalClose');
  const productForm = document.getElementById('productForm');

  const pmId = document.getElementById('pmId');
  const pmTitle = document.getElementById('pmTitle');
  const pmBrand = document.getElementById('pmBrand');
  const pmCategory = document.getElementById('pmCategory');
  const pmPrice = document.getElementById('pmPrice');
  const pmStock = document.getElementById('pmStock');
  const pmImg = document.getElementById('pmImg');
  const pmFileInput = document.getElementById('pmFileInput');
  const pmImagePreview = document.getElementById('pmImagePreview');
  const pmDesc = document.getElementById('pmDesc');
  const pmSpecs = document.getElementById('pmSpecs');

  if (pmFileInput) {
    pmFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (pmImg) pmImg.value = evt.target.result;
          if (pmImagePreview) pmImagePreview.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', () => {
      if (productForm) productForm.reset();
      if (pmId) pmId.value = '';
      if (pmImagePreview) pmImagePreview.src = '../assets/products/wmf_topfset.jpg';
      if (productModal) productModal.classList.add('is-open');
    });
  }

  if (productModalClose) productModalClose.addEventListener('click', () => {
    if (productModal) productModal.classList.remove('is-open');
  });

  window.editProduct = function(id) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === id);
    if (prod && productModal) {
      if (pmId) pmId.value = prod.id;
      if (pmTitle) pmTitle.value = prod.title;
      if (pmBrand) pmBrand.value = prod.brand;
      if (pmCategory) pmCategory.value = prod.category.split(' ')[0] || 'haushalt';
      if (pmPrice) pmPrice.value = prod.price;
      if (pmStock) pmStock.value = prod.stock;
      if (pmImg) pmImg.value = prod.img;
      if (pmDesc) pmDesc.value = prod.desc || '';
      if (pmSpecs) pmSpecs.value = prod.specs || '';

      let previewVal = prod.img;
      if (!previewVal.startsWith('../') && !previewVal.startsWith('http') && !previewVal.startsWith('data:')) previewVal = '../' + previewVal;
      if (pmImagePreview) pmImagePreview.src = previewVal;

      productModal.classList.add('is-open');
    }
  };

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const products = getStoredProducts();
      const idVal = pmId.value;

      let imgVal = pmImg.value.trim() || 'assets/products/wmf_topfset.jpg';
      if (imgVal.startsWith('../assets/')) imgVal = imgVal.replace('../assets/', 'assets/');

      if (idVal) {
        const prod = products.find(p => p.id === idVal);
        if (prod) {
          prod.title = pmTitle.value.trim();
          prod.brand = pmBrand.value.trim();
          prod.category = `${pmCategory.value} ${pmBrand.value.toLowerCase().replace(/\s+/g, '')}`;
          prod.price = pmPrice.value.trim();
          prod.stock = parseInt(pmStock.value) || 0;
          prod.img = imgVal;
          prod.desc = pmDesc.value.trim();
          prod.specs = pmSpecs.value.trim();
        }
      } else {
        const newProd = {
          id: `${pmBrand.value.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          title: pmTitle.value.trim(),
          brand: pmBrand.value.trim(),
          category: `${pmCategory.value} ${pmBrand.value.toLowerCase().replace(/\s+/g, '')}`,
          price: pmPrice.value.trim(),
          stock: parseInt(pmStock.value) || 0,
          active: true,
          img: imgVal,
          desc: pmDesc.value.trim(),
          specs: pmSpecs.value.trim()
        };
        products.unshift(newProd);
      }

      saveStoredProducts(products);
      if (productModal) productModal.classList.remove('is-open');
      renderDashboard();
    });
  }

  /* ---------------------------------------------------------
     4. AKTION MODAL HANDLERS
     --------------------------------------------------------- */
  const aktionModal = document.getElementById('aktionModal');
  const openAddAktionModalBtn = document.getElementById('openAddAktionModalBtn');
  const aktionModalClose = document.getElementById('aktionModalClose');
  const aktionForm = document.getElementById('aktionForm');

  const amId = document.getElementById('amId');
  const amTitle = document.getElementById('amTitle');
  const amType = document.getElementById('amType');
  const amDate = document.getElementById('amDate');
  const amImg = document.getElementById('amImg');
  const amFileInput = document.getElementById('amFileInput');
  const amImagePreview = document.getElementById('amImagePreview');
  const amDesc = document.getElementById('amDesc');
  const amBadge = document.getElementById('amBadge');

  if (amFileInput) {
    amFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (amImg) amImg.value = evt.target.result;
          if (amImagePreview) amImagePreview.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (openAddAktionModalBtn) {
    openAddAktionModalBtn.addEventListener('click', () => {
      if (aktionForm) aktionForm.reset();
      if (amId) amId.value = '';
      if (amImagePreview) amImagePreview.src = '../assets/products/wmf_topfset.jpg';
      if (aktionModal) aktionModal.classList.add('is-open');
    });
  }

  if (aktionModalClose) aktionModalClose.addEventListener('click', () => {
    if (aktionModal) aktionModal.classList.remove('is-open');
  });

  window.editAktion = function(id) {
    const aktionen = getStoredAktionen();
    const akt = aktionen.find(a => a.id === id);
    if (akt && aktionModal) {
      if (amId) amId.value = akt.id;
      if (amTitle) amTitle.value = akt.title;
      if (amType) amType.value = akt.type;
      if (amDate) amDate.value = akt.date;
      if (amImg) amImg.value = akt.img;
      if (amDesc) amDesc.value = akt.desc;
      if (amBadge) amBadge.value = akt.badge || '';

      let previewVal = akt.img;
      if (!previewVal.startsWith('../') && !previewVal.startsWith('http') && !previewVal.startsWith('data:')) previewVal = '../' + previewVal;
      if (amImagePreview) amImagePreview.src = previewVal;

      aktionModal.classList.add('is-open');
    }
  };

  if (aktionForm) {
    aktionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const aktionen = getStoredAktionen();
      const idVal = amId.value;

      let imgVal = amImg.value.trim() || 'assets/products/wmf_topfset.jpg';
      if (imgVal.startsWith('../assets/')) imgVal = imgVal.replace('../assets/', 'assets/');

      // Strip any emojis from user badge text
      let cleanBadge = amBadge.value.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

      if (idVal) {
        const akt = aktionen.find(a => a.id === idVal);
        if (akt) {
          akt.title = amTitle.value.trim();
          akt.type = amType.value;
          akt.date = amDate.value.trim();
          akt.img = imgVal;
          akt.desc = amDesc.value.trim();
          akt.badge = cleanBadge;
        }
      } else {
        const newAkt = {
          id: `AKT-${Math.floor(10 + Math.random() * 90)}`,
          title: amTitle.value.trim(),
          type: amType.value,
          date: amDate.value.trim(),
          active: true,
          img: imgVal,
          desc: amDesc.value.trim(),
          badge: cleanBadge
        };
        aktionen.unshift(newAkt);
      }

      saveStoredAktionen(aktionen);
      if (aktionModal) aktionModal.classList.remove('is-open');
      renderAktionenDashboard();
    });
  }

  // Init session check
  checkSession();

});
