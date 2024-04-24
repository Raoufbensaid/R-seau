import axios from "axios";

// posts
export const GET_POSTS = "GET_POSTS";
export const LIKE_POSTS = "LIKE_POSTS";
export const UNLIKE_POSTS = "UNLIKE_POSTS";

export const getPosts = (num) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/post/`)
      .then((res) => {
        const array = res.data.slice(0, num);
        dispatch({ type: GET_POSTS, payload: array });
      })
      .catch((error) => console.log(error));
  };
};

export const likePost = (postId, userId) => {
  return (dispatch) => {
    return axios({
      method: "patch",
      url: `${process.env.REACT_APP_API_URL}api/post/like-post/` + postId,
      data: { id: userId },
    })
      .then((res) => {
        dispatch({ type: LIKE_POSTS, payload: { postId, userId } });
      })
      .catch((error) => console.log(error));
  };
};

export const unlikePost = (postId, userId) => {
  return (dispatch) => {
    return axios({
      method: "patch",
      url: `${process.env.REACT_APP_API_URL}api/post/unlike-post/` + postId,
      data: { id: userId },
    })
      .then((res) => {
        dispatch({ type: UNLIKE_POSTS, payload: { postId, userId } });
      })
      .catch((error) => console.log(error));
  };
};
