import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQ-8xDBbTDugkwdJMT6BbnaW5aQxufbf4",
    databaseURL: "https://webparis-ef921-default-rtdb.firebaseio.com",
    projectId: "webparis-ef921",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = JSON.parse(sessionStorage.getItem('paris_session'));

// تحديث بيانات الواجهة فوراً
if (currentUser && document.getElementById('uName')) {
    document.getElementById('uName').innerText = currentUser.user;
    document.getElementById('uRank').innerText = currentUser.rank;
    document.getElementById('uInit').innerText = currentUser.user[0].toUpperCase();
    if (currentUser.rank === 'OWNER') document.getElementById('adminBtn').style.display = 'block';
}

// دالة الخروج
window.logout = () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
};

// وبقية الدوال (handleAuth, openModule) كما هي في الكود السابق...

