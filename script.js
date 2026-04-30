import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. بياناتك اللي نسختها من فايربيز (حطها هنا)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMV3-20MM0bvwQ8xrofLyY_h2y7rlUd90",
  authDomain: "real-ffb38.firebaseapp.com",
  databaseURL: "https://real-ffb38-default-rtdb.firebaseio.com",
  projectId: "real-ffb38",
  storageBucket: "real-ffb38.firebasestorage.app",
  messagingSenderId: "896035772842",
  appId: "1:896035772842:web:829d43c7818880685c33d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// تشغيل الفايربيز
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 2. مراقب حالة المستخدم (بيشتغل لوحده أول ما تفتح الصفحة)
onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById("auth-container");
    const chatContainer = document.getElementById("chat-container");

    if (user) {
        console.log("تم تسجيل الدخول بـ:", user.email);
        authContainer.style.display = "none";
        chatContainer.style.display = "block";
    } else {
        console.log("لا يوجد مستخدم حالياً");
        authContainer.style.display = "block";
        chatContainer.style.display = "none";
    }
});

// 3. ربط الأوامر بالزراير (الطريقة الأضمن)
document.addEventListener("DOMContentLoaded", () => {
    
    // زرار إنشاء الحساب
    document.getElementById("signup-btn").onclick = () => {
        const email = document.getElementById("email-input").value;
        const pass = document.getElementById("password-input").value;
        createUserWithEmailAndPassword(auth, email, pass)
            .then((res) => {
                // حفظ بياناته في الداتابيز
                set(ref(db, 'users/' + res.user.uid), { email: email, role: "user" });
                alert("مبروك! الحساب اتعمل.");
            })
            .catch(err => alert("خطأ في التسجيل: " + err.message));
    };

    // زرار الدخول
    document.getElementById("login-btn").onclick = () => {
        const email = document.getElementById("email-input").value;
        const pass = document.getElementById("password-input").value;
        signInWithEmailAndPassword(auth, email, pass)
            .catch(err => alert("بيانات غلط: " + err.message));
    };

    // زرار الخروج
    document.getElementById("logout-btn").onclick = () => {
        signOut(auth);
    };

    // زرار إرسال الرسائل
    document.getElementById("send-btn").onclick = () => {
        const input = document.getElementById("message-input");
        if (input.value.trim() !== "" && auth.currentUser) {
            push(ref(db, "messages"), {
                senderId: auth.currentUser.uid,
                text: input.value,
                time: Date.now()
            });
            input.value = "";
        }
    };
});

// 4. استقبال الرسايل وعرضها
onChildAdded(ref(db, "messages"), (data) => {
    const chatBox = document.getElementById("chat-box");
    const msg = data.val();
    const div = document.createElement("div");
    div.innerText = msg.text;
    // تنسيق بسيط
    div.style.margin = "5px";
    div.style.padding = "5px";
    div.style.background = "#eee";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});
