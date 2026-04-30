// 1. استدعاء المكتبات
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved, update, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. إعدادات فايربيز (حط بياناتك هنا)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "o2omar-ed97b.firebaseapp.com",
    databaseURL: "https://o2omar-ed97b-default-rtdb.firebaseio.com",
    projectId: "o2omar-ed97b",
    storageBucket: "o2omar-ed97b.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "omar@example.com"; // إيميلك الأدمن
let currentUser = null;

// 3. مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById("auth-container");
    const chatContainer = document.getElementById("chat-container");
    const adminPanel = document.getElementById("admin-panel");
    const logoutBtn = document.getElementById("logout-btn");

    if (user) {
        currentUser = user;
        if(authContainer) authContainer.style.display = "none";
        if(chatContainer) chatContainer.style.display = "block";
        if(logoutBtn) logoutBtn.style.display = "block";

        if (user.email === ADMIN_EMAIL) {
            if(adminPanel) adminPanel.style.display = "block";
            loadUsersForAdmin();
        }
    } else {
        currentUser = null;
        if(authContainer) authContainer.style.display = "block";
        if(chatContainer) chatContainer.style.display = "none";
        if(adminPanel) adminPanel.style.display = "none";
        if(logoutBtn) logoutBtn.style.display = "none";
    }
});

// 4. وظائف الحسابات (ربط مباشر مع الـ window عشان الـ HTML يشوفهم)
window.signup = function() {
    const email = document.getElementById("email-input").value;
    const pass = document.getElementById("password-input").value;
    createUserWithEmailAndPassword(auth, email, pass)
        .then((res) => {
            set(ref(db, 'users/' + res.user.uid), {
                email: email,
                role: "user",
                features: { vip: false }
            });
            alert("تم إنشاء الحساب!");
        })
        .catch((err) => alert(err.message));
};

window.login = function() {
    const email = document.getElementById("email-input").value;
    const pass = document.getElementById("password-input").value;
    console.log("جاري تسجيل الدخول..."); // عشان نتأكد إن الزرار شغال
    signInWithEmailAndPassword(auth, email, pass)
        .catch((err) => alert("خطأ: " + err.message));
};

window.logout = function() {
    if(confirm("خروج؟")) signOut(auth);
};

// 5. نظام الشات
window.sendMessage = function() {
    const input = document.getElementById("message-input");
    if (input.value.trim() !== "" && currentUser) {
        push(ref(db, "messages"), {
            senderId: currentUser.uid,
            text: input.value,
            timestamp: Date.now()
        });
        input.value = "";
    }
};

onChildAdded(ref(db, "messages"), (data) => {
    const chatBox = document.getElementById("chat-box");
    if(!chatBox) return;
    const msg = data.val();
    const div = document.createElement("div");
    div.classList.add("message");
    div.id = data.key;
    div.classList.add(currentUser && msg.senderId === currentUser.uid ? "my-message" : "others-message");

    let deleteBtn = "";
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
        deleteBtn = `<span onclick="deleteMessage('${data.key}')" style="color:red; cursor:pointer;">[حذف]</span>`;
    }

    div.innerHTML = `<span>${msg.text}</span> ${deleteBtn}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

window.deleteMessage = function(id) {
    remove(ref(db, "messages/" + id));
};

onChildRemoved(ref(db, "messages"), (data) => {
    const el = document.getElementById(data.key);
    if(el) el.remove();
});

// 6. لوحة الأدمن
function loadUsersForAdmin() {
    onValue(ref(db, 'users'), (snapshot) => {
        const list = document.getElementById("users-list");
        if(!list) return;
        list.innerHTML = "";
        snapshot.forEach((child) => {
            const user = child.val();
            if(user.email === ADMIN_EMAIL) return;
            const isVip = user.features?.vip || false;
            const card = document.createElement("div");
            card.innerHTML = `
                <p>${user.email} - VIP: ${isVip}</p>
                <button onclick="toggleVip('${child.key}', ${isVip})">تغيير الحالة</button>
            `;
            list.appendChild(card);
        });
    });
}

window.toggleVip = function(uid, status) {
    update(ref(db, 'users/' + uid + '/features'), { vip: !status });
};

