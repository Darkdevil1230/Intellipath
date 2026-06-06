import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

const loadGsiScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    let script = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
    if (script) {
      if (script.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('GSI script failed')), { once: true });
      return;
    }

    script = document.createElement('script');
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => reject(new Error('GSI script failed'));
    document.body.appendChild(script);
  });

const GoogleSignInButton = ({ clientId, onCredential, disabled = false }) => {
  const containerRef = useRef(null);
  const [renderFailed, setRenderFailed] = useState(false);

  const renderGoogleButton = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.google?.accounts?.id || !clientId) return false;

    const width = Math.floor(container.getBoundingClientRect().width);
    if (width < 200) return false;

    container.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onCredential,
    });
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      width,
    });

    return container.childElementCount > 0;
  }, [clientId, onCredential]);

  useLayoutEffect(() => {
    if (!clientId || disabled) return undefined;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const tryRender = async () => {
      try {
        await loadGsiScript();
      } catch {
        if (!cancelled) setRenderFailed(true);
        return;
      }

      const tick = () => {
        if (cancelled) return;
        attempts += 1;
        const ok = renderGoogleButton();
        if (ok) {
          setRenderFailed(false);
          return;
        }
        if (attempts < maxAttempts) {
          window.setTimeout(tick, 150);
        } else {
          setRenderFailed(true);
        }
      };

      tick();
    };

    tryRender();

    const onResize = () => {
      if (!cancelled) renderGoogleButton();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
  }, [clientId, disabled, renderGoogleButton]);

  const handleFallbackClick = () => {
    if (!window.google?.accounts?.id || !clientId) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onCredential,
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setRenderFailed(false);
        renderGoogleButton();
      }
    });
  };

  if (renderFailed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={handleFallbackClick}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-[44px] w-full items-center justify-center overflow-hidden [&>div]:!w-full [&_iframe]:!w-full"
      aria-label="Sign in with Google"
    />
  );
};

export default GoogleSignInButton;
