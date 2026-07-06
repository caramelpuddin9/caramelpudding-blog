import type { SiteConfig } from "@/types/siteConfig";

// 定义站点语言
// 语言代码，例如：'zh_CN', 'zh_TW', 'en', 'ja', 'ru'。
const SITE_LANG = "zh_CN";

export const siteConfig: SiteConfig = {
	// 站点标题
	title: "caramelpudding blog 🍮",

	// 站点副标题
	subtitle: "あの儚く散る花火の下で 馬鹿みたいに永遠を誓った",

	// 站点 URL（部署后请修改为你的实际域名）
	site_url: "https://caramelpudding-blog.xyz",

	// 站点描述
	description:
		"caramelpudding blog — 一个记录技术、生活与ACG文化的个人博客。分享Docker、Linux、编程开发以及二次元世界的美好。",

	// 站点关键词
	keywords: [
		"caramelpudding",
		"博客",
		"技术",
		"Docker",
		"Linux",
		"编程",
		"ACG",
		"二次元",
	],

	// 主题色
	themeColor: {
		// 主题色的默认色相，范围从 0 到 360。例如：红色：0，青色：200，蓝绿色：250，粉色：345
		hue: 250,
		// 是否对访问者隐藏主题色选择器
		fixed: false,
		// 默认模式："light" 亮色，"dark" 暗色，"system" 跟随系统
		defaultMode: "system",
	},

	// 页面整体宽度（单位：rem）
	// 数值越大可以让页面内容区域更宽
	// 在使用单侧栏边栏时，建议调低一些宽度以获得更好的视觉效果。
	pageWidth: 100,

	// 网站Card样式配置
	card: {
		// 是否开启卡片边框和阴影，开启后让网站更有立体感
		border: true,
		// 是否让卡片风格跟随主题色相
		followTheme: true,
	},

	// Favicon 配置
	favicon: [
		{
			// 图标文件路径
			src: "/favicon/favicon.ico",
			// 可选，指定主题 'light' | 'dark'
			// theme: "light",
			// 可选，图标大小
			// sizes: "32x32",
		},
	],

	// 导航栏配置
	navbar: {
		// 导航栏Logo
		// 支持三种类型：
		// 1. Astro图标库: { type: "icon", value: "material-symbols:home-pin-outline" }
		// 2. 本地图片（public目录，不优化）: { type: "image", value: "/assets/images/logo.webp", alt: "Logo" }
		// 3. 本地图片（src目录，自动优化但会增加构建时间）: { type: "image", value: "assets/images/logo.webp", alt: "Logo" }
		// 4. 网络图片: { type: "url", value: "https://example.com/logo.png", alt: "Logo" }
		logo: {
			type: "image",
			value: "assets/images/avatar.jpg",
			alt: "caramelpudding",
		},
		// 导航栏标题
		title: "caramelpudding",
		// 全宽导航栏，导航栏是否占满屏幕宽度
		widthFull: false,
		// 导航菜单对齐方式，left：左对齐，center：居中
		menuAlign: "center",
		// 导航栏图标和标题是否跟随主题色
		followTheme: false,
		// 导航栏是否固定在顶部并始终可见
		stickyNavbar: true,
	},

	// 站点开始日期，用于统计运行天数
	siteStartDate: "2026-01-01",

	// 站点时区（IANA 时区字符串），用于格式化bangumi、rss里的构建日期时间等等..
	// 示例："Asia/Shanghai", "UTC", 如果为空，则按照构建服务器的时区进行时区转换
	timezone: "Asia/Shanghai",

	// 页面开关配置 - 控制特定页面的访问权限，设为false会返回404并自动隐藏对应的导航栏菜单项
	pages: {
		// 友链页面开关
		friends: true,
		// 打赏页面开关
		sponsor: false,
		// 留言板页面开关，需要配置评论系统
		guestbook: false,
		// 番组计划页面开关，含追番、游戏、书籍和音乐
		bangumi: false,
		// 相册页面开关
		gallery: false,
		// 追番页面开关
		anime: false,
	},

	// 分类导航栏开关，在首页和归档页顶部显示分类快捷导航
	categoryBar: true,

	// 归档页是否折叠非最新年份文章，禁用后默认展开全部年份
	foldArticle: true,

	// 文章列表布局配置
	postListLayout: {
		// 默认布局模式："list" 列表模式（单列布局），"grid" 网格模式（多列布局）
		defaultMode: "list",
		// 移动端默认布局模式，不设置则跟随 defaultMode
		mobileDefaultMode: "list",
		// 是否在文章列表中显示标签
		showTags: true,
		// 文章简介显示行数，设为 0 则不截断
		descriptionLines: 3,
		// 是否允许用户切换布局
		allowSwitch: true,
		// 网格布局配置，仅在 defaultMode 为 "grid" 或允许切换布局时生效
		grid: {
			// 是否开启瀑布流布局，同时有封面图和无封面图的混合文章推荐开启
			masonry: false,
			// 网格模式卡片最小宽度(px)，浏览器根据容器宽度自动计算列数
			columnWidth: 320,
		},
	},

	// 文章内容页配置
	post: {
		// 提醒框（Admonitions）配置，修改后需要重启开发服务器才能生效
		// 主题：'github' | 'obsidian' | 'vitepress' | 'docusaurus'，每个主题风格和语法不同，可根据喜好选择
		rehypeCallouts: {
			theme: "github",
			// 是否启用兼容 Python-Markdown 风格的 admonition 语法（!!!和???语法）
			// 注意：只有 theme 配置成 obsidian 主题才能基本支持这些语法，其他主题会有样式问题或不兼容的情况
			enablePythonMarkdownAdmonitions: false,
		},
		// 文章页底部的"上次编辑时间"卡片开关
		showLastModified: true,
		// 文章过期阈值（天数），超过此天数才显示"上次编辑"卡片
		outdatedThreshold: 90,
		// 是否开启分享海报生成功能
		sharePoster: false,
		// OpenGraph图片功能，注意开启后要渲染很长时间，不建议本地调试的时候开启
		generateOgImages: false,
	},

	// bangumi配置
	bangumi: {
		// Bangumi用户ID
		userId: "",
		// 数据模式：static=构建时获取，dynamic=客户端实时获取
		mode: "dynamic",
		// Bangumi API 地址
		apiUrl: "https://bgmapi.anibt.net",
		// 详情页地址
		subjectBaseUrl: "https://bgmmi.anibt.net/subject/",
		// 条目类型排序
		categoryOrder: ["anime", "book", "music", "game"],
	},

	// 追番配置（Bilibili + TMDB）
	anime: {
		// Bilibili 配置
		bilibili: {
			uid: "",
		},
	},

	// 分页配置
	pagination: {
		// 每页显示的文章数量
		postsPerPage: 10,
	},

	// 图像优化及响应式配置
	imageOptimization: {
		// 输出图片格式
		formats: "webp",
		// 图片压缩质量 (1-100)
		quality: 85,
		// 为特定域名的图片添加 referrerpolicy="no-referrer" 属性
		noReferrerDomains: ["*.hdslb.com", "*.bilibili.com"],
	},

	// 站点语言，在本配置文件顶部SITE_LANG定义
	lang: SITE_LANG,
};
