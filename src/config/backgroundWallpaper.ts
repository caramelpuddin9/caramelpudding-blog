import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	// 全屏壁纸模式
	mode: "fullscreen",
	// 关闭切换功能，固定全屏模式
	switchable: false,
	// 关闭背景视频
	playerEnable: false,

	src: {
		// 桌面背景 - 单张图片
		desktop: ["/wallpapers/bg049.png"],
		// 移动背景
		mobile: ["/wallpapers/bg049.png"],
	},

	common: {
		dimOpacity: 0.25,
		playerMode: "random",
		homeText: {
			enable: true,
			switchable: true,
			title: "caramelpudding blog🍮",
			titleSize: "4rem",
			subtitle: ["焦糖布丁の个人空间", "間違えても大丈夫、やり直せばいい。"],
			subtitleSize: "1.3rem",
			typewriter: {
				enable: true,
				speed: 80,
				deleteSpeed: 60,
				pauseTime: 3000,
			},
		},
		navbar: {
			transparentMode: "semi",
			enableBlur: true,
			blur: 5,
		},
		waves: {
			enable: { desktop: true, mobile: true },
			switchable: true,
		},
		gradient: {
			enable: { desktop: true, mobile: true },
			height: "10%",
			switchable: true,
		},
		// 关闭壁纸轮播，只展示单张图片
		carousel: {
			enable: false,
			interval: 8000,
			transitionEffect: "fade",
			switchable: false,
		},
	},

	banner: {
		position: "0% 20%",
	},

	overlay: {
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
		zIndex: -1,
		opacity: 0.8,
		blur: 10,
		cardOpacity: 0.5,
	},

	fullscreen: {
		position: "center",
	},
};
