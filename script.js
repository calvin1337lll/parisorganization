// كود الحماية - يوضع في أعلى ملف script.js
if (!sessionStorage.getItem('paris_session') && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- ضع بياناتك هنا من Firebase Console ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = JSON.parse(sessionStorage.getItem('paris_session'));

// --- نظام الدخول والتسجيل ---
window.handleAuth = async function() {
    const userVal = document.getElementById('username').value.trim().toLowerCase();
    const passVal = document.getElementById('pass').value;
    const isLogin = document.getElementById('authTitle').innerText.includes("دخول");

    if (userVal.length < 3 || passVal.length < 8) return alert("اليوزر 3+ حروف والباسورد 8+");

    const userRef = ref(db, 'users/' + userVal);
    const snapshot = await get(userRef);

    if (isLogin) {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.pass === passVal) {
                if (userData.banned) return alert("حسابك محظور!");
                sessionStorage.setItem('paris_session', JSON.stringify(userData));
                window.location.href = 'index.html';
            } else alert("كلمة السر خاطئة");
        } else alert("المستخدم غير موجود");
    } else {
        if (snapshot.exists()) return alert("اسم المستخدم مأخوذ!");
        await set(userRef, { user: userVal, pass: passVal, rank: "USER", banned: false });
        alert("تم إنشاء الحساب! سجل دخول الآن.");
        location.reload();
    }
};

// --- حماية الصفحة وتحميل الصلاحيات ---
if (window.location.pathname.includes('index.html')) {
    if (!currentUser) window.location.href = 'login.html';
    else {
        document.getElementById('uName').innerText = currentUser.user;
        document.getElementById('uRank').innerText = currentUser.rank;
        document.getElementById('uInit').innerText = currentUser.user[0].toUpperCase();
        if (currentUser.rank === 'OWNER') document.getElementById('adminBtn').style.display = 'block';
    }
}

// --- نظام النشر (للمالك والمسؤولين) ---
window.sendPost = function(modId) {
    const txt = document.getElementById('msg').value;
    if (!txt) return;
    const postRef = ref(db, `posts/${modId}/${Date.now()}`);
    set(postRef, { by: currentUser.user, rank: currentUser.rank, txt: txt, time: new Date().toLocaleTimeString() });
    document.getElementById('msg').value = "";
};

window.openModule = function(id) {
    const modal = document.getElementById('mainModal');
    document.getElementById('modalTitle').innerText = "قسم " + id.toUpperCase();
    
    onValue(ref(db, 'posts/' + id), (snapshot) => {
        let html = `<div class="post-list">`;
        const data = snapshot.val();
        if (data) {
            Object.values(data).reverse().forEach(p => {
                html += `<div class="post-item"><b>${p.by} [${p.rank}]:</b><p>${p.txt}</p><small>${p.time}</small></div>`;
            });
        } else html += "<p>لا توجد منشورات.</p>";
        html += `</div>`;
        
        // صلاحية النشر للمسؤولين والمالك فقط
        if (currentUser.rank === 'OWNER' || currentUser.rank === 'ADMIN') {
            html += `<textarea id="msg" placeholder="اكتب إعلاناً..."></textarea>
                     <button class="btn-auth" onclick="sendPost('${id}')">نشر الإعلان</button>`;
        }
        document.getElementById('modalBody').innerHTML = html;
    });
    modal.style.display = 'block';
};

// --- لوحة المالك ---
window.openAdminPanel = function() {
    onValue(ref(db, 'users'), (snapshot) => {
        let html = `<table style="width:100%; border-collapse:collapse;">
                    <tr style="background:#eee;"><th>اليوزر</th><th>الرتبة</th><th>الحالة</th><th>إجراء</th></tr>`;
        const data = snapshot.val();
        for (let key in data) {
            let u = data[key];
            html += `<tr style="border-bottom:1px solid #ddd; text-align:center;">
                <td>${u.user}</td>
                <td>${u.rank}</td>
                <td>${u.banned ? '🔴' : '🟢'}</td>
                <td>
                    <button onclick="updateUser('${u.user}', 'ADMIN')">مسؤول</button>
                    <button onclick="updateUser('${u.user}', 'USER')">مواطن</button>
                    <button onclick="banUser('${u.user}', ${!u.banned})">${u.banned ? 'فك حظر' : 'حظر'}</button>
                </td>
            </tr>`;
        }
        document.getElementById('modalBody').innerHTML = html + `</table>`;
    });
    document.getElementById('mainModal').style.display = 'block';
};

window.updateUser = (user, rank) => update(ref(db, 'users/' + user), { rank });
window.banUser = (user, status) => update(ref(db, 'users/' + user), { banned: status });
window.logout = () => { sessionStorage.clear(); window.location.href = 'login.html'; };

window.closeModal = () => document.getElementById('mainModal').style.display = 'none';
