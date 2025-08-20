'use client'

import { usePostHog as usePostHogReact } from 'posthog-js/react'

export function usePostHog() {
  const posthog = usePostHogReact()

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, properties)
    }
  }

  const reset = () => {
    if (posthog) {
      posthog.reset()
    }
  }

  return {
    trackEvent,
    identify,
    reset,
    posthog,
  }
}