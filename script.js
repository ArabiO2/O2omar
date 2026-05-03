import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. إعدادات فايربيز (الخاصة بك)
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
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// 2. إعدادات الهوية والأدمن
 //localStorage.setItem("adminKey", "omar_admin_77"); // فعل السطر ده مرة واحدة لو عايز تبقى أدمن

const isAdmin = localStorage.getItem("adminKey") === "omar_admin_77";

if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", "user_" + Math.random().toString(36).substr(2, 9));
}
const myId = localStorage.getItem("userId");

// 3. وظيفة إرسال الرسائل
window.sendMessage = function() {
  const input = document.getElementById("message-input");
  if (input.value.trim() !== "") {
    push(messagesRef, {
      senderId: myId,
      text: input.value,
      time: Date.now(),
      role: isAdmin ? "Admin 👑" : "User 👤" 
    });
    input.value = "";
  }
};

// ربط زر الإرسال بالدالة
const sendBtn = document.getElementById("send-btn");
if(sendBtn) sendBtn.onclick = sendMessage;

// 4. عرض الرسائل واستقبالها
onChildAdded(messagesRef, (data) => {
  const chatBox = document.getElementById("chat-box");
  const msgData = data.val();
  const msgId = data.key;

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.id = msgId;

  // تحديد الاتجاه: يمين (أنا) | شمال (غيري)
  if (msgData.senderId === myId) {
      msgDiv.classList.add("my-message");
  } else {
      msgDiv.classList.add("others-message");
  }

  // تحويل الوقت لصيغة مقروءة
  const dateObj = new Date(msgData.time || Date.now());
  const timeString = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const dateString = dateObj.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });

  // إعدادات الأدمن (زر الحذف)
  let deleteBtn = "";
  if (isAdmin) {
      deleteBtn = `<button class="delete-btn" onclick="deleteMessage('${msgId}')" style="margin-right:10px; color:red; border:none; background:none; cursor:pointer; font-weight:bold; font-size: 11px;">[مسح]</button>`;
  }

  // لون مخصص لاسم الراسل
  const roleColor = msgData.role && msgData.role.includes("Admin") ? "#ff9800" : "#ffffff";

  // بناء هيكل الرسالة (بدون خطوط غريبة وبأفضل تنسيق)
  msgDiv.innerHTML = `
      <div style="font-size: 11px; font-weight: bold; color: ${roleColor}; margin-bottom: 4px; font-family: inherit;">
          ${msgData.role || "User 👤"}
      </div>
      
      <div style="font-size: 15px; margin-bottom: 6px; word-wrap: break-word; font-family: inherit; line-height: 1.4;">
          ${msgData.text}
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color:white ; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 4px; font-family: inherit;">
          <span>${timeString} - ${dateString}</span>
          ${deleteBtn}
      </div>
  `;

  chatBox.appendChild(msgDiv);

  // النزول لآخر الصفحة تلقائياً بعد إضافة الرسالة
  window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
  });
});

// 5. مراقبة حذف الرسائل من السيرفر
onChildRemoved(messagesRef, (data) => {
  const element = document.getElementById(data.key);
  if (element) {
      element.remove();
  }
});

// 6. وظيفة الحذف (متاحة للأدمن)
window.deleteMessage = function(id) {
  if (confirm("هل تريد مسح هذه الرسالة نهائياً؟")) {
      remove(ref(db, "messages/" + id));
  }
};
