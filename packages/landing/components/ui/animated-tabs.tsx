'use client';

import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useTabs, type Tab } from '@/hooks/use-tabs';
import { cn } from '@/lib/utils';

interface AnimatedTabsProps {
  tabs: Tab[];
  children?: (selectedTab: Tab) => React.ReactNode;
}

const transition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.15
};

const getHoverAnimationProps = (hoveredRect: DOMRect, navRect: DOMRect) => ({
  x: hoveredRect.left - navRect.left - 10,
  y: hoveredRect.top - navRect.top - 4,
  width: hoveredRect.width + 20,
  height: hoveredRect.height + 10
});

const Tabs = ({ tabs, selectedTabIndex, setSelectedTab }: { tabs: Tab[]; selectedTabIndex: number; setSelectedTab: (input: [number, number]) => void }) => {
  const [buttonRefs, setButtonRefs] = React.useState<Array<HTMLButtonElement | null>>([]);

  React.useEffect(() => {
    setButtonRefs((prev) => prev.slice(0, tabs.length));
  }, [tabs.length]);

  const navRef = React.useRef<HTMLDivElement>(null);
  const navRect = navRef.current?.getBoundingClientRect();

  const selectedRect = buttonRefs[selectedTabIndex]?.getBoundingClientRect();

  const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(null);
  const hoveredRect = buttonRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

  return (
    <nav
      ref={navRef}
      className="flex flex-shrink-0 justify-center items-center relative z-0 py-2"
      onPointerLeave={() => setHoveredTabIndex(null)}>
      {tabs.map((item, i) => {
        const isActive = selectedTabIndex === i;

        return (
          <button
            key={item.value}
            className="text-sm relative rounded-md flex items-center h-8 px-4 z-20 bg-transparent cursor-pointer select-none transition-colors"
            onPointerEnter={() => setHoveredTabIndex(i)}
            onFocus={() => setHoveredTabIndex(i)}
            onClick={() => setSelectedTab([i, i > selectedTabIndex ? 1 : -1])}>
            <motion.span
              ref={(el) => {
                buttonRefs[i] = el as HTMLButtonElement;
              }}
              className={cn('block', {
                'text-zinc-500': !isActive,
                'text-black dark:text-white font-semibold': isActive
              })}>
              <small>{item.label}</small>
            </motion.span>
          </button>
        );
      })}

      <AnimatePresence>
        {hoveredRect && navRect && (
          <motion.div
            key="hover"
            className="absolute z-10 top-0 left-0 rounded-md bg-zinc-100 dark:bg-zinc-800"
            initial={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            animate={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 1 }}
            exit={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            transition={transition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRect && navRect && (
          <motion.div
            className="absolute z-10 bottom-0 left-0 h-[2px] bg-black dark:bg-white"
            initial={false}
            animate={{
              width: selectedRect.width + 18,
              x: `calc(${selectedRect.left - navRect.left - 9}px)`,
              opacity: 1
            }}
            transition={transition}
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

export function AnimatedTabs({ tabs, children }: AnimatedTabsProps) {
  const [hookProps] = React.useState(() => {
    const initialTabId = tabs[0]?.value || '';

    return {
      tabs: tabs.map(({ label, value, subRoutes }) => ({
        label,
        value,
        subRoutes
      })),
      initialTabId
    };
  });

  const framer = useTabs(hookProps);

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-between border-b dark:border-zinc-700 overflow-x-auto overflow-y-hidden">
        <Tabs {...framer.tabProps} />
      </div>
      {children && (
        <AnimatePresence mode="wait">
          <motion.div
            key={framer.selectedTab.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={transition}
            className="mt-6"
          >
            {children(framer.selectedTab)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}