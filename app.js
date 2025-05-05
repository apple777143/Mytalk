// Firebase 연결 (채팅용)
const firebaseConfig = {
  apiKey: "AIzaSyBCQJTyfFpW_Ud3b76X7snmHwpgZS4T9I",
  authDomain: "mytalk-65d69.firebaseapp.com",
  databaseURL: "https://mytalk-65d69-default-rtdb.firebaseio.com",
  projectId: "mytalk-65d69",
  storageBucket: "mytalk-65d69.appspot.com",
  messagingSenderId: "366332819668",
  appId: "1:366332819668:web:76f324fbc7cf57c89ca341"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");

// Supabase 연결
const supabase = window.supabase.createClient(
  "https://gwrkyiqylqkxdrlxlfma.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cmt5aXF5bHFreGRybHhsZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzk4MzksImV4cCI6MjA2MjAxNTgzOX0.ejalmvYcU4ZT-Yw4EYQlbEUP3N7Noxh7_OwATv0R0AM"
);

// 메시지 보내기
function sendMessage() {
  const text = messageInput.value;
  if (text) {
    db.ref("messages").push({
      user: "익명",
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
}

// 메시지 받기
db.ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `<strong>${msg.user}</strong>: ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// 파일 업로드
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("chat-uploads").upload(filePath, file);

  if (error) {
    alert("파일 업로드 실패: " + error.message);
    return;
  }

  const { data: urlData } = supabase.storage.from("chat-uploads").getPublicUrl(filePath);
  const url = urlData.publicUrl;

  db.ref("messages").push({
    user: "익명",
    text: `<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`,
    timestamp: Date.now()
  });
});

function logout() {
  alert("로그아웃 버튼 (구현 안됨)");
}