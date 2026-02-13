export declare function startEntries(threshold: number, report: (data: any) => void): void;
/**
entryType === 'resource'：这个频道包罗万象。图片 (img)、样式 (css)、脚本 (script) 甚至你的接口调用 (fetch/xmlhttprequest) 都在这儿。
initiatorType：这个字段告诉你资源是谁发起的。是 <img src="..."> 发起的？还是 fetch() 发起的？一看便知。

 */
