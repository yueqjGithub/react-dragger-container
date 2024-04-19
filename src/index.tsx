import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

type PositionType = {
  /** left-px */
  left?: number;
  /** top-percent */
  top?: number;
  right?: number;
  bottom?: number;
}

export type ChangePositionInfo = {
  position: PositionType,
  parentSize: {
    x: number,
    y: number
  }
}

type Props = PropsWithChildren & {
  position?: PositionType
  onChange: (position: ChangePositionInfo) => void
}

const DraggerContainer: FC<Props> = ({ children, position, onChange }) => {
  const ref = useRef<HTMLDivElement>(null)
  const parentRef = useRef<any>(null)
  const [dragging, setDragging] = useState(false)

  const [selfPosition, setSelfPosition] = useState<PositionType>()

  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
  const touchstart = isMobile ? 'touchstart' : 'mousedown';
  const touchmove = isMobile ? 'touchmove' : 'mousemove';
  const touchend = isMobile ? 'touchend' : 'mouseup';
  const signalRef = useRef<AbortController>()

  useEffect(() => {
    if (ref.current) {
      parentRef.current = ref.current.parentElement as HTMLDivElement

      // setAllWidth(parentRef.current.offsetWidth)
      // setAllHeight(parentRef.current.offsetHeight)

      ref.current.addEventListener(touchstart, (e) => onTouchStart(e as TouchEvent, parentRef.current.offsetWidth, parentRef.current.offsetHeight))
    }
  }, [ref])

  const onTouchStart = (e: TouchEvent, _allWidth: number, _allHeight: number) => {
    setDragging(true)
    const _startPosition = {
      x: Math.floor(ref.current!.offsetLeft) || 0,
      y: Math.floor(ref.current!.offsetTop) || 0
    }
    const _startInfo = {
      x: Math.floor(e.touches[0].clientX),
      y: Math.floor(e.touches[0].clientY)
    }
    const abortController = new AbortController()
    signalRef.current = abortController
    ref.current!.addEventListener(touchmove, (e) => onTouchMove(e as TouchEvent, _startInfo, _startPosition, _allWidth, _allHeight), { signal: abortController.signal })
    ref.current!.addEventListener(touchend, (e) => onTouchEnd(e as TouchEvent, _startInfo, _startPosition, _allWidth, _allHeight), { once: true })
  }

  const onTouchMove = (e: TouchEvent, _startInfo: { x: number, y: number }, _startPosition: { x: number, y: number }, _allWidth: number, _allHeight: number) => {
    const curX = Math.floor(e.touches[0].clientX)
    const curY = Math.floor(e.touches[0].clientY)
    const moveX = curX - _startInfo.x
    const moveY = curY - _startInfo.y

    const nX = _startPosition!.x + moveX
    const nY = (_startPosition!.y + moveY) / _allHeight * 100
    setSelfPosition({
      left: nX,
      top: nY
    })
  }

  const onTouchEnd = (e: TouchEvent, _startInfo: { x: number, y: number }, _startPosition: { x: number, y: number }, _allWidth: number, _allHeight: number) => {
    signalRef.current?.abort()
    setDragging(false)
    const curX = Math.floor(e.changedTouches[0].clientX)
    const curY = Math.floor(e.changedTouches[0].clientY)
    const moveX = curX - _startInfo.x
    const moveY = curY - _startInfo.y

    const nX = _startPosition!.x + moveX
    const nY = (_startPosition!.y + moveY) / _allHeight * 100

    onChange({
      position: {
        left: nX,
        top: nY
      },
      parentSize: {
        x: _allWidth,
        y: _allHeight
      }
    })
  }

  useEffect(() => {
    setSelfPosition(position)
  }, [position])

  return (
    <div
      ref={ref}
      style={{
        '--left': `${selfPosition?.left !== undefined ? `${selfPosition.left}px` : 'unset'}`,
        '--top': `${selfPosition?.top !== undefined ? `${selfPosition.top}%` : 'unset'}`,
        '--right': `${selfPosition?.right !== undefined ? `${selfPosition.right}px` : 'unset'}`,
        '--bottom': `${selfPosition?.bottom !== undefined ? `${selfPosition.bottom}%` : 'unset'}`,
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'position': 'absolute',
        'left': 'var(--left)',
        'top': 'var(--top)',
        'right': 'var(--right)',
        'bottom': 'var(--bottom)',
        'transition': `${dragging ? 'none' : 'all 0.3s ease-in-out'}`,
      } as any}
    >
      {children}
    </div>
  )
}

export default DraggerContainer
