import { type Key } from 'ink'
import { useRef } from 'react'
import { useDoublePress } from './useDoublePress'
import { Cursor } from '../utils/Cursor'

type MaybeCursor = void | Cursor
type InputHandler = (input: string) => MaybeCursor
type InputMapper = (input: string) => MaybeCursor
function mapInput(input_map: Array<[string, InputHandler]>): InputMapper {
  return function (input: string): MaybeCursor {
    const handler = new Map(input_map).get(input) ?? (() => {})
    return handler(input)
  }
}

type UseTextInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  onMessage?: (show: boolean, message?: string) => void
  onHistoryUp?: () => void
  onHistoryDown?: () => void
  focus?: boolean
  mask?: string
  multiline?: boolean
  cursorChar: string
  highlightPastedText?: boolean
  invert: (text: string) => string
  themeText: (text: string) => string
  columns: number
  disableCursorMovementForUpDownKeys?: boolean
  externalOffset: number
  onOffsetChange: (offset: number) => void
  onMouseClick?: (x: number, y: number, meta: boolean) => void
  onPaste?: (text: string) => void
}

type UseTextInputResult = {
  renderedValue: string
  onInput: (input: string, key: Key) => void
  offset: number
  setOffset: (offset: number) => void
}

export function useTextInput({
  value: originalValue,
  onChange,
  onSubmit,
  onMessage,
  onHistoryUp,
  onHistoryDown,
  mask = '',
  multiline = false,
  cursorChar,
  invert,
  columns,
  disableCursorMovementForUpDownKeys = false,
  externalOffset,
  onOffsetChange,
  onPaste,
}: UseTextInputProps): UseTextInputResult {
  const offset = externalOffset
  const setOffset = onOffsetChange
  const cursor = Cursor.fromText(originalValue, columns, offset)
  
  // Paste accumulation state
  const pasteAccumulator = useRef<string>('')
  const pasteTimeout = useRef<NodeJS.Timeout | null>(null)
  
  // Function to handle paste accumulation
  // When pasting large text, terminals may break it into chunks
  // This accumulates all chunks that arrive within 50ms into a single paste
  const handlePasteChunk = (text: string) => {
    // Clear any existing timeout
    if (pasteTimeout.current) {
      clearTimeout(pasteTimeout.current)
    }
    
    // Accumulate the text
    pasteAccumulator.current += text
    
    // Set a new timeout to finalize the paste
    pasteTimeout.current = setTimeout(() => {
      if (pasteAccumulator.current && onPaste) {
        onPaste(pasteAccumulator.current)
      }
      pasteAccumulator.current = ''
      pasteTimeout.current = null
    }, 50) // 50ms debounce - enough time for all chunks to arrive
  }

  // Keep Escape for clearing input
  const handleEscape = useDoublePress(
    show => {
      onMessage?.(!!originalValue && show, `Press Escape again to clear`)
    },
    () => {
      if (originalValue) {
        onChange('')
      }
    },
  )
  function clear() {
    return Cursor.fromText('', columns, 0)
  }

  function handleCtrlD(): MaybeCursor {
    // Delete forward like iPython
    return cursor.del()
  }

  const handleCtrl = mapInput([
    ['a', () => cursor.startOfLine()],
    ['b', () => cursor.left()],
    ['d', handleCtrlD],
    ['e', () => cursor.endOfLine()],
    ['f', () => cursor.right()],
    ['h', () => {
      return cursor.backspace()
    }],
    ['k', () => cursor.deleteToLineEnd()],
    ['l', () => clear()],
    ['n', () => downOrHistoryDown()],
    ['p', () => upOrHistoryUp()],
    ['u', () => cursor.deleteToLineStart()],
    ['w', () => cursor.deleteWordBefore()],
  ])

  const handleMeta = mapInput([
    ['b', () => cursor.prevWord()],
    ['f', () => cursor.nextWord()],
    ['d', () => cursor.deleteWordAfter()],
  ])

  function handleEnter(key: Key): MaybeCursor {
    if (
      multiline &&
      cursor.offset > 0 &&
      cursor.text[cursor.offset - 1] === '\\'
    ) {
      return cursor.backspace().insert('\n')
    }
    if (key.meta) {
      return cursor.insert('\n')
    }
    onSubmit?.(originalValue)
    return cursor
  }

  function upOrHistoryUp() {
    if (disableCursorMovementForUpDownKeys) {
      onHistoryUp?.()
      return cursor
    }
    const cursorUp = cursor.up()
    if (cursorUp.equals(cursor)) {
      // already at beginning
      onHistoryUp?.()
    }
    return cursorUp
  }
  function downOrHistoryDown() {
    if (disableCursorMovementForUpDownKeys) {
      onHistoryDown?.()
      return cursor
    }
    const cursorDown = cursor.down()
    if (cursorDown.equals(cursor)) {
      onHistoryDown?.()
    }
    return cursorDown
  }

  function onInput(input: string, key: Key): void {
    // Direct handling for backspace or delete (which is being detected as delete)
    if (key.backspace || key.delete || input === '\b' || input === '\x7f' || input === '\x08') {
      const nextCursor = cursor.backspace()
      if (!cursor.equals(nextCursor)) {
        setOffset(nextCursor.offset)
        if (cursor.text !== nextCursor.text) {
          onChange(nextCursor.text)
        }
      }
      return
    }
    
    const nextCursor = mapKey(key)(input)
    if (nextCursor) {
      if (!cursor.equals(nextCursor)) {
        setOffset(nextCursor.offset)
        if (cursor.text !== nextCursor.text) {
          onChange(nextCursor.text)
        }
      }
    }
  }

  function mapKey(key: Key): InputMapper {
    // Direct handling for backspace or delete
    if (key.backspace || key.delete) {
      return () => cursor.backspace()
    }
    
    switch (true) {
      case key.escape:
        return handleEscape
      case key.leftArrow && (key.ctrl || key.meta):
        return () => cursor.prevWord()
      case key.rightArrow && (key.ctrl || key.meta):
        return () => cursor.nextWord()
      case key.ctrl:
        return handleCtrl
      case key.pageDown:
        return () => cursor.endOfLine()
      case key.pageUp:
        return () => cursor.startOfLine()
      case key.meta:
        return handleMeta
      case key.return:
        return () => handleEnter(key)
      case key.tab:
        return () => {}
      case key.upArrow:
        return upOrHistoryUp
      case key.downArrow:
        return downOrHistoryDown
      case key.leftArrow:
        return () => cursor.left()
      case key.rightArrow:
        return () => cursor.right()
    }
    return function (input: string): MaybeCursor {
      switch (true) {
        // Home key
        case input == '\x1b[H' || input == '\x1b[1~':
          return cursor.startOfLine()
        // End key
        case input == '\x1b[F' || input == '\x1b[4~':
          return cursor.endOfLine()
        // Handle backspace character explicitly - this is the key fix
        case input === '\b' || input === '\x7f' || input === '\x08':
          return cursor.backspace()
        default:
          // Detect paste: if input has more than one character, it's likely a paste
          if (input.length > 1 && onPaste) {
            const normalizedInput = input.replace(/\r/g, '\n')
            handlePasteChunk(normalizedInput)
            // Don't insert the text yet - wait for the accumulator to finish
            return cursor
          }
          return cursor.insert(input.replace(/\r/g, '\n'))
      }
    }
  }

  return {
    onInput,
    renderedValue: cursor.render(cursorChar, mask, invert),
    offset,
    setOffset,
  }
}