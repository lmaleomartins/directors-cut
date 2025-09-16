import React, { useRef, useState } from "react";

interface Props {
  url: string;
  title: string;
}

const VideoEmbedWithFallback: React.FC<Props> = ({ url, title }) => {
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Try to detect embed block by listening to load and error
  const handleError = () => {
    setError(true);
  };

  // Some browsers don't fire onError for blocked embeds, so we use a timer to check for blank content
  const handleLoad = () => {
    setTimeout(() => {
      if (iframeRef.current) {
        // If the iframe is blank or blocked, set error
        try {
          const doc = iframeRef.current.contentDocument;
          if (!doc || doc.body.innerHTML.trim() === "") {
            setError(true);
          }
        } catch {
          // Cross-origin, can't access, assume OK
        }
      }
    }, 1500);
  };

  return (
    <div className="relative w-full aspect-video">
      {!error ? (
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4 rounded text-white text-center">
          <div>
            <p>O vídeo não pôde ser reproduzido...</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Assistir diretamente no YouTube</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEmbedWithFallback;
