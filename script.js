// 1. استدعاء المكتبات
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved, update, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("✅ ملف script.js اشتغل بنجاح!");

// 2. إعدادات فايربيز (تأكد من بياناتك هنا)
const firebaseConfig = {
    apiKey: "ضع_هنا_مفتاحك",
    authDomain: "o2omar-ed97b.firebaseapp.com",
    databaseURL: "https://o2omar-ed97b-default-rtdb.firebaseio.com",
    projectId: "o2omar-ed97b",
    storageBucket: "o2omar-ed97b.appspot.com",
    messagingSenderId: "77777777",
    appId: "1:77777:web:7777"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "omar@example.com"; // إيميلك الأدمن
let currentUser = null;

// 3. مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
    console.log("👤 حالة المستخدم تغيرت إلى:", user ? user.email : "غير مسجل");
    const authContainer = document.getElementById("auth-container");
    const chatContainer = document.getElementById("chat-container");
    const adminPanel = document.getElementById("admin-panel");
    const logoutBtn = document.getElementById("logout-btn");

    if (user) {
        currentUser = user;
        if(authContainer) authContainer.style.display = "none";
        if(chatContainer) chatContainer.style.display = "block";
        if(logoutBtn) logoutBtn.style.display = "block";
        if (user.email === ADMIN_EMAIL && adminPanel) adminPanel.style.display = "block";
    } else {
        currentUser = null;
        if(authContainer) authContainer.style.display = "block";
        if(chatContainer) chatContainer.style.display = "none";
        if(adminPanel) adminPanel.style.display = "none";
        if(logoutBtn) logoutBtn.style.display = "none";
    }
});

// 4. ربط الزراير (طريقة يدوية قوية)
window.onload = () => {
    console.log("🚀 الصفحة حملت تمام، جاري ربط الزراير...");

    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginBtn) {
        loginBtn.onclick = () => {
            const email = document.getElementById("email-input").value;
            const pass = document.getElementById("password-input").value;
            console.log("🔄 محاولة تسجيل دخول...");
            signInWithEmailAndPassword(auth, email, pass)
                .catch(err => alert("خطأ دخول: " + err.message));
        };
    }

    if (signupBtn) {
        signupBtn.onclick = () => {
            const email = document.getElementById("email-input").value;
            const pass = document.getElementById("password-input").value;
            console.log("🔄 محاولة إنشاء حساب...");
            createUserWithEmailAndPassword(auth, email, pass)
                .then(res => {
                    set(ref(db, 'users/' + res.user.uid), { email, role: "user", features: { vip: false } });
                    alert("تم التسجيل!");
                })
                .catch(err => alert("خطأ تسجيل: " + err.message));
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => { if(confirm("خروج؟")) signOut(auth); };
    }
};

// 5. إرسال الرسائل (خارج الـ window.onload)
window.sendMessage = function() {
    const input = document.getElementById("message-input");
    if (input && input.value.trim() !== "" && currentUser) {
        push(ref(db, "messages"), {
            senderId: currentUser.uid,
            text: input.value,
            timestamp: Date.now()
        });
        input.value = "";
    }
};

// 6. عرض وحذف الرسائل
onChildAdded(ref(db, "messages"), (data) => {
    const chatBox = document.getElementById("chat-box");
    if(!chatBox) return;
    const msg = data.val();
    const div = document.createElement("div");
    div.classList.add("message");
    div.id = data.key;
    div.classList.add(currentUser && msg.senderId === currentUser.uid ? "my-message" : "others-message");

    let deleteBtn = (currentUser && currentUser.email === ADMIN_EMAIL) 
        ? `<span onclick="deleteMessage('${data.key}')" style="color:red; cursor:pointer;">[X]</span>` : "";

    div.innerHTML = `<span>${msg.text}</span> ${deleteBtn}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

window.deleteMessage = (id) => remove(ref(db, "messages/" + id));
onChildRemoved(ref(db, "messages"), (data) => document.getElementById(data.key)?.remove());
