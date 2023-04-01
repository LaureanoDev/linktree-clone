import { useEffect, useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import Image from "next/image";
import supabase from "../../utils/supabaseClient";

type Link = {
  title: string;
  url: string;
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [links, setLinks] = useState<Link[]>();
  const [images, setImages] = useState<ImageListType>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<
    string | undefined
  >();

  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
  };

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

  useEffect(() => {
    const getLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("links")
          .select("title, url")
          .eq("user_id", userId);

        if (error) throw error;
        setLinks(data);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    if (userId) {
      getLinks();
    }
  }, [userId]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("profile_picture_url")
          .eq("id", userId);
        if (error) throw error;
        const profilePictureUrl = data[0]["profile_picture_url"];
        setProfilePictureUrl(profilePictureUrl);
      } catch (error) {
        console.log("error: ", error);
      }
    };
    if (userId) {
      getUser();
    }
  }, [userId]);

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

  const uploadProfilePicture = async () => {
    try {
      if (images.length > 0) {
        const image = images[0];
        if (image.file && userId) {
          const { data, error } = await supabase.storage
            .from("public")
            .upload(`${userId}/${image.file.name}`, image.file, {
              upsert: true,
            });
          if (error) throw error;
          const resp = supabase.storage.from("public").getPublicUrl(data.path);
          const publicUrl = resp.data.publicUrl;
          const updateUserResponse = await supabase
            .from("users")
            .update({ profile_picture_url: publicUrl })
            .eq("id", userId);
          if (updateUserResponse.error) throw error;
        }
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center mt-4">
      {profilePictureUrl && (
        <Image
          src={profilePictureUrl}
          alt="profile-picture"
          height={100}
          width={100}
          className="rounded-full"
        />
      )}
      {links?.map((link: Link, index: number) => (
        <div
          className="shadow-xl w-96 bg-indigo-500 mt-4 p-4 rounded-lg text-center text-white cursor-pointer"
          key={index}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = link.url;
          }}
        >
          {link.title}
        </div>
      ))}
      {isAuthenticated && (
        <>
          <div className="mt-4">
            <h1>New link creation</h1>
            <div className="mt-4">
              <div className="block text-sm font-medium text-gray-700">
                Title
              </div>
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
          </div>
          <div>
            <h1> Image uploading</h1>

            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              maxNumber={1}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                // write your building UI
                <div className="upload__image-wrapper bg-slate-300 rounded-lg flex   justify-center items-center p-4 flex-col">
                  {images.length === 0 ? (
                    <button
                      className="w-3/4 underline"
                      style={isDragging ? { color: "red" } : undefined}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      Click to upload a new image or drag and drop a new image
                      here
                    </button>
                  ) : (
                    <button onClick={onImageRemoveAll} className="underline">
                      Remove all images
                    </button>
                  )}
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <Image
                        src={images[0]["data_url"]}
                        height={100}
                        width={100}
                        alt="profile picture"
                      />
                      <div className="image-item__btn-wrapper">
                        <button
                          onClick={uploadProfilePicture}
                          className="underline"
                        >
                          Upload profile picture
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          </div>
        </>
      )}
    </div>
  );
}
