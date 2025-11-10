import React from "react";
import axios from "axios-typescript";

const Login: React.FC = () => {
  const loginGoogle = React.useCallback(async () => {
    const response = await axios.get("http://localhost:4000/google-auth");
    if (response.data) {
      const result = JSON.parse(response.data);
      window.location.href = result.url;
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <button
        onClick={loginGoogle}
        className="flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-md border border-gray-300 hover:shadow-lg hover:scale-105 transition-transform duration-200"
      >
        <img
          src="/google.svg"
          alt="Google"
          className="w-6 h-6"
        />
        <span className="text-gray-700 font-medium">Se connecter avec Google</span>
      </button>
    </div>
  );
};

export default Login;