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
const storage = firebase.storage();

const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const fileInput = document.getElementById("fileInput");

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

db.ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `<strong>${msg.user}</strong>: ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const storageRef = storage.ref("uploads/" + file.name);

  storageRef.put(file).then(() => {
    storageRef.getDownloadURL().then((url) => {
      db.ref("messages").push({
        user: "익명",
        text: `<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`,
        timestamp: Date.now()
      });
    });
  });
});

function logout() {
  alert("이건 데모입니다. 인증은 아직 안 넣었어요.");
}
