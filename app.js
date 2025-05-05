fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

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
      // 이미지가 아닌 파일은 개별 전송
      db.ref("messages").push({
        user: "익명",
        text: `<a href="${url}" download="${file.name}">[${file.name} 다운로드]</a>`,
        timestamp: Date.now()
      });
    }
  }

  // 이미지가 있다면 묶어서 한 메시지로 전송
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
});
