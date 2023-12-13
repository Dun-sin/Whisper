import { useEffect, useState } from 'react';

export default (documentElement?: Document) => {
  const isBrowser = typeof document !== 'undefined';

  const [documentVisible, setDocumentVisible] = useState(
    isBrowser ? documentElement?.visibilityState : undefined
  );

  const [browserVisible, setBrowserVisible] = useState(
    isBrowser ? documentElement?.hasFocus() : undefined
  );

  useEffect(() => {
    if (!isBrowser) {
      return; // Don't run the rest of the code on the server side
    }
    if (!documentElement) documentElement = document;

    const handleVisibilityChange = () => {
      setDocumentVisible(documentElement?.visibilityState);
    };

    const handleBrowserVisibilityChange = () => {
      setBrowserVisible(documentElement?.hasFocus());
    };

    documentElement?.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('focus', handleBrowserVisibilityChange);
    window.addEventListener('blur', handleBrowserVisibilityChange);

    return () => {
      documentElement?.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener('focus', handleBrowserVisibilityChange);
      window.removeEventListener('blur', handleBrowserVisibilityChange);
    };
  }, [documentElement, isBrowser, browserVisible]);

  return isBrowser && documentVisible === 'visible' && browserVisible;
};
