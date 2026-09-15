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
    return {
      id: r.id,
      sku: r.sku,
      title: r.title,
      brand: r.brand,
      category: r.category,
      price: formatPrice(r.price),   // formatiert für Anzeige
      priceRaw: r.price,             // Zahl für Formulare
      stock: r.stock,
      active: r.active,
      img: r.img,
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

  window.LoeglAPI = {
    client: client,
    formatPrice: formatPrice,

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

    // Atomare Reservierung über die DB-Funktion (prüft Lager, zieht ab, gibt Code zurück)
    createReservation: async function (productId, name, phone, email) {
      var res = await client.rpc('create_reservation', {
        p_product_id: productId, p_name: name, p_phone: phone, p_email: email
      });
      if (res.error) throw res.error;
      return Array.isArray(res.data) ? res.data[0] : res.data; // { pickup_code, product_title }
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
      var row = {
        sku: p.sku || null, title: p.title, brand: p.brand, category: p.category,
        price: p.price, stock: p.stock, active: p.active, img: p.img,
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

    // Bild in Storage hochladen -> öffentliche URL zurück
    uploadProductImage: async function (file) {
      var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      var path = 'products/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      var up = await client.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (up.error) throw up.error;
      var pub = client.storage.from('product-images').getPublicUrl(path);
      return pub.data.publicUrl;
    }
  };
})();
