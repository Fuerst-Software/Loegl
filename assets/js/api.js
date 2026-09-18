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
      specs: r.specs
    };
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
    product: { w: 1200, h: 900, quality: 0.85 },   // 4:3  (Produktkarten)
    aktion:  { w: 1600, h: 900, quality: 0.85 }    // 16:9 (Aktions-Banner)
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
    whitenBackground(ctx, preset.w, preset.h);
    var blob = await new Promise(function (res) { canvas.toBlob(res, 'image/jpeg', preset.quality); });
    return blob || file;
  }
  // Hintergrund automatisch aufweißen: helle, wenig gesättigte Pixel, die mit dem
  // Rand verbunden sind, auf reines Weiß setzen (Flood-Fill). Farbige/dunkle
  // Produktbereiche wirken als Grenze und bleiben unangetastet.
  function whitenBackground(ctx, W, H) {
    var img;
    try { img = ctx.getImageData(0, 0, W, H); } catch (e) { return; }
    var d = img.data, N = W * H;
    var visited = new Uint8Array(N);
    var stack = [];
    function push(x, y) { var i = y * W + x; if (!visited[i]) { visited[i] = 1; stack.push(i); } }
    for (var x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
    for (var y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
    while (stack.length) {
      var i = stack.pop(), p = i * 4;
      var r = d[p], g = d[p + 1], b = d[p + 2];
      var mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
      var mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
      if (mn < 170 || (mx - mn) > 32) continue; // Produktgrenze -> nicht aufweißen/ausbreiten
      d[p] = 255; d[p + 1] = 255; d[p + 2] = 255;
      var xx = i % W, yy = (i - xx) / W;
      if (xx > 0) push(xx - 1, yy);
      if (xx < W - 1) push(xx + 1, yy);
      if (yy > 0) push(xx, yy - 1);
      if (yy < H - 1) push(xx, yy + 1);
    }
    ctx.putImageData(img, 0, 0);
  }
  async function uploadImage(blobOrFile) {
    var path = 'products/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    var up = await client.storage.from('product-images').upload(path, blobOrFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });
    if (up.error) throw up.error;
    return client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
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
      return res.data.map(normProduct);
    },

    getAktionen: async function () {
      var res = await client.from('aktionen').select('*').eq('active', true).order('created_at', { ascending: true });
      if (res.error) throw res.error;
      return res.data.map(normAktion);
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
      return res.data.map(normProduct);
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
      var q = p.id
        ? client.from('products').update(row).eq('id', p.id).select()
        : client.from('products').insert(row).select();
      var res = await q;
      if (res.error) throw res.error;
      return res.data[0];
    },
    deleteProduct: async function (id) {
      var res = await client.from('products').delete().eq('id', id);
      if (res.error) throw res.error;
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
      var res = await client.from('aktionen').delete().eq('id', id);
      if (res.error) throw res.error;
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

    // Bild automatisch aufbereiten + in Storage hochladen -> öffentliche URL zurück
    uploadProductImage: async function (file, kind) {
      var processed = await processImage(file, kind || 'product');
      return uploadImage(processed);
    }
  };
})();
