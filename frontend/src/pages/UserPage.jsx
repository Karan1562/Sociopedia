import { Flex, Spinner, useStatStyles } from "@chakra-ui/react";
import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom.jsx";

export const UserPage = () => {
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const showToast = useShowToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log("data", data);
        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setLoading(false);
      }
    };
    const getPosts = async () => {
      setFetchingPosts(true);
      try {
        const res = await fetch(`api/posts/user/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
        }
        setPosts(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setFetchingPosts(false);
      }
    };
    getUser(); // Call the function here
    getPosts();
  }, [username, showToast, setPosts]);
  {
  }
  if (!user && loading) {
    return (
      <>
        <Flex justifyContent={"center"}>
          <Spinner size={"xl"} />
        </Flex>
      </>
    );
  }

  if (!user && !loading) {
    return <h1>User not Found</h1>;
  }

  return (
    <>
      <UserHeader user={user} />
      {!fetchingPosts && posts.length === 0 && <h1>User has no Posts</h1>}
      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"x1"} />
        </Flex>
      )}
      {posts.map((post) => (
        <Post key={post?._id} post={post} postedBy={post?.postedBy} />
      ))}
    </>
  );
};
