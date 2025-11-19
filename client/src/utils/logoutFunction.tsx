export async function handleLogout() {
  try {
    

  
      //  Logout success — clear user data
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Optionally redirect to login
      window.location.href = "/";
   
    
  } catch (error) {
    console.error("Logout error:", error);
  }
}
