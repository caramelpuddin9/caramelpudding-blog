import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在 src/content/spec/friends.mdx 中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "友链",
	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "这里是一些有趣的网站和朋友们的主页，欢迎交换友链~",
	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,
	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: false,
	// 是否开启随机排序配置
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
		siteurl: "https://astro.build",
		tags: ["Framework"],
		weight: 10,
		enabled: true,
	},
	{
		title: "Firefly 主题",
		imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
		desc: "Firefly - 清新美观的 Astro 静态博客主题模板",
		siteurl: "https://github.com/CuteLeaf/Firefly",
		tags: ["Theme", "Blog"],
		weight: 9,
		enabled: true,
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
