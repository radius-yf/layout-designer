import { useResize } from '@/hooks/useResize'
import { isRange, range } from '@/utils/range'
import { ref, toValue, watch, type Ref, type ShallowRef } from 'vue'

interface GridArea {
  gridRowStart: number
  gridColumnStart: number
  gridRowEnd: number
  gridColumnEnd: number
}
export function useGrid(
  grid: Readonly<ShallowRef<HTMLDivElement | null>>,
  deps: Ref<any>[]
) {
  const cellRects = ref<{ rect: DOMRect; row: number; column: number }[]>([])
  const gridResize = useResize(grid)
  const rows = ref<number[]>([])
  const columns = ref<number[]>([])
  watch([gridResize, ...deps], (_, _old, cleanup) => {
    const gridElement = toValue(grid)
    if (!gridElement) {
      cellRects.value = []
      return
    }
    const computedStyle = getComputedStyle(gridElement)
    const c = computedStyle.getPropertyValue('grid-template-columns').trim().split(/\s+/)
    const r = computedStyle.getPropertyValue('grid-template-rows').trim().split(/\s+/)

    const tempCells = r.flatMap((_, rowIndex) => {
      return c.map((_, colIndex) => {
        const cell = document.createElement('div')
        cell.style.gridRowStart = (rowIndex + 1).toString()
        cell.style.gridColumnStart = (colIndex + 1).toString()
        cell.style.pointerEvents = 'none'
        cell.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)'
        cell.style.userSelect = 'none'
        return cell
      })
    })
    const fragment = document.createDocumentFragment()
    tempCells.forEach((cell) => fragment.appendChild(cell))
    gridElement.appendChild(fragment)

    const gridElementRect = gridElement.getBoundingClientRect()
    cellRects.value = tempCells.map((el, index) => {
      const clientRect = el.getBoundingClientRect()
      const rect = new DOMRect(
        clientRect.left - gridElementRect.left,
        clientRect.top - gridElementRect.top,
        clientRect.width,
        clientRect.height
      )
      const row = Math.floor(index / c.length) + 1
      const column = (index % c.length) + 1
      return { rect, row, column }
    })
    rows.value = cellRects.value.filter(c => c.column === 1).map(c => c.rect.top)
    columns.value = cellRects.value.filter(c => c.row === 1).map(c => c.rect.left)
    cleanup(() => {
      tempCells.forEach((cell) => cell.remove())
    })
  })

  function getGridCellSpanFromPoint(point: { top: number; left: number; width: number; height: number }): GridArea {
    if (!gridResize.value) {
      throw new Error('Init not complete, please call after onMounted')
    }

    const top = range(point.top + 1, 0, gridResize.value.height)
    const left = range(point.left + 1, 0, gridResize.value.width)

    const rowStart = cellRects.value.find((c) => isRange(top, c.rect.top, c.rect.top + c.rect.height))!
    const height = range(point.height - 2, 0, gridResize.value.height - rowStart.rect.top - 2)
    const rowEnd = cellRects.value.find((c) =>
      isRange(rowStart.rect.top + height, c.rect.top, c.rect.top + c.rect.height)
    )!

    const columnStart = cellRects.value.find((c) => isRange(left, c.rect.left, c.rect.left + c.rect.width))!
    const width = range(point.width - 2, 0, gridResize.value.width - columnStart.rect.left - 2)
    const columnEnd = cellRects.value.find((c) =>
      isRange(columnStart.rect.left + width, c.rect.left, c.rect.left + c.rect.width)
    )!

    return {
      gridRowStart: rowStart.row,
      gridColumnStart: columnStart.column,
      gridRowEnd: rowEnd.row + 1,
      gridColumnEnd: columnEnd.column + 1,
    }
  }

  function getBoxFromGridArea(area: GridArea) {
    const { gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd } = area

    const matchingRects = cellRects.value.filter(
      (cell) =>
        cell.row >= gridRowStart &&
        cell.row < gridRowEnd &&
        cell.column >= gridColumnStart &&
        cell.column < gridColumnEnd
    )

    if (matchingRects.length === 0) return { top: 0, left: 0, width: 0, height: 0 }

    const top = Math.min(...matchingRects.map((c) => c.rect.top))
    const left = Math.min(...matchingRects.map((c) => c.rect.left))
    const right = Math.max(...matchingRects.map((c) => c.rect.right))
    const bottom = Math.max(...matchingRects.map((c) => c.rect.bottom))

    return {
      top: top,
      left: left,
      width: right - left,
      height: bottom - top,
    }
  }
  return {
    rows,
    columns,
    getGridCellSpanFromPoint,
    getBoxFromGridArea,
    cellRects,
  }
}
