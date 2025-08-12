function register() {
  const regNo = document.getElementById("regNo").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("role").value;
  const users = JSON.parse(localStorage.getItem("campuspulse_users")) || [];
  users.push({ regNo, name, email, password, role });
  localStorage.setItem("campuspulse_users", JSON.stringify(users));
  console.log("Registered:", { regNo, name, email, role });
  alert("Registration successful!");
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const users = JSON.parse(localStorage.getItem("campuspulse_users")) || [];
  const found = users.find((u) => u.email === email && u.password === password);
  if (found) {
    console.log("Login success for:", found);
    alert("Login success!");
  } else {
    console.log("Login failed");
    alert("Invalid email or password");
  }
}
