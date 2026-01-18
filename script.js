import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- إعدادات Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCQ-8xDBbTDugkwdJMT6BbnaW5aQxufbf4",
    databaseURL: "https://webparis-ef921-default-rtdb.firebaseio.com",
    projectId: "webparis-ef921",
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ربط العناصر برمجياً عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtnAction');
    const switchBtn = document.getElementById('switchModeBtn');
    const title = document.getElementById('authTitle');

    if (authBtn) {
        authBtn.onclick = handleAuth;
    }

    if (switchBtn) {
        switchBtn.onclick = () => {
            if (title.innerText.includes("دخول")) {
                title.innerText = "إنشاء حساب جديد";
                authBtn.innerText = "تسجيل الحساب";
                switchBtn.innerText = "لديك حساب؟ تسجيل دخول";
            } else {
                title.innerText = "دخول النظام";
                authBtn.innerText = "دخول";
                switchBtn.innerText = "ليس لديك حساب؟ إنشاء حساب";
            }
        };
    }
});

// دالة الدخول والتسجيل الرئيسية
async function handleAuth() {
    const user = document.getElementById('username').value.trim().toLowerCase();
    const pass = document.getElementById('pass').value;
    const isLoginMode = document.getElementById('authBtnAction').innerText === "دخول";
    const status = document.getElementById('statusMessage');

    // شروط التحقق
    if (user.length < 3) return alert("اسم المستخدم قصير جداً!");
    if (pass.length < 8) return alert("كلمة السر يجب أن تكون 8 خانات أو أكثر!");

    status.innerText = "جاري الاتصال بقاعدة البيانات...";
    const userRef = ref(db, 'users/' + user);

    try {
        const snapshot = await get(userRef);

        if (isLoginMode) {
            // منطق تسجيل الدخول
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.pass === pass) {
                    if (userData.banned) {
                        status.innerText = "";
                        return alert("عذراً، هذا الحساب محظور!");
                    }
                    // نجاح الدخول
                    sessionStorage.setItem('paris_session', JSON.stringify(userData));
                    window.location.href = 'index.html';
                } else {
                    alert("كلمة السر التي أدخلتها غير صحيحة!");
                }
            } else {
                alert("اسم المستخدم هذا غير مسجل لدينا!");
            }
        } else {
            // منطق إنشاء حساب جديد
            if (snapshot.exists()) {
                alert("اسم المستخدم مأخوذ بالفعل، اختر اسماً آخر.");
            } else {
                await set(userRef, {
                    user: user,
                    pass: pass,
                    rank: "USER",
                    banned: false
                });
                alert("تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.");
                location.reload(); // إعادة التحميل للتبديل لوضع الدخول
            }
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال: " + error.message);
    } finally {
        status.innerText = "";
    }
}

// --- نظام تعديل الملف الشخصي (داخل index.html) ---
window.updateProfile = async function() {
    const currentUser = JSON.parse(sessionStorage.getItem('paris_session'));
    const newPass = document.getElementById('newPass').value;
    const oldPass = document.getElementById('oldPass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (oldPass !== currentUser.pass) return alert("كلمة السر القديمة غير صحيحة!");
    if (newPass.length < 8) return alert("كلمة السر الجديدة يجب أن تكون 8 خانات!");
    if (newPass !== confirmPass) return alert("كلمات السر الجديدة غير متطابقة!");

    try {
        await update(ref(db, 'users/' + currentUser.user), { pass: newPass });
        currentUser.pass = newPass;
        sessionStorage.setItem('paris_session', JSON.stringify(currentUser));
        alert("تم تحديث كلمة السر بنجاح!");
        location.reload();
    } catch (e) {
        alert("فشل التحديث!");
    }
}
