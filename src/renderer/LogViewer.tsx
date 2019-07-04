import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect
} from "react";
import { remote } from "electron";
import Typography from "@material-ui/core/Typography";

const LogViewer: React.FC = () => {
  const [store, setStore] = useState<LogLine[]>([]);
  const [scrollToBottom, setScrollToBottom] = useState<boolean>(true);
  const loadStore = useCallback(() => {
    setStore(remote.getGlobal("store"));
  }, []);
  const handleScroll = useCallback(() => {
    setScrollToBottom(
      document.scrollingElement
        ? document.scrollingElement.scrollTop +
            document.scrollingElement.clientHeight ===
            document.scrollingElement.scrollHeight
        : true
    );
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    loadStore();
    setInterval(loadStore, 100);
  }, []);
  useLayoutEffect(() => {
    if (scrollToBottom && document.scrollingElement) {
      document.scrollingElement.scrollTop =
        document.scrollingElement.scrollHeight;
    }
  }, [store]);
  return (
    <div>
      <div>
        {store.map(line => (
          <Typography key={line.id} variant="body2">
            {line.line}
          </Typography>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;
