import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ResourceElement } from "../core/types";
import {
  createResourceFiber,
  unmountResource,
  renderResource,
  commitResource,
} from "../core/ResourceFiber";

const shouldUseIsomorphicLayoutEffect =
  (globalThis as any).__ASSISTANT_UI_USE_ISOMORPHIC_LAYOUT_EFFECT__ === true;

const isSSR =
  typeof window === "undefined" ||
  /ServerSideRendering/.test(window.navigator && window.navigator.userAgent);

const useIsomorphicLayoutEffect =
  shouldUseIsomorphicLayoutEffect && isSSR ? useEffect : useLayoutEffect;

export function useResource<R, P>(element: ResourceElement<R, P>): R {
  const [, rerender] = useState({});
  const fiber = useMemo(
    () => createResourceFiber(element.type, () => rerender({})),
    [element.type]
  );

  const result = renderResource(fiber, element.props);
  useIsomorphicLayoutEffect(() => {
    return () => unmountResource(fiber);
  }, []);
  useIsomorphicLayoutEffect(() => {
    commitResource(fiber, result);
  });

  return result.state;
}
