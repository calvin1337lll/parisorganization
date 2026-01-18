import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- ضع بيانات Firebase الخاصة بك هنا ---
const firebaseConfig = {
    apiKey: "ضع_هنا_API_KEY",
    databaseURL: "ضع_هنا_URL",
    projectId: "ضع_هنا_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const mainBtn = document.getElementById('mainAuthBtn');
    const switchBtn = document.getElementById('switchBtn');
    const title = document.getElementById('authTitle');
    const extraFields = document.getElementById('registerExtra');

    // دالة التبديل بين الدخول والتسجيل
    if (switchBtn) {
        switchBtn.onclick = () => {
            isLoginMode = !isLoginMode;
            title.innerText = isLoginMode ? "دخول النظام" : "إنشاء حساب جديد";
            mainBtn.innerText = isLoginMode ? "دخول" : "تسجيل الحساب";
            switchBtn.innerText = isLoginMode ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل دخول";
            extraFields.style.display = isLoginMode ? "none" : "block";
        };
    }

    // دالة تنفيذ العملية (دخول أو تسجيل)
    if (mainBtn) {
        mainBtn.onclick = async () => {
            const user = document.getElementById('username').value.trim().toLowerCase();
            const pass = document.getElementById('pass').value;
            const confirmPass = document.getElementById('confirmPass').value;

            if (user.length < 3 || pass.length < 8) {
                return alert("اليوزر 3+ حروف والباسورد 8+ خانات");
            }

            const userRef = ref(db, 'users/' + user);

            try {
                const snapshot = await get(userRef);

                if (isLoginMode) {
                    // تسجيل دخول
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        if (data.pass === pass) {
                            if (data.banned) return alert("حسابك محظور!");
                            sessionStorage.setItem('paris_session', JSON.stringify(data));
                            window.location.href = 'index.html';
                        } else alert("كلمة السر خاطئة!");
                    } else alert("اليوزر غير موجود!");
                } else {
                    // إنشاء حساب
                    if (pass !== confirmPass) return alert("كلمات السر غير متطابقة!");
                    if (snapshot.exists()) return alert("اليوزر مستخدم بالفعل!");

                    await set(userRef, { user, pass, rank: "USER", banned: false });
                    alert("تم إنشاء الحساب! سجل دخولك الآن.");
                    location.reload();
                }
            } catch (e) {
                alert("خطأ في الاتصال: " + e.message);
            }
        };
    }
});
