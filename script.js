import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyCQ-8xDBbTDugkwdJMT6BbnaW5aQxufbf4",
    authDomain: "webparis-ef921.firebaseapp.com",
    databaseURL: "https://webparis-ef921-default-rtdb.firebaseio.com",
    projectId: "webparis-ef921",
    storageBucket: "webparis-ef921.firebasestorage.app",
    messagingSenderId: "393700256445",
    appId: "1:393700256445:web:016d82e03e2c00a24425d4",
    measurementId: "G-TLSZHV5Y5Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ربط الأزرار بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('mainAuthBtn');
    const switchBtn = document.getElementById('switchBtn');
    const title = document.getElementById('authTitle');

    // دالة الدخول والتسجيل
    if (authBtn) {
        authBtn.onclick = async () => {
            const user = document.getElementById('username').value.trim().toLowerCase();
            const pass = document.getElementById('pass').value;
            const isLogin = title.innerText.includes("دخول");

            if (!user || !pass) return alert("يرجى كتابة اليوزر والباسورد");

            const userRef = ref(db, 'users/' + user);
            try {
                const snapshot = await get(userRef);
                if (isLogin) {
                    if (snapshot.exists() && snapshot.val().pass === pass) {
                        const userData = snapshot.val();
                        if (userData.banned) return alert("أنت محظور!");
                        sessionStorage.setItem('paris_session', JSON.stringify(userData));
                        window.location.replace("index.html"); // انتقال آمن
                    } else alert("خطأ في البيانات!");
                } else {
                    if (snapshot.exists()) return alert("اليوزر مستخدم!");
                    await set(userRef, { user, pass, rank: "USER", banned: false });
                    alert("تم التسجيل! سجل دخولك الآن.");
                    location.reload();
                }
            } catch (e) { alert("فشل الاتصال: " + e.message); }
        };
    }

    // التبديل بين الواجهات
    if (switchBtn) {
        switchBtn.onclick = () => {
            const isLog = title.innerText.includes("دخول");
            title.innerText = isLog ? "إنشاء حساب جديد" : "دخول النظام";
            authBtn.innerText = isLog ? "تسجيل الحساب" : "دخول";
            switchBtn.innerText = isLog ? "لديك حساب؟ دخول" : "ليس لديك حساب؟ إنشاء حساب";
        };
    }

    // تحميل بيانات الصفحة الرئيسية
    loadDashboard();
});

function loadDashboard() {
    const session = sessionStorage.getItem('paris_session');
    if (!session || !document.getElementById('uName')) return;
    const user = JSON.parse(session);
    document.getElementById('uName').innerText = user.user;
    document.getElementById('uRank').innerText = user.rank;
    document.getElementById('uInit').innerText = user.user[0].toUpperCase();
    if (user.rank === 'OWNER') document.getElementById('adminBtn').style.display = 'block';
}

window.openModule = (id) => {
    // إذا كان القسم سجن أو بنك أو أخبار، توجه للصفحة مباشرة
    if (id === 'prison') {
        window.location.href = 'prison.html';
        return;
    }
    if (id === 'bank') {
        window.location.href = 'bank.html';
        return;
    }
    if (id === 'news') {
        window.location.href = 'news.html';
        return;
    }
    if (id === 'court') {
        window.location.href = 'court.html';
        return;
    }
    // ... باقي الأكواد للأقسام الأخرى
};
// الدوال العامة للموقع (نشر، حظر، خروج)
window.logout = () => { sessionStorage.clear(); window.location.replace("login.html"); };
window.closeModal = () => document.getElementById('mainModal').style.display = 'none';


