// 안전한 파일 이름 생성 함수 (한글/특수문자 제거 + 인코딩)
function generateSafeFilePath(file) {
  const safeFileName = encodeURIComponent(
    file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "")
  );
  return `${Date.now()}_${safeFileName}`;
}

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

// 파일 업로드 + 미리보기 기능
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const filePath = generateSafeFilePath(file);
  const { data, error } = await supabase.storage.from("chat-uploads").upload(filePath, file);

  if (error) {
    alert("파일 업로드 실패: " + error.message);
    return;
  }

  const { data: urlData } = supabase.storage.from("chat-uploads").getPublicUrl(filePath);
  const url = urlData.publicUrl;
  const isImage = file.type.startsWith("image/");

  const previewHTML = isImage
    ? `<img src="${url}" alt="${file.name}" style="max-width: 200px; border-radius: 8px; margin-top: 5px;" /><br><a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`
    : `<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`;

  db.ref("messages").push({
    user: "익명",
    text: previewHTML,
    timestamp: Date.now()
  });
});

function logout() {
  alert("로그아웃 버튼 (구현 안됨)");
}
