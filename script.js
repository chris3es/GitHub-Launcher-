// Load profiles from localStorage or start empty
let profiles = JSON.parse(localStorage.getItem("profiles")) || [];

// Populate dropdown
const profileSelect = document.getElementById("profileSelect");
function refreshProfiles() {
  profileSelect.innerHTML = "";
  profiles.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile;
    option.textContent = profile;
    profileSelect.appendChild(option);
  });
}
refreshProfiles();

// Add new profile dynamically
document.getElementById("addProfileBtn").addEventListener("click", () => {
  const newProfile = prompt("Enter new profile name:");
  if (newProfile && !profiles.includes(newProfile)) {
    profiles.push(newProfile);   // auto adds to array
    localStorage.setItem("profiles", JSON.stringify(profiles)); // save permanently
    refreshProfiles();           // refresh dropdown
    profileSelect.value = newProfile; // select new profile
  }
});

// Launch button logic
document.getElementById("launchBtn").addEventListener("click", () => {
  const version = document.getElementById("versionSelect").value;
  const profile = profileSelect.value;

  alert("Launching " + version + " with profile " + profile);
  window.location.href = version;
});
