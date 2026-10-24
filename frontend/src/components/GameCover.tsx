import { useEffect, useState } from "react";

export function isValidExternalImageUrl(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

interface GameCoverProps {
  url?: string;
  className: string;
  fallbackClassName: string;
  symbol: string;
  alt: string;
}

export function GameCover({ url, className, fallbackClassName, symbol, alt }: GameCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const validUrl = isValidExternalImageUrl(url);
  const imageUrl = validUrl ? url.trim() : "";

  useEffect(() => {
    setFailedUrl(null);
  }, [imageUrl]);

  return (
    <>
      {validUrl && failedUrl !== imageUrl ? (
        <img className={className} src={imageUrl} alt={alt} onError={() => setFailedUrl(imageUrl)} />
      ) : (
        <span className={fallbackClassName} aria-hidden="true">{symbol}</span>
      )}
    </>
  );
}
