import React, { useRef, useState, useMemo } from "react";

interface Props {
  url: string;
  title: string;
}

const toEmbedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    // YouTube
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/;
      const m = rawUrl.match(youtubeRegex);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }

    // Vimeo
    if (host.includes("vimeo.com")) {
      const vimeoRegex = /(?:vimeo\.com\/(?:.*\/)?)(\d+)/;
      const m = rawUrl.match(vimeoRegex);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }

    // Dailymotion
    if (host.includes("dailymotion.com") || host.includes("dai.ly")) {
      const dmRegex = /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/;
      const m = rawUrl.match(dmRegex);
      if (m) return `https://www.dailymotion.com/embed/video/${m[1]}`;
    }

    // Twitch (videos)
    if (host.includes("twitch.tv")) {
      const twitchRegex = /(?:twitch\.tv\/videos\/)(\d+)/;
      const m = rawUrl.match(twitchRegex);
      if (m) return `https://player.twitch.tv/?video=${m[1]}&parent=${window.location.hostname}`;
    }

    // Facebook Video
    if (host.includes("facebook.com") || host.includes("fb.watch")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}`;
    }

  } catch {
    // ignore
  }
  return rawUrl;
};

const isTrusted = (embedUrl: string) => {
  try {
    const u = new URL(embedUrl);
    return (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtu.be") ||
      u.hostname.includes("vimeo.com") ||
      u.hostname.includes("player.vimeo.com") ||
      u.hostname.includes("dailymotion.com") ||
      u.hostname.includes("twitch.tv") ||
      u.hostname.includes("facebook.com")
    );
  } catch {
    return false;
  }
};

const VideoEmbedWithFallback: React.FC<Props> = ({ url, title }) => {
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = useMemo(() => toEmbedUrl(url), [url]);
  const trusted = useMemo(() => isTrusted(embedUrl), [embedUrl]);

  const handleError = () => setError(true);

  const handleLoad = () => {
    // Some providers don't allow reading iframe contents (CORS). If the iframe loads without firing onError,
    // assume success. Only fallback if onError fires or we detect obvious blank content on same-origin.
    if (!iframeRef.current) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (doc && doc.body && doc.body.innerHTML.trim() === "") {
        setError(true);
      }
    } catch {
      // Cross-origin — can't inspect, assume OK
    }
  };

  return (
    <div className="relative w-full aspect-video">
      {!error ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          // For known providers avoid sandboxing which can block player JS; keep sandbox for unknown sources
          {...(trusted ? {} : { sandbox: "allow-scripts allow-same-origin allow-presentation" })}
          referrerPolicy="strict-origin-when-cross-origin"
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4 rounded text-white text-center">
          <div>
            <p>O vídeo não pôde ser reproduzido...</p>
            <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="underline">Assistir diretamente na plataforma</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEmbedWithFallback;
