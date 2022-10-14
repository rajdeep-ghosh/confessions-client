import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AvatarGenerator } from "random-avatar-generator";
import ReactTimeAgo from "react-time-ago";
import ReactHashtag from "react-hashtag";
import { RWebShare } from "react-web-share";
import axios from "../api/base";
import { usePost } from "../hooks/usePost";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Comment from "../components/Comment";
import { CircularProgress } from "@mui/material";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
} from "@heroicons/react/24/solid";

export default function Post() {
  const generator = new AvatarGenerator();

  const { id } = useParams();
  const navigate = useNavigate();
  const { addPostLike, removePostLike, isPostLiked } = usePost();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [postLiked, setPostLiked] = useState({ liked: null, synced: null });

  useEffect(() => {
    async function getPost() {
      const [postResponse, commentResponse] = await Promise.all([
        axios.get(`/posts/${id}`).then((res) => res.data),
        axios.get(`/comments/${id}`).then((res) => res.data),
      ]);
      setPost(postResponse);
      setComments(commentResponse);
      const likedRes = isPostLiked(id);
      likedRes
        ? setPostLiked({ liked: likedRes.liked, synced: likedRes.synced })
        : setPostLiked({ liked: false, synced: null });
      setLoading(false);
    }
    getPost();
  }, [id, isPostLiked]);

  const handleClick = async () => {
    await axios
      .post("/comments", {
        comment: commentBody,
        postId: post.postId,
      })
      .then(() => {
        // handleAlertOpen({
        //   message: "Post created successfully!",
        //   severity: "success",
        // });
        console.log("commented");
        navigate(0);
      })
      .catch((err) => {
        // handleAlertOpen({
        //   message: "Something went wrong!",
        //   severity: "error",
        // });
        console.log(err);
      });
  };

  const handlePostLike = () => {
    if (postLiked.liked !== true) {
      addPostLike(post.postId);
      setPostLiked({ liked: true, synced: false });
    } else {
      removePostLike(post.postId);
      setPostLiked({ liked: false, synced: null });
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="h-[85vh] grid place-items-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <img
                  className="w-8 h-8"
                  width="2rem"
                  height="2rem"
                  src={generator.generateRandomAvatar(post.name)}
                  loading="lazy"
                  alt="avatar"
                />
                <h2 className="font-semibold text-base">{post?.name}</h2>
                <p className="font-bold text-gray-300">·</p>
                <p className="text-gray-400/70">
                  <ReactTimeAgo
                    date={new Date(post.createdAt).getTime()}
                    locale="en-IN"
                    timeStyle="mini-minute-now"
                  />
                </p>
              </div>
              <EllipsisHorizontalIcon className="w-6 text-gray-500" />
            </div>
            <p className="text-gray-600 text-xl whitespace-pre-line break-words">
              <ReactHashtag
                renderHashtag={(hashtagValue) => (
                  <span className="text-blue-500">{hashtagValue}</span>
                )}
              >
                {post.postBody}
              </ReactHashtag>
            </p>
          </div>
          <div className="px-6 pt-3 pb-4 flex justify-between items-center">
            <div
              className="flex items-center space-x-2 cursor-pointer hover:text-blue-500"
              onClick={handlePostLike}
            >
              {postLiked.liked ? (
                <HandThumbUpSolidIcon className="w-5 text-blue-500" />
              ) : (
                <HandThumbUpIcon className="w-5" />
              )}
              <span className="select-none">
                {postLiked.synced === false ? post.likes + 1 : post.likes}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <HandThumbDownIcon
                className="w-5 cursor-pointer"
                // onClick={decrement}
              />
              <span className="select-none">{post.dislikes}</span>
            </div>
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 cursor-pointer" />
            <RWebShare
              data={{
                text: `Share - Confessions | ${post.name}`,
                url: `/posts/${post.postId}`,
                title: "Confessions",
              }}
              onClick={() => console.log("shared successfully!")}
            >
              <ShareIcon className="w-5 cursor-pointer" />
            </RWebShare>
          </div>
          <div className="p-3 mb-2 space-y-4">
            <Input
              value={commentBody}
              onChange={setCommentBody}
              onClick={handleClick}
              label="Comment"
              placeholder="Add your comment..."
              rows={3}
            />
          </div>
          <div
            data-before-content="All Comments"
            className="p-6 flex flex-col space-y-3 divide-y-2 before:content-[attr(data-before-content)] before:text-lg before:font-semibold before:mb-2 before:pb-2 before:border-b-2 before:border-gray-300"
          >
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment.comment}
                  name={comment.name}
                  createdAt={comment.createdAt}
                />
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center space-y-4">
                <ChatBubbleLeftRightIcon className="w-8 text-red-400" />
                <p className="font-[500] text-gray-700">No Comments Yet!</p>
                <p className="text-gray-600">
                  Be the first to share what you think!
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
