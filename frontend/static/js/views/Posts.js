import AbstractView from "./AbstractView.js";
import Nav from "./Nav.js";
import { handleReactions } from "../utils/reactions.js";
import { fetchComments, attachCommentForm, attachCommentsToPost } from "./Comments.js";

export default class Posts extends AbstractView {
	constructor() {
		super();
		this.setTitle("Posts");
	}

	async getHTML() {
		const nav = new Nav(); // Create an instance of the Nav class
		const navHTML = await nav.getHTML(); // Get the HTML content for the navigation
		const postForm = postFormHTML()
		return `
      ${navHTML}
	  ${postForm}
      <div class="contentContainer">
        <div id="leftContainer" class="contentContainer-left">left container</div>
        <div id="postContainer" class="contentContainer-post"></div>
        <div id="rightContainer" class="contentContainer-right">right container, probably chat</div>
      </div>
    `;
	}

	// The event listener for the post form
	async postSubmitForm() {
		const postForm = document.getElementById("post-form");

		postForm.addEventListener(
			"submit",
			async function (event) {
				event.preventDefault();
				const postText = document.getElementById("postText").value;
				const categories = document.getElementById("categories").value;
				const image = document.getElementById("image").value;
				console.log("submitted post:", postText, categories, image);

				try {
					const response = await fetch("http://localhost:8080/posts", {
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							body: postText,
							categories: categories,
							img: image,
						}),
					});

					if (response.ok) {
						document.getElementById("postText").value = "";
						document.getElementById("categories").value = "";
						document.getElementById("image").value = "";
						// reloads the posts
						await this.displayCompletePosts();
					}
				} catch (error) {
					console.log(error);
				}
			}.bind(this)
		);
	}

	// Gets and displays posts; attaches a comments form to the bottom of each
	async displayCompletePosts() {
		let html = `
      <div>
        <div id="postContainer"></div>
      </div>
    `;

		container.innerHTML += html;

		const response = await fetch("http://localhost:8080/posts");
		const postContainer = document.getElementById("postContainer");
		postContainer.innerHTML = "";

		const posts = await response.json();

		for (const post of posts) {
			let postElement = document.createElement("div");
			postElement.id = "Post" + post.id;
			postElement.classList.add("post");

			postElement.innerHTML = `
			<ul>
			  <li><b>Id:</b> ${post.id}</li>
			  <li><b>Username:</b> ${post.username}</li>
			  <li><b>Img:</b> ${post.img}</li>
			  <li><b>Body:</b> ${post.body}</li>
			  <li><b>Categories:</b> ${post.categories}</li>
			  <li><b>Reaction:</b> ${post.reactionID}</li>
			  <li>
			  <button class="reaction-button" reaction-type="POSTREACTIONS" reaction-parent-id="${post.id}" reaction-action="like" reaction-id = ${post.reactionID}">👍</button>
			  <button class="reaction-button" reaction-type="POSTREACTIONS" reaction-parent-id="${post.id}" reaction-action="dislike" reaction-id = ${post.reactionID}">👎</button>
			  </li>
			</ul>
		  `;

			// attaches the comment form to the bottom of each post
			attachCommentForm(post, postElement)

			// fetch comments, if any, for this post
			let comments = await fetchComments(post.id); // Wait for the comments to be fetched
			// shows comments underneath post, if it has any to show
			// currently very inefficient, needs reworked
			if (comments.length > 0) {
				let postComments = attachCommentsToPost(comments)
				postElement.appendChild(postComments);
			}

			postContainer.appendChild(postElement);
		}


	}

	// Adds reactions to db
	async reactions() {
		handleReactions();
	}
}

function postFormHTML() {

	return `<div class="post-form">
        <form id="post-form" method="POST">
          <p>Kindly fill in this form to post.</p>
          <div class="input-row">
            <div class="input-field">
              <label for="postText"><b>Post</b></label>
              <input
                type="text"
                placeholder="Enter Message"
                name="postText"
                id="postText"
                required
              />
            </div>
            <div class="input-field">
              <label for="categories"><b>Categories</b></label>
              <input
                type="text"
                placeholder="Enter Categories"
                name="categories"
                id="categories"
                required
              />
            </div>
            <div class="input-field">
              <label for="image"><b>Image</b></label>
              <input
                type="text"
                placeholder="Enter Image String"
                name="image"
                id="image"
                required
              />
            </div>
          </div>
          <button class="btn" id="submit">Submit Post</button>
        </form>
      </div>`
}