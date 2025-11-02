const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");
const uploadInput = document.getElementById("uploadInput");
const beforeImage = document.getElementById("beforeImage");
const afterImage = document.getElementById("afterImage");

let upscaledURL = null;

// 🟡 যখন ইউজার ফাইল সিলেক্ট করবে
uploadInput.addEventListener("change", () => {
  const file = uploadInput.files[0];
  if (file) {
    beforeImage.src = URL.createObjectURL(file);
    beforeImage.style.display = "block";
  }
});

// 🟢 "Process Image" বাটন চাপলে
processBtn.addEventListener("click", async () => {
  const file = uploadInput.files[0];
  if (!file) return alert("Please upload an image first!");

  processBtn.innerText = "Processing...";
  processBtn.disabled = true;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/upscale", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    upscaledURL = url;
    afterImage.src = url;
    afterImage.style.display = "block";
    downloadBtn.style.display = "inline-block";
  } catch (error) {
    alert("Something went wrong! Please try again.");
  }

  processBtn.innerText = "Process Image";
  processBtn.disabled = false;
});

// 🔽 "Download" বাটন
downloadBtn.addEventListener("click", () => {
  if (!upscaledURL) return;
  const a = document.createElement("a");
  a.href = upscaledURL;
  a.download = "upscaled-image.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});