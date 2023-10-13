import Auth from "./views/Auth.js"
import MainPage from "./views/MainPage.js"
import Chat from "./views/Chat.js"
import { getCookie } from "./utils/utils.js"

const navigateTo = (url) => {
	history.pushState(null, null, url)
	router()
}

const router = async () => {
	const routes = [
		{ path: "/", view: Auth },
		{ path: "/main", view: MainPage },
		{ path: "/chat", view: Chat },
	]

	// test each route for potential match
	const potentialMatches = routes.map((route) => {
		return {
			route: route,
			isMatch: location.pathname === route.path,
		}
	})

	let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch)

	if (!match) {
		match = {
			route: routes[0],
			isMatch: true,
		}
	}

	const view = new match.route.view()

	document.querySelector("#container").innerHTML = await view.renderHTML()

	if (match.route.view === Auth) {
		document.querySelector("#container").innerHTML = await view.renderHTML()
		const authView = new Auth()
		authView.submitForm()
	}

	// Call the submitForm and displayPosts method here
	if (match.route.view === MainPage) {
		let cookie = getCookie("sessionID")
		if (!cookie) {
			window.location.href = "/"
		} else {
			document.querySelector("#container").innerHTML = await view.renderHTML()
		}
		const mainView = new MainPage()
		mainView.displayUserContainer()
		mainView.displayPostContainer()
		mainView.attachPostSubmitForm()
		mainView.Logout()
		mainView.reactions()
	}

	if (match.route.view === Chat) {
		const chatView = new Chat()
		chatView.getUserIDFromURL()
		chatView.webSocketStuff()
	}

	console.log("match:", view)
}

window.addEventListener("popstate", router)

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (event) => {
		if (event.target.matches("[data-link]")) {
			event.preventDefault()
			navigateTo(event.target.href)
		}
	})
	router()
})
