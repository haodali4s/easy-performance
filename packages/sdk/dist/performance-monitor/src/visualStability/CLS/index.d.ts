export declare function startCLS(report: (data: any) => void): void;
/**
 * 为啥要监听两个卸载事件？
visibilitychange 和 pagehide 都是用来监听页面关闭/隐藏的。为啥要搞两个？
因为浏览器脾气不一样：有的喜欢 pagehide（比如 Safari），有的推荐 visibilitychange。
为了保证数据不丢，咱们搞个“双保险”，谁先触发就算谁的。

为啥不用 beforeunload？
早年间确实流行用 beforeunload 或 unload，但现在它们不靠谱了，尤其是在手机上。
用户直接划掉 App、切后台，这些事件经常不会触发。
而且它还会阻止浏览器做“往返缓存”（BFCache），拖慢页面后退速度。所以现在的标准姿势就是 visibilitychange + pagehide。

 */ 
