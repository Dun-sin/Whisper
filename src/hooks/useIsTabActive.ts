import { useEffect, useState } from 'react';

export default (documentElement = document) => {
  const [documentVisible, setDocumentVisible] = useState(
    documentElement.visibilityState
  );
  const [browserVisible, setBrowserVisible] = useState(
    documentElement.hasFocus()
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setDocumentVisible(documentElement.visibilityState);
    };

    const handleBrowserVisibilityChange = () => {
      setBrowserVisible(documentElement.hasFocus());
    };

    documentElement.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('focus', handleBrowserVisibilityChange);
    window.addEventListener('blur', handleBrowserVisibilityChange);

    return () => {
      documentElement.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener('focus', handleBrowserVisibilityChange);
      window.removeEventListener('blur', handleBrowserVisibilityChange);
    };
  }, [documentElement, browserVisible]);

  return documentVisible === 'visible' && browserVisible;
};
