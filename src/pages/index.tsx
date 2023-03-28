import { useEffect, useState } from "react";
import supabase from "../../utils/supabaseClient";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user", user);
      if (user) {
        const userId = user.data.user?.id;
        setIsAuthenticated(true);
        setUserId(userId);
      }
    };
    getUser();
  }, []);

  const addNewLink = async () => {
    try {
      if (title && url && userId) {
        const { data, error } = await supabase
          .from("links")
          .insert({
            title: title,
            url: url,
            user_id: userId,
          })
          .select();
        if (error) throw error;
        console.log("data: ", data);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center mt-4">
      {isAuthenticated && (
        <>
          <div className="mt-4">
            <div className="block text-sm font-medium text-gray-700">Title</div>
            <input
              type="text"
              name="title"
              id="title"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="my awesome link"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <div className="block text-sm font-medium text-gray-700">URL</div>
            <input
              type="text"
              name="url"
              id="url"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              placeholder="https://www.linkedin.com/in/laureano-perezlindodev/"
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded border-transparent bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm mt-4 hover:bg-indigo-500"
            onClick={addNewLink}
          >
            Add new link
          </button>
        </>
      )}
    </div>
  );
}
