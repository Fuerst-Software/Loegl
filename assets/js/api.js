/* =========================================================
   LÖGL Mattsee · Datenschicht (Supabase)
   Kapselt alle Datenbank-Zugriffe hinter window.LoeglAPI.
   Voraussetzung: supabase-js (CDN) + supabase-config.js sind
   VOR dieser Datei geladen.
   ========================================================= */
(function () {
  'use strict';

  if (!window.supabase || !window.LOEGL_SUPABASE) {
    console.error('[LoeglAPI] Supabase-Client oder Konfiguration fehlt.');
    return;
  }

  var client = window.supabase.createClient(
    window.LOEGL_SUPABASE.url,
    window.LOEGL_SUPABASE.key,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );

  // ---- Preis-Formatierung: 249 -> "249,00 €" ----
  function formatPrice(n) {
    var num = Number(n);
    if (isNaN(num)) return '';
    return num.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  // ---- DB-Zeile -> Objekt in der Form, die das Frontend erwartet ----
  function normProduct(r) {
    var hasSale = r.sale_price != null && Number(r.sale_price) > 0 && Number(r.sale_price) < Number(r.price);
    return {
      id: r.id,
      sku: r.sku,
      title: r.title,
      brand: r.brand,
      category: r.category,
      price: formatPrice(r.price),   // UVP, formatiert für Anzeige
      priceRaw: r.price,             // UVP als Zahl (für Formulare)
      salePrice: hasSale ? formatPrice(r.sale_price) : '',   // Aktionspreis formatiert ('' = keiner)
      salePriceRaw: hasSale ? r.sale_price : null,           // Aktionspreis als Zahl (bzw. null)
      stock: r.stock,
      active: r.active,
      img: r.img,
      images: (Array.isArray(r.images) && r.images.length) ? r.images : (r.img ? [r.img] : []),
      desc: r.description,
      specs: r.specs,
      // Aktionsprodukt: erscheint zusätzlich im Aktionen-Bereich der Website
      showInAktionen: r.show_in_aktionen === true,
      aktionBadge: r.aktion_badge || '',
      aktionValidText: r.aktion_valid_text || '',
      aktionShowDesc: r.aktion_show_desc === true,   // Beschreibung auf der Aktions-Kachel zeigen?
      // Manuelle Reihenfolge (kleiner = weiter oben)
      sortOrder: (r.sort_order != null) ? r.sort_order : 0,
      created_at: r.created_at
    };
  }

  // Nach manueller Reihenfolge sortieren (kleiner sort_order = weiter oben),
  // bei Gleichstand nach Erstellzeit. Läuft rein clientseitig -> funktioniert
  // auch, falls die Spalte sort_order (noch) nicht existiert (dann alle = 0).
  function bySortOrder(a, b) {
    return (a.sortOrder - b.sortOrder) || (Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0));
  }

  function normAktion(r) {
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      date: r.valid_text,            // Frontend nutzt "date"
      valid_text: r.valid_text,
      valid_until: r.valid_until,
      active: r.active,
      img: r.img,
      desc: r.description,
      badge: r.badge
    };
  }

  // ---- Automatische Bildaufbereitung ----
  // Korrigiert EXIF-Drehung, passt das Bild verzerrungsfrei auf eine weiße
  // Fläche im Zielformat ein (nichts wird abgeschnitten), verkleinert & komprimiert.
  var IMG_PRESETS = {
    product: { w: 1200, h: 900, quality: 0.92 },   // 4:3  (Produktkarten)
    aktion:  { w: 1600, h: 900, quality: 0.92 }    // 16:9 (Aktions-Banner)
  };
  async function loadBitmap(file) {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch (e) { /* Fallback unten */ }
    }
    return await new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }
  async function processImage(file, kind) {
    var preset = IMG_PRESETS[kind] || IMG_PRESETS.product;
    if (!file || !/^image\//.test(file.type || '')) return file; // Nicht-Bilder unverändert lassen
    var src;
    try { src = await loadBitmap(file); } catch (e) { return file; }
    var sw = src.width || src.naturalWidth, sh = src.height || src.naturalHeight;
    if (!sw || !sh) return file;
    var canvas = document.createElement('canvas');
    canvas.width = preset.w; canvas.height = preset.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, preset.w, preset.h);
    var scale = Math.min(preset.w / sw, preset.h / sh);      // "contain": nichts abschneiden, nicht verzerren
    var dw = Math.round(sw * scale), dh = Math.round(sh * scale);
    var dx = Math.round((preset.w - dw) / 2), dy = Math.round((preset.h - dh) / 2);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, dx, dy, dw, dh);
    if (src.close) src.close();
    // Bewusst KEINE Farb-/Helligkeitsbearbeitung: Das Foto wird 1:1 übernommen und
    // nur verzerrungsfrei mittig in das Zielformat eingepasst (weißer Rand füllt auf).
    var blob = await new Promise(function (res) { canvas.toBlob(res, 'image/jpeg', preset.quality); });
    return blob || file;
  }
  var STORAGE_BUCKET = 'product-images';
  async function uploadImage(blobOrFile) {
    var path = 'products/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    var up = await client.storage.from(STORAGE_BUCKET).upload(path, blobOrFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });
    if (up.error) throw up.error;
    return client.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  }
  // Aus einer öffentlichen Storage-URL den Datei-Pfad im Bucket ermitteln.
  // Liefert null für Demo-/Fremdpfade (z. B. 'assets/...'), die NICHT im Bucket liegen.
  function storagePathFromUrl(u) {
    if (!u || typeof u !== 'string') return null;
    var marker = '/storage/v1/object/public/' + STORAGE_BUCKET + '/';
    var i = u.indexOf(marker);
    if (i === -1) return null;
    var p = u.slice(i + marker.length).split('?')[0];
    try { p = decodeURIComponent(p); } catch (e) { /* Pfad unverändert lassen */ }
    return p || null;
  }
  // Alle zu einem Datensatz gehörenden Bilddateien aus dem Storage entfernen.
  async function removeStorageImages(urls) {
    var paths = [];
    (urls || []).forEach(function (u) {
      var p = storagePathFromUrl(u);
      if (p && paths.indexOf(p) === -1) paths.push(p);
    });
    if (!paths.length) return;
    try { await client.storage.from(STORAGE_BUCKET).remove(paths); }
    catch (e) { console.warn('[LoeglAPI] Storage-Aufräumen fehlgeschlagen:', e); }
  }

  window.LoeglAPI = {
    client: client,
    formatPrice: formatPrice,
    processImage: processImage,
    uploadImage: uploadImage,

    /* ============ ÖFFENTLICH ============ */
    getProducts: async function () {
      var res = await client.from('products').select('*').eq('active', true).order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normProduct).sort(bySortOrder);
    },

    getAktionen: async function () {
      var res = await client.from('aktionen').select('*').eq('active', true).order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normAktion);
    },

    // Aktionsprodukte: aktive Shop-Produkte, die zusätzlich im Aktionen-Bereich erscheinen sollen
    getAktionsprodukte: async function () {
      var res = await client.from('products').select('*')
        .eq('active', true).eq('show_in_aktionen', true)
        .order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normProduct).sort(bySortOrder);
    },

    // Atomare Reservierung über die DB-Funktion (prüft Lager, zieht ab) – nur Name + Telefon
    createReservation: async function (productId, name, phone) {
      var res = await client.rpc('create_reservation', {
        p_product_id: productId, p_name: name, p_phone: phone
      });
      if (res.error) throw res.error;
      return Array.isArray(res.data) ? res.data[0] : res.data; // { product_title }
    },

    /* ============ ADMIN (nur eingeloggt) ============ */
    signIn: function (email, password) { return client.auth.signInWithPassword({ email: email, password: password }); },
    signOut: function () { return client.auth.signOut(); },
    getSession: async function () { var r = await client.auth.getSession(); return r.data ? r.data.session : null; },
    onAuthChange: function (cb) { return client.auth.onAuthStateChange(cb); },

    getAllProducts: async function () {
      var res = await client.from('products').select('*').order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normProduct).sort(bySortOrder);
    },
    saveProduct: async function (p) {
      // p: {id?, sku, title, brand, category, price(number), stock, active, img, desc, specs}
      var saleVal = (p.sale_price === '' || p.sale_price == null || isNaN(p.sale_price)) ? null : Number(p.sale_price);
      var row = {
        sku: p.sku || null, title: p.title, brand: p.brand, category: p.category,
        price: p.price, sale_price: saleVal, stock: p.stock, active: p.active, img: p.img,
        images: Array.isArray(p.images) ? p.images : [],
        description: p.desc, specs: p.specs
      };
      // Aktionsprodukt-Felder nur setzen, wenn übergeben (damit Teil-Updates wie
      // Lagerbestand/Status die Aktions-Einstellung nicht versehentlich zurücksetzen).
      if (p.show_in_aktionen !== undefined) row.show_in_aktionen = !!p.show_in_aktionen;
      if (p.aktion_badge !== undefined) row.aktion_badge = (p.aktion_badge || '').trim() || null;
      if (p.aktion_valid_text !== undefined) row.aktion_valid_text = (p.aktion_valid_text || '').trim() || null;
      if (p.aktion_show_desc !== undefined) row.aktion_show_desc = !!p.aktion_show_desc;
      if (p.sort_order !== undefined) row.sort_order = Number(p.sort_order) || 0;
      var q = p.id
        ? client.from('products').update(row).eq('id', p.id).select()
        : client.from('products').insert(row).select();
      var res = await q;
      if (res.error) throw res.error;
      return res.data[0];
    },
    // Nur die Reihenfolge-Spalte aktualisieren (lässt alle Produktdaten unberührt)
    setProductSortOrder: async function (id, sortOrder) {
      var res = await client.from('products').update({ sort_order: Number(sortOrder) || 0 }).eq('id', id);
      if (res.error) throw res.error;
    },
    // Nur die übergebenen Felder aktualisieren – alle anderen Produktdaten bleiben unberührt.
    updateProductFields: async function (id, fields) {
      var res = await client.from('products').update(fields).eq('id', id);
      if (res.error) throw res.error;
    },
    deleteProduct: async function (id) {
      // Erst die zugehörigen Bild-URLs holen, dann Datensatz löschen, dann Dateien räumen
      var urls = [];
      try {
        var got = await client.from('products').select('img, images').eq('id', id).single();
        if (!got.error && got.data) {
          if (got.data.img) urls.push(got.data.img);
          if (Array.isArray(got.data.images)) urls = urls.concat(got.data.images);
        }
      } catch (e) { /* Bild-Aufräumen ist optional, Löschen hat Vorrang */ }
      var res = await client.from('products').delete().eq('id', id);
      if (res.error) throw res.error;
      await removeStorageImages(urls);
    },

    getAllAktionen: async function () {
      var res = await client.from('aktionen').select('*').order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normAktion);
    },
    saveAktion: async function (a) {
      var row = {
        title: a.title, type: a.type, valid_text: a.date, active: a.active,
        img: a.img, description: a.desc, badge: a.badge
      };
      var q = a.id
        ? client.from('aktionen').update(row).eq('id', a.id).select()
        : client.from('aktionen').insert(row).select();
      var res = await q;
      if (res.error) throw res.error;
      return res.data[0];
    },
    deleteAktion: async function (id) {
      var urls = [];
      try {
        var got = await client.from('aktionen').select('img').eq('id', id).single();
        if (!got.error && got.data && got.data.img) urls.push(got.data.img);
      } catch (e) { /* Bild-Aufräumen ist optional, Löschen hat Vorrang */ }
      var res = await client.from('aktionen').delete().eq('id', id);
      if (res.error) throw res.error;
      await removeStorageImages(urls);
    },

    getReservations: async function () {
      var res = await client.from('reservations').select('*').order('created_at', { ascending: false });
      if (res.error) throw res.error;
      return res.data;
    },
    setReservationStatus: async function (id, status) {
      var res = await client.from('reservations').update({ status: status }).eq('id', id);
      if (res.error) throw res.error;
    },
    deleteReservation: async function (id) {
      var res = await client.from('reservations').delete().eq('id', id);
      if (res.error) throw res.error;
    },

    // Bild automatisch aufbereiten + in Storage hochladen -> öffentliche URL zurück
    uploadProductImage: async function (file, kind) {
      var processed = await processImage(file, kind || 'product');
      return uploadImage(processed);
    }
  };
})();
