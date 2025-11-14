export async function handleLogout() {
  try {
    const response = await fetch("http://localhost:8090/kamakfund/rest/kamak/logout", {
      method: "POST",
      credentials: "include", //  include cookies/session info
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === 1) {
      //  Logout success — clear user data
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Optionally redirect to login
      window.location.href = "/";
    } else {
      console.warn(data.message || "Logout failed.");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}
