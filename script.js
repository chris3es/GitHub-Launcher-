document.getElementById("launchBtn").addEventListener("click", () => {
  const version = document.getElementById("versionSelect").value;
  const profile = document.getElementById("profileSelect").value;

  // For now, just launch the version and show profile in console
  console.log("Launching " + version + " with profile " + profile);
  window.location.href = version;
});
