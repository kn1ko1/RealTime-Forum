import { getCookie } from "./utils/utils.js"
import Auth from "./views/Auth.js"
import MainPage from "./views/MainPage.js"
import UserPage from "./views/UserPage.js"

const navigateTo = (url) => {
	history.pushState(null, null, url)
	router()
}

const router = async () => {
	const routes = [
		{ path: "/", view: Auth },
		{ path: "/main", view: MainPage },
		{ path: "/user", view: UserPage },
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

	const authView = new Auth()
	const mainView = new MainPage()
	const userView = new UserPage()

	if (match.route.view === Auth) {
		let userId = localStorage.getItem("id")
		let cookie = getCookie("browserCookie")
		let expirationTime = new Date(cookie)
		let currentTime = new Date()

		if (!cookie && !userId) {
			localStorage.clear()
			document.cookie =
  "browserCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
				document.body.innerHTML =
				await authView.renderHTML()
			authView.submitForm()
			return
		}
		if (currentTime > expirationTime || !userId) {
			localStorage.clear()
			document.cookie =
				"browserCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
				document.body.innerHTML =
				await authView.renderHTML()
			authView.submitForm()
		} else {
			window.location.pathname = "/main"
		}
	}

	if (match.route.view === MainPage) {
		let userInfo = localStorage.getItem("id")
		let cookie = getCookie("browserCookie")

		if (!cookie && !userInfo) {
			localStorage.clear()
			document.cookie =
				"browserCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
			window.location.href = "/"
			return
		}
		document.body.innerHTML = await mainView.renderHTML();
		mainView.attachPostSubmitForm()
		mainView.runStartWebsocket()
		mainView.displayUserContainer()
		mainView.displayPostContainer()
		mainView.displayChatContainer()
		mainView.Logout()
		mainView.reactions()
	}

	if (match.route.view === UserPage) {
		let userInfo = localStorage.getItem("id")

		if (!userInfo) {
			window.location.href = "/"
			return
		}
		document.body.innerHTML = await userView.renderHTML()
		userView.getAllPostsByUser()
		userView.getLikedPostsByUser()
		userView.Logout()
	}
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
