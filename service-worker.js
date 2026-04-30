const InstallDate = 'owntalk-v2026-04-30-v5'; // 260430_플레시 화면변경|
const CACHE_NAME = 'ai-english-pro-v1';
// 오프라인에서 앱을 띄우기 위해 반드시 저장해야 하는 파일 목록
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://unpkg.com/dexie/dist/dexie.js' // 외부 라이브러리도 캐싱
];

// 1. 서비스 워커 설치 및 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  
});

// 2. 네트워크 요청 가로채기 (오프라인 동작의 핵심)
self.addEventListener('fetch', event => {
  // 구글 앱스 스크립트(TTS) 통신은 네트워크로만 진행하도록 예외 처리
  if (event.request.url.includes("script.google.com")) {
      return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 저장된 파일이 있으면 반환, 없으면 네트워크 시도
        return response || fetch(event.request);
      }).catch(() => {
        // 오프라인 상태라서 네트워크 시도마저 실패했을 때 아무것도 하지 않음 (앱 크래시 방지)
      })
  );
});

// 3. 구버전 캐시 삭제 (앱 업데이트 시)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
