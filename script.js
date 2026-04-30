import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. بيانات فايربيز الخاصة بك (تم تصحيحها)
const firebaseConfig = {
  apiKey: "AIzaSyAMV3-20MM0bvwQ8xrofLyY_h2y7rlUd90",
  authDomain: "real-ffb38.firebaseapp.com",
  databaseURL: "https://real-ffb38-default-rtdb.firebaseio.com",
  projectId: "real-ffb38",
  storageBucket: "real-ffb38.firebasestorage.app",
  messagingSenderId: "896035772842",
  appId: "1:896035772842:web:829d43c7818880685c33d3"
};

// تهيئة الخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// إيميل الإدارة (عدله لإيميلك الحقيقي)
const ADMIN_EMAIL = "admin@example.com";

// 2. مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
    const authCont = document.getElementById("auth-container");
    const chatCont = document.getElementById("chat-container");
    if (user) {
        authCont.style.display = "none";
        chatCont.style.display = "block";
        console.log("داخل باسم:", user.email);
    } else {
        authCont.style.display = "block";
        chatCont.style.display = "none";
    }
});

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
