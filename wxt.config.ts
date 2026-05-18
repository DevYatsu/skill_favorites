import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-solid"],
	manifest: {
		name: "skills.sh Favorites Manager",
		description:
			"Add a local favorites list and starring capability to skills.sh.",
		permissions: ["storage"],
		host_permissions: ["*://*.skills.sh/*"],
		browser_specific_settings: {
			gecko: {
				id: "skills-favorites@devyatsu.com",
			},
		},
		icons: {
			"16": "/icon/16.png",
			"32": "/icon/32.png",
			"48": "/icon/48.png",
			"96": "/icon/96.png",
			"128": "/icon/128.png",
		},
		action: {
			default_icon: {
				"16": "/icon/16.png",
				"32": "/icon/32.png",
				"48": "/icon/48.png",
				"96": "/icon/96.png",
				"128": "/icon/128.png",
			},
		},
	},
	suppressWarnings: {
		firefoxDataCollection: true,
	},
});
