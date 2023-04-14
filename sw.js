// 把响应资源写入缓存
// 只缓存 .js、.css 和图片文件
const putInCache = async (request, response) => {
  // 每次页面资源有更新，只用更新一下open的参数即可
  const cache = await caches.open("yourPageName-version");

  if (
    /\/yourPageName/.test(request.url) ||
    /\.(js|css|png|ico)/.test(request.url)
  ) {
    await cache.put(request, response);
  }
};

// 清除旧缓存
const deleteOldCaches = async () => {
  const keyList = await caches.keys();

  await Promise.all(
    keyList.map(async (key) => {
      await caches.delete(key);
    })
  );
};

const cacheFirst = async ({ request, fallbackUrl }) => {
  // 从缓存中换取资源
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // 如果 preload 也没有命中，则从网络中获取
  try {
    const responseFromNetwork = await fetch(request);

    putInCache(request, responseFromNetwork.clone());

    return responseFromNetwork;
  } catch (error) {
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
    })
  );
});
