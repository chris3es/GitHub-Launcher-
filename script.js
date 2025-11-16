document.getElementById("launchBtn").addEventListener("click", () => {
  const version = document.getElementById("versionSelect").value;
  const profile = document.getElementById("profileSelect").value;

  alert("Launching " + version + " with profile " + profile);
  window.location.href = version;
});
