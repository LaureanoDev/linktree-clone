import { useState } from "react";
import supabase from "../../utils/supabaseClient";

export default function SignUp() {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [username, setUsername] = useState<string | undefined>();

  async function signUpWithEmail() {
    try {
      if (email && password) {
        const resp = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        if (resp.error) throw resp.error;
        const userId = resp.data.user?.id;
        if (userId) {
          await createUser(userId);
          console.log("userId: ", userId);
        }
      }
    } catch (error) {}
  }

  async function createUser(userId: string) {
    try {
      const { error } = await supabase
        .from("users")
        .insert({ id: userId, username: username });
      if (error) throw error;
    } catch (error) {
      console.log("error: ", error);
    }
  }

  return (
    <div className="flex flex-col w-full justify-center items-center mt-4">
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        Email
      </label>
      <div className="mt-1">
        <input
          type="email"
          name="email"
          id="email"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col w-full justify-center items-center">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mt-4"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            name="password"
            id="password"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <label
        htmlFor="username"
        className="block text-sm font-medium text-gray-700 mt-4"
      >
        username
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="username"
          id="username"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="inline-flex items-center rounded border-transparent bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm mt-4 hover:bg-indigo-500"
        onClick={signUpWithEmail}
      >
        Sign Up
      </button>
    </div>
  );
}
