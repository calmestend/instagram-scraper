import { gotScraping } from 'got-scraping';
import * as fs from "fs";
import * as cheerio from "cheerio";

const username = process.argv[2];

if (!username) {
    console.error("Username not found");
    process.exit(1);
}

const getAppId = async (username) => {
	try {
		const res = await gotScraping({
			url: `https://www.instagram.com/${username}/`,
		})
		const $  = cheerio.load(res.body);
		const script = $('script:contains("CurrentUserInitialData")').html();
		const jsonString = script.match(/{.*}/)?.[0];
		const json = JSON.parse(jsonString);
		const jsonRequireData = json.require[0][3][0].__bbox.define;
		const jsonCurrentUserInitialData = jsonRequireData.find(item => item[0] === "CurrentUserInitialData")
		return jsonCurrentUserInitialData[2].APP_ID;
	} catch (error) {
		console.error({message: error.message})
	}
}

const getProfileData = async (username) => {
	try {
		const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
			headers: {
				"accept": "*/*",
				"priority": "u=1, i",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-ig-app-id": await getAppId(username),
				"x-ig-www-claim": "0",
				"x-requested-with": "XMLHttpRequest",
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			body: null,
			method: "GET"
		});
		const json = await res.json();
		fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
	} catch (error) {
		console.error({message: error.message})
	}
}

(async () => {
	await getProfileData(username);
	console.log("Profile scraped successfully c:")
})()
