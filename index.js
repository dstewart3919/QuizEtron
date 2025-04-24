function goToCategory() {
  const category = document.getElementById('categorySelect').value;
  if (!category) {
    alert("Please choose a category.");
    return;
  }
  window.location.href = `test-loader.html?genre=${encodeURIComponent(category)}`;
}
