// Minimal typing for X's widgets.js (https://platform.twitter.com/widgets.js)
interface TwitterWidgets {
  createTweet(
    tweetId: string,
    target: HTMLElement,
    options?: {
      align?: "left" | "center" | "right";
      conversation?: "none" | "all";
      dnt?: boolean;
      theme?: "light" | "dark";
      width?: number;
    },
  ): Promise<HTMLElement | undefined>;
}

interface Window {
  twttr?: { widgets?: TwitterWidgets };
}
