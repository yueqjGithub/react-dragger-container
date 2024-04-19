### React可拖拽容器

### 类型前提

```typescript
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
  /** 容器的父元素宽高 */
  parentSize: {
    x: number,
    y: number
  }
}
```

### Props
| 名称 | 类型 | 说明 |
| -------- | ---------------------------------------------------------------- | ----- |
| position | { top?: number, left?: number, bottom?: number, right?: number } | 类似于受控组件的value，定义初始位置，及非拖拽期间控制位置,横轴方向传入像素，纵轴方向传入百分比 |
| onChange | (position: ChangePositionInfo) => void                           | 类似于受控组件的onChange，拖拽结束时触发 |

### Example
```tsx
import DraggerContainer from 'react-dragger-container'
/**
 * 悬浮球
 */
const Dragger: FC = () => {

  const ref = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState<PositionInfo>()

  useEffect(() => {
    const _position = {
        left: 0,
        right: undefined,
        top: 0,
        bottom: undefined
      }
      setPosition(_position)
  }, [])

  const onDragEnd = (data: ChangePositionInfo) => {
    const contentWidth = ref.current!.offsetWidth
    const contentHeight = ref.current!.offsetHeight
    
    const { x: parentX, y: parentY } = data.parentSize
    const { left, top } = data.position

    const topX = parentY * (top! / 100)

    const isTop = topX  <= contentHeight
    const isBtm = topX + contentHeight >= parentY - contentHeight
    if (isTop || isBtm) {
      setPosition({
        top: isTop ? 0 : undefined,
        left: left,
        bottom: isBtm ? 0 : undefined
      })
    } else {
      const isLeft = left! + contentWidth <= parentX / 2
      setPosition({
        top: top,
        left: isLeft ? 0 - (contentWidth / 2) : parentX - (contentWidth / 2)
      })
    }
  }

  return (
    <>
      <DraggerContainer
        position={position}
        onChange={(data) => onDragEnd(data)}
      >
        <div ref={ref} className={`${styles.dragger} flex-row flex-jst-center flex-ali-center ${floating_ball?.icon ? '' : styles.bg}`}
          style={{
            '--size': `${dragSize}px`,
          } as any}
        >
          <img src={dragImg} alt="" />
        </div>
      </DraggerContainer>
    </>
  )
}

export default Dragger
```