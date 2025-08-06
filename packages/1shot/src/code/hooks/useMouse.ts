import { useEffect, useRef } from 'react';
import { useStdin } from 'ink';

export interface MouseEvent {
  x: number;
  y: number;
  button: number;
  action: 'press' | 'release' | 'move';
  shift: boolean;
  meta: boolean;
  ctrl: boolean;
}

type MouseHandler = (event: MouseEvent) => void;

export function useMouse(
  onMouseEvent: MouseHandler,
  options: { isActive?: boolean } = {}
) {
  const { isActive = true } = options;
  const { stdin, setRawMode } = useStdin();
  const savedRawMode = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive || !stdin) return;

    // Save current raw mode state
    savedRawMode.current = stdin.isRaw || false;

    // Enable mouse tracking
    process.stdout.write('\x1b[?1000h'); // Enable mouse tracking
    process.stdout.write('\x1b[?1002h'); // Enable mouse motion tracking
    process.stdout.write('\x1b[?1015h'); // Enable urxvt mouse mode
    process.stdout.write('\x1b[?1006h'); // Enable SGR mouse mode

    const handleData = (data: Buffer) => {
      const str = data.toString();
      
      // SGR mouse format: \x1b[<button>;x;y;M (press) or m (release)
      const sgrMatch = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
      
      if (sgrMatch) {
        const [, buttonCode, x, y, actionChar] = sgrMatch;
        const button = parseInt(buttonCode!, 10);
        const xPos = parseInt(x!, 10) - 1; // Convert to 0-based
        const yPos = parseInt(y!, 10) - 1; // Convert to 0-based
        const action = actionChar === 'M' ? 'press' : 'release';
        
        // Extract modifiers from button code
        const shift = (button & 4) !== 0;
        const meta = (button & 8) !== 0;
        const ctrl = (button & 16) !== 0;
        const actualButton = button & 3;

        onMouseEvent({
          x: xPos,
          y: yPos,
          button: actualButton,
          action,
          shift,
          meta,
          ctrl,
        });
      }
    };

    stdin.on('data', handleData);

    // Cleanup
    return () => {
      stdin.off('data', handleData);
      
      // Disable mouse tracking
      process.stdout.write('\x1b[?1000l');
      process.stdout.write('\x1b[?1002l');
      process.stdout.write('\x1b[?1015l');
      process.stdout.write('\x1b[?1006l');
      
      // Restore raw mode if needed
      if (savedRawMode.current && setRawMode) {
        setRawMode(true);
      }
    };
  }, [isActive, stdin, setRawMode, onMouseEvent]);
}