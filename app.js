// 안전한 파일 이름 생성 함수
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

// 메시지 받기 + 이미지 확대 이벤트 연결
db.ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `<strong>${msg.user}</strong>:<br>${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // ✅ 이미지가 있을 경우 클릭 이벤트 직접 연결
  const imgs = div.querySelectorAll("img");
  imgs.forEach((img) => {
  img.addEventListener("click", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = img.src;
    lightbox.style.display = "flex";
  });
});

// 파일 업로드 + 미리보기
let isUploading = false;

fileInput.addEventListener("change", async (e) => {
  if (isUploading) return;  // 동시에 두 번 실행 막기
  isUploading = true;

  const files = Array.from(e.target.files);
  if (files.length === 0) {
    isUploading = false;
    return;
  }

  const imageHTMLs = [];
  const imageLinks = [];

  for (const file of files) {
    const filePath = generateSafeFilePath(file);
    const { data, error } = await supabase
      .storage
      .from("chat-uploads")
      .upload(filePath, file);

    if (error) {
      alert(`❌ ${file.name} 업로드 실패: ${error.message}`);
      continue;
    }

    const { data: urlData } = supabase
      .storage
      .from("chat-uploads")
      .getPublicUrl(filePath);

    const url = urlData.publicUrl;
    const isImage = file.type.startsWith("image/");

    if (isImage) {
      imageHTMLs.push(`<img src="${url}" alt="${file.name}" class="chat-image" />`);
      imageLinks.push(`<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`);
    } else {
      db.ref("messages").push({
        user: "익명",
        text: `<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`,
        timestamp: Date.now()
      });
    }
  }

  if (imageHTMLs.length > 0) {
    const combinedHTML = `
      ${imageHTMLs.join(" ")}<br>
      ${imageLinks.join("<br>")}
    `;
    db.ref("messages").push({
      user: "익명",
      text: combinedHTML,
      timestamp: Date.now()
    });
  }

  fileInput.value = "";
  isUploading = false;
});

// Lightbox 닫기
document.getElementById("lightbox").addEventListener("click", function () {
  this.style.display = "none";
});

function logout() {
  alert("로그아웃 버튼 (구현 안됨)");
}
