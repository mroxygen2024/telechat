import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { authApi } from "../api/authApi";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    clearAuthError();

    try {
      const response = await authApi.login(username, password);
      login(response.user, response.token);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || authError || "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to TeleChat
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Use <span className="font-bold">Abush / password123</span> to enter
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          New here?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={displayError}
            />

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Secure End-to-End Encryption
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
