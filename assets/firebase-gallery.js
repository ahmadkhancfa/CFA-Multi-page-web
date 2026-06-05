// Firebase SDK functions + instances — assigned lazily so the SDK
        // never blocks the initial page render.
        let initializeApp, getDatabase, ref, push, onValue, remove,
            getStorage, sRef, uploadBytesResumable, getDownloadURL,
            getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged;
        let app, db, storage, auth, galRef;

        // ── Firebase config ──────────────────────────────────────────
        const firebaseConfig = {
          apiKey: "AIzaSyBFAKvH8gi0N98FwORSppsxOHWyLal0xlo",
          authDomain: "cfagallery-5ba63.firebaseapp.com",
          databaseURL: "https://cfagallery-5ba63-default-rtdb.firebaseio.com",
          projectId: "cfagallery-5ba63",
          storageBucket: "cfagallery-5ba63.firebasestorage.app",
          messagingSenderId: "316101276513",
          appId: "1:316101276513:web:a3ce3ca5cc248586548b20"
        };

        // Authorised admin emails only
        const ADMIN_EMAILS = ['cfa.ltd2024@gmail.com'];

        // ── State ────────────────────────────────────────────────────
        let galleryUnlocked = false;
        let lightboxIndex   = 0;
        let galleryItems    = [];
        let currentUser     = null;

        // ── Lazy Firebase loader ─────────────────────────────────────
        // Downloads the Firebase SDKs on demand instead of on every page
        // load, then wires up auth + the live gallery listener.
        let firebaseStarted = false;
        async function initFirebase() {
          if (firebaseStarted) return;
          firebaseStarted = true;
          const [appMod, dbMod, stMod, authMod] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'),
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js'),
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js')
          ]);
          ({ initializeApp } = appMod);
          ({ getDatabase, ref, push, onValue, remove } = dbMod);
          ({ getStorage, ref: sRef, uploadBytesResumable, getDownloadURL } = stMod);
          ({ getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = authMod);

          app     = initializeApp(firebaseConfig);
          db      = getDatabase(app);
          storage = getStorage(app);
          auth    = getAuth(app);
          galRef  = ref(db, 'gallery');

          // Auth state listener
          onAuthStateChanged(auth, (user) => {
            if (user && ADMIN_EMAILS.includes(user.email)) {
              currentUser     = user;
              galleryUnlocked = true;
              document.getElementById('galleryAuthArea').style.display   = 'none';
              document.getElementById('galleryUploadArea').style.display = 'block';
              document.getElementById('galleryAuthErr').style.display    = 'none';
              galRender(galleryItems);
            } else {
              currentUser     = null;
              galleryUnlocked = false;
              document.getElementById('galleryAuthArea').style.display   = 'block';
              document.getElementById('galleryUploadArea').style.display = 'none';
              galRender(galleryItems);
            }
          });

          // Live gallery listener (public read)
          onValue(galRef, (snapshot) => {
            const data  = snapshot.val();
            const items = [];
            if (data) {
              Object.entries(data)
                .sort((a, b) => (b[1].added || '').localeCompare(a[1].added || ''))
                .forEach(([key, val]) => items.push({ ...val, firebaseKey: key }));
            }
            galRender(items);
          });
        }

        // Kick off Firebase once the browser is idle (after first paint),
        // so normal visitors get the gallery without it blocking render.
        if ('requestIdleCallback' in window) requestIdleCallback(() => initFirebase(), { timeout: 3000 });
        else window.addEventListener('load', () => setTimeout(initFirebase, 1200));

        // ── Render ───────────────────────────────────────────────────
        function galRender(items) {
          galleryItems = items;
          const grid  = document.getElementById('cfaGallery');
          const empty = document.getElementById('galleryEmpty');
          grid.innerHTML = '';
          if (!items.length) {
            empty.style.display = 'block';
            grid.style.display  = 'none';
            return;
          }
          empty.style.display = 'none';
          grid.style.display  = 'grid';
          items.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
              <img src="${item.src}" alt="${item.caption}" loading="lazy" onclick="lightboxOpen(${i})"/>
              <div class="gal-overlay">
                <p style="color:#fff;font-size:.78rem;font-weight:600;margin:0;line-height:1.3">${item.caption}</p>
                <p style="color:rgba(255,255,255,.6);font-size:.72rem;margin:0">${item.date}</p>
              </div>
              <button class="gal-delete" title="Delete" onclick="galDelete('${item.firebaseKey}',event)">✕</button>
            `;
            grid.appendChild(div);
          });
          if (galleryUnlocked) grid.classList.add('gallery-admin-active');
          else grid.classList.remove('gallery-admin-active');
        }

        // ── Admin panel toggle ───────────────────────────────────────
        window.galleryAdminToggle = function() {
          initFirebase();
          const panel = document.getElementById('galleryAdminPanel');
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };

        // ── Login with Firebase Auth ─────────────────────────────────
        window.galleryAuth = async function() {
          await initFirebase();
          const email    = document.getElementById('galleryPwInput').value.trim();
          const password = document.getElementById('galleryPassInput').value;
          const err      = document.getElementById('galleryAuthErr');
          err.style.display = 'none';

          if (!email || !password) {
            err.textContent   = 'Please enter your email and password.';
            err.style.display = 'block'; return;
          }
          if (!ADMIN_EMAILS.includes(email)) {
            err.textContent   = 'This email is not authorised.';
            err.style.display = 'block'; return;
          }

          signInWithEmailAndPassword(auth, email, password)
            .catch((e) => {
              const map = {
                'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase.',
                'auth/user-not-found':        'No account exists for this email in Firebase.',
                'auth/wrong-password':        'Incorrect password.',
                'auth/invalid-credential':    'Incorrect email or password (or account does not exist).',
                'auth/invalid-email':         'That email address is not valid.',
                'auth/unauthorized-domain':   'This website domain is not authorised in Firebase Auth settings.',
                'auth/too-many-requests':     'Too many attempts. Please wait a moment and try again.',
                'auth/network-request-failed':'Network error — check your connection.'
              };
              err.textContent   = map[e.code] || ('Sign-in failed: ' + (e.code || e.message));
              err.style.display = 'block';
              console.error('Gallery sign-in error:', e.code, e.message);
            });
        };

        // ── Lock / sign out ──────────────────────────────────────────
        window.galleryLock = function() {
          signOut(auth).then(() => {
            document.getElementById('galleryAdminPanel').style.display = 'none';
            document.getElementById('galleryPwInput').value  = '';
            document.getElementById('galleryPassInput').value = '';
          });
        };

        // ── Upload to Firebase Storage ───────────────────────────────
        window.galleryUpload = function() {
          if (!currentUser) return;
          const fileInput = document.getElementById('galleryFile');
          const caption   = document.getElementById('galleryCaption').value.trim() || 'CFA Event';
          const date      = document.getElementById('galleryDate').value.trim()    || '';
          const msg       = document.getElementById('galleryMsg');
          const progress  = document.getElementById('galleryProgress');
          const file      = fileInput.files[0];

          if (!file) {
            msg.textContent = 'Please choose a photo first.';
            msg.style.color = 'var(--red)'; msg.style.display = 'block'; return;
          }

          const filename   = 'gallery/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storageRef = sRef(storage, filename);
          const uploadTask = uploadBytesResumable(storageRef, file);

          msg.textContent   = 'Uploading…';
          msg.style.color   = 'var(--text-mid)';
          msg.style.display = 'block';
          progress.style.display = 'block';

          uploadTask.on('state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              progress.querySelector('.gal-progress-fill').style.width = pct + '%';
              msg.textContent = 'Uploading… ' + pct + '%';
            },
            (error) => {
              msg.textContent = 'Upload failed: ' + error.message;
              msg.style.color = 'var(--red)';
              progress.style.display = 'none';
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                return push(galRef, { src: url, caption, date, added: new Date().toISOString() });
              }).then(() => {
                fileInput.value = '';
                document.getElementById('galleryCaption').value = '';
                document.getElementById('galleryDate').value    = '';
                progress.style.display = 'none';
                progress.querySelector('.gal-progress-fill').style.width = '0%';
                msg.textContent = '✓ Photo uploaded! Now live for all visitors.';
                msg.style.color = '#27ae60';
                setTimeout(() => msg.style.display = 'none', 4000);
              }).catch(err => {
                msg.textContent = 'Error saving: ' + err.message;
                msg.style.color = 'var(--red)';
              });
            }
          );
        };

        // ── Delete ───────────────────────────────────────────────────
        window.galDelete = function(firebaseKey, e) {
          e.stopPropagation();
          if (!currentUser) return;
          if (!confirm('Delete this photo?')) return;
          remove(ref(db, 'gallery/' + firebaseKey));
        };

        // ── Lightbox ─────────────────────────────────────────────────
        window.lightboxOpen = function(index) {
          lightboxIndex = index;
          const box = document.getElementById('cfaLightbox');
          box.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          lightboxShow(galleryItems[index]);
          document.getElementById('cfaLbPrev').style.display = index === 0                     ? 'none' : 'block';
          document.getElementById('cfaLbNext').style.display = index === galleryItems.length-1 ? 'none' : 'block';
        };

        function lightboxShow(item) {
          document.getElementById('cfaLightboxImg').src             = item.src;
          document.getElementById('cfaLightboxCaption').textContent = item.caption;
          document.getElementById('cfaLightboxDate').textContent    = item.date;
        }

        window.lightboxNav = function(dir) {
          lightboxIndex = Math.max(0, Math.min(galleryItems.length-1, lightboxIndex + dir));
          lightboxShow(galleryItems[lightboxIndex]);
          document.getElementById('cfaLbPrev').style.display = lightboxIndex === 0                     ? 'none' : 'block';
          document.getElementById('cfaLbNext').style.display = lightboxIndex === galleryItems.length-1 ? 'none' : 'block';
        };

        window.lightboxClose = function(e) {
          if (e && e.target !== document.getElementById('cfaLightbox') && !e.target.closest('button[onclick="lightboxClose(event)"]')) return;
          document.getElementById('cfaLightbox').style.display = 'none';
          document.body.style.overflow = '';
        };

        document.addEventListener('keydown', function(e) {
          const box = document.getElementById('cfaLightbox');
          if (box.style.display === 'none') return;
          if (e.key === 'Escape')     window.lightboxClose({target: box});
          if (e.key === 'ArrowLeft')  window.lightboxNav(-1);
          if (e.key === 'ArrowRight') window.lightboxNav(1);
        });