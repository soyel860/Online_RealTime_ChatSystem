const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const nameInput = document.getElementById('nameInput');
const ageCheckbox = document.getElementById('ageCheckbox');
const continueBtn = document.getElementById('continueBtn');

avatarInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        while (compressedDataUrl.length > 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        avatarPreview.innerHTML = '';
        const previewImg = document.createElement('img');
        previewImg.src = compressedDataUrl;
        avatarPreview.appendChild(previewImg);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function validateForm() {
  const nameValid = nameInput.value.trim().length > 0;
  const ageValid = ageCheckbox.checked;
  continueBtn.disabled = !(nameValid && ageValid);
}

nameInput.addEventListener('input', validateForm);
ageCheckbox.addEventListener('change', validateForm);

function redirectToHome() {
  const name = nameInput.value.trim();
  const ageConfirmed = ageCheckbox.checked;
  if (!name || !ageConfirmed) {
    if (!name) {
      nameInput.style.animation = 'shake 0.5s';
      nameInput.focus();
      setTimeout(() => { nameInput.style.animation = ''; }, 500);
    }
    if (!ageConfirmed) alert("Please confirm you are 13 years old or above");
    return;
  }
  fetch('/set-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    localStorage.setItem("userName", name);
    const imgTag = avatarPreview.querySelector('img');
    if (imgTag && imgTag.src) {
      localStorage.setItem("profileImage", imgTag.src);
    } else {
      localStorage.removeItem("profileImage");
    }
    window.location.href = "/home";
  })
  .catch(() => {
    alert("Failed to set session. Please try again.");
  });
}

nameInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') redirectToHome();
});

document.addEventListener('DOMContentLoaded', function () {
  const bubblesContainer = document.getElementById('bubbles');
  const bubbleCount = 20;
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 80 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    const duration = Math.random() * 1 + 10;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    bubblesContainer.appendChild(bubble);
  }
});

