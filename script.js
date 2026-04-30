import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, remove, onChildRemoved, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// بيانات فايربيز الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyAMV3-20MM0bvwQ8xrofLyY_h2y7rlUd90",
  authDomain: "real-ffb38.firebaseapp.com",
  databaseURL: "https://real-ffb38-default-rtdb.firebaseio.com",
  projectId: "real-ffb38",
  storageBucket: "real-ffb38.firebasestorage.app",
  messagingSenderId: "896035772842",
  appId: "1:896035772842:web:829d43c7818880685c33d3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// عدل ده بإيميلك الشخصي عشان تكون الأدمن
const ADMIN_EMAIL = "o6003558@gmail.com"; 

// --- 1. مراقبة حالة المستخدم والتبديل بين الواجهات ---
onAuthStateChanged(auth, (user) => {
    const authUI = document.getElementById("auth-container");
    const chatUI = document.getElementById("chat-container");
    const adminUI = document.getElementById("admin-panel");

    if (user) {
        authUI.style.display = "none";
        chatUI.style.display = "block";
        if (user.email === ADMIN_EMAIL) {
            adminUI.style.display = "block";
            loadAdminUsers();
        }
    } else {
        authUI.style.display = "block";
        chatUI.style.display = "none";
        adminUI.style.display = "none";
        document.getElementById("chat-box").innerHTML = "";
    }
});

// --- 2. وظائف التسجيل والدخول ---
document.getElementById("signup-btn").onclick = () => {
    const email = document.getElementById("email-input").value;
    const pass = document.getElementById("password-input").value;
    createUserWithEmailAndPassword(auth, email, pass).then(res => {
        set(ref(db, 'users/' + res.user.uid), { email: email, vip: false });
        alert("تم إنشاء الحساب!");
    }).catch(err => alert(err.message));
};

document.getElementById("login-btn").onclick = () => {
    const email = document.getElementById("email-input").value;
    const pass = document.getElementById("password-input").value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

document.getElementById("logout-btn").onclick = () => signOut(auth);

// --- 3. نظام الشات ---
document.getElementById("send-btn").onclick = () => {
    const input = document.getElementById("message-input");
    if (input.value.trim() && auth.currentUser) {
        push(ref(db, "messages"), {
            uid: auth.currentUser.uid,
            text: input.value,
            email: auth.currentUser.email
        });
        input.value = "";
    }
};

onChildAdded(ref(db, "messages"), (data) => {
    const chatBox = document.getElementById("chat-box");
    const msg = data.val();
    const div = document.createElement("div");
    div.id = data.key;
    div.className = `msg ${auth.currentUser?.uid === msg.uid ? 'my-msg' : 'other-msg'}`;
    
    // زر الحذف للأدمن فقط داخل الشات
    let del = (auth.currentUser?.email === ADMIN_EMAIL) ? `<span onclick="deleteMsg('${data.key}')" style="color:red; cursor:pointer; font-size:11px; margin-right:8px;">✖</span>` : "";
    
    div.innerHTML = `<div>${msg.text}</div>${del}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

window.deleteMsg = (id) => remove(ref(db, "messages/" + id));
onChildRemoved(ref(db, "messages"), (data) => document.getElementById(data.key)?.remove());

// --- 4. لوحة الأدمن (التحكم في الـ VIP) ---
function loadAdminUsers() {
    onValue(ref(db, 'users'), (snapshot) => {
        const list = document.getElementById("users-list");
        list.innerHTML = "";
        snapshot.forEach(child => {
            const userData = child.val();
            if (userData.email === ADMIN_EMAIL) return;
            const card = document.createElement("div");
            card.className = "user-card";
            card.innerHTML = `
                <span style="font-size:13px;">${userData.email}</span>
                <button onclick="toggleVip('${child.key}', ${userData.vip})" style="background:${userData.vip ? '#ff4d4d' : '#28a745'}; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                    ${userData.vip ? 'إلغاء VIP' : 'تفعيل VIP'}
                </button>
            `;
            list.appendChild(card);
        });
    });
}

window.toggleVip = (uid, currentStatus) => update(ref(db, 'users/' + uid), { vip: !currentStatus });

// 3. ربط العمليات بالزراير
document.addEventListener("DOMContentLoaded", () => {

    // إنشاء حساب
    document.getElementById("signup-btn").onclick = () => {
        const email = document.getElementById("email-input").value;
        const pass = document.getElementById("password-input").value;
        createUserWithEmailAndPassword(auth, email, pass)
            .then(res => {
                set(ref(db, 'users/' + res.user.uid), { email: email, role: "user" });
                alert("تم إنشاء الحساب!");
            }).catch(err => alert(err.message));
    };

    // تسجيل دخول
    document.getElementById("login-btn").onclick = () => {
        const email = document.getElementById("email-input").value;
        const pass = document.getElementById("password-input").value;
        signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
    };

    // تسجيل خروج
    document.getElementById("logout-btn").onclick = () => signOut(auth);

    // إرسال رسالة
    document.getElementById("send-btn").onclick = () => {
        const input = document.getElementById("message-input");
        if (input.value.trim() !== "" && auth.currentUser) {
            push(ref(db, "messages"), {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                text: input.value,
                date: Date.now()
            });
            input.value = "";
        }
    };
});

// 4. استقبال وحذف الرسائل (Real-time)
const msgRef = ref(db, "messages");

onChildAdded(msgRef, (data) => {
    const chatBox = document.getElementById("chat-box");
    const msgData = data.val();
    const div = document.createElement("div");
    div.id = data.key;
    div.classList.add("msg");

    // تمييز رسائلي عن رسائل الآخرين
    if (auth.currentUser && msgData.uid === auth.currentUser.uid) {
        div.classList.add("my-msg");
    } else {
        div.classList.add("other-msg");
    }

    // إضافة زر حذف للأدمن فقط
    let delBtn = "";
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
        delBtn = `<span onclick="deleteMsg('${data.key}')" style="color:red; cursor:pointer; font-size:10px; margin-right:10px;">[حذف]</span>`;
    }

    div.innerHTML = `${msgData.text} ${delBtn}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// وظيفة الحذف (تعريفها على الـ window عشان الـ HTML يشوفها)
window.deleteMsg = (id) => {
    if(confirm("حذف الرسالة؟")) remove(ref(db, "messages/" + id));
};

// إخفاء الرسالة فوراً عند حذفها من السيرفر
onChildRemoved(msgRef, (data) => {
    document.getElementById(data.key)?.remove();
});
