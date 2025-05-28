<template>
  <div class="relative overflow-hidden">
    <div ref="grid" class="absolute w-full top-0 left-0 grid" :style="style">
      <div
        v-for="(item, index) in items"
        :style="item.grid"
        :class="{ 'opacity-0': activeIndex !== index }"
        class="bg-blue-500/50 box-border border border-blue-500 transition-all"
      ></div>
    </div>
    <DragContainer class="h-full">
      <DragItem
        v-for="(item, index) in items"
        :key="index"
        :pos="item.drag"
        @move="onMove($event, index)"
        @end="onEnd(index)"
      >
        <div class="w-full h-full bg-gray-200"></div>
      </DragItem>
    </DragContainer>
  </div>
</template>
<script setup lang="ts">
import { useResize } from '@/hooks/useResize'
import { computed, ref, toValue, useTemplateRef, watch, type Ref, type ShallowRef } from 'vue'
import { DragContainer, DragItem } from '../drag'
import { isRange, range } from '@/utils/range'
import type { PositionItem } from '../drag/hook'
import { getPoint, type PointerEventLike } from '@/utils/bindClickOrDrag'

interface GridArea {
  gridRowStart: number
  gridColumnStart: number
  gridRowEnd: number
  gridColumnEnd: number
}

const items = ref([
  {
    drag: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    },
    props: {
      minWidth: 100,
      minHeight: 100,
    },
    grid: {
      gridRowStart: 1,
      gridColumnStart: 1,
      gridRowEnd: 2,
      gridColumnEnd: 2,
    },
  },
  {
    drag: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    },
    props: {
      minWidth: 128,
      minHeight: 32,
    },
    grid: {
      gridRowStart: 2,
      gridColumnStart: 2,
      gridRowEnd: 3,
      gridColumnEnd: 4,
    },
  },
])

const cols = ref<(string | number)[]>(['repeat(24, 1fr)'])
const rows = ref<(string | number)[]>(['100px', '200px', 'minmax(24px, auto)'])

const style = computed(() => {
  const gridTemplateRows = Array.isArray(rows.value)
    ? rows.value.map((i) => (typeof i === 'number' ? `${i}px` : i)).join(' ')
    : rows.value
  const gridTemplateColumns = Array.isArray(cols.value)
    ? cols.value.map((i) => (typeof i === 'number' ? `${i}px` : i)).join(' ')
    : cols.value
  return {
    gridTemplateRows,
    gridTemplateColumns,
  }
})
const activeIndex = ref(-1)

function onMove({ ev }: { type: string; pos: PositionItem; ev: PointerEventLike }, index: number) {
  activeIndex.value = index

  const point = getPoint(ev)
  const pos = {
    top: point?.clientY ?? 0,
    left: point?.clientX ?? 0,
    width: items.value[index].props.minWidth ?? 1,
    height: items.value[index].props.minHeight ?? 24,
  }

  items.value[index].grid = getGridCellSpanFromPoint(pos)
}
function onEnd(index: number) {
  activeIndex.value = -1
  const { compressed, deletedEmptyLines } = compressEmptyRows(
    items.value.map((i) => ({ rowStart: i.grid.gridRowStart, rowEnd: i.grid.gridRowEnd }))
  )
  items.value.forEach((i, index) => {
    i.grid.gridRowStart = compressed[index].rowStart
    i.grid.gridRowEnd = compressed[index].rowEnd
    i.drag = getBoxFromGridArea(i.grid)
  })
  deletedEmptyLines.forEach((i) => {
    rows.value.splice(i - 1, 1)
  })

  if (items.value[index].grid.gridRowEnd === rows.value.length + 1) {
    rows.value.push('minmax(24px , auto)')
  }
}

const { getGridCellSpanFromPoint, getBoxFromGridArea } = useShadow(useTemplateRef('grid'), style)

// watch(cellRects, () => {
//   if (activeIndex.value === -1) {
//     console.log('watch')
//     items.value.forEach((item) => {
//       item.drag = getBoxFromGridArea(item.grid)
//     })
//   }
// })

function useShadow(
  grid: Readonly<ShallowRef<HTMLDivElement | null>>,
  style: Ref<{
    gridTemplateRows?: string
    gridTemplateColumns?: string
  }>
) {
  const cellRects = ref<{ rect: DOMRect; row: number; column: number }[]>([])
  const gridResize = useResize(grid)
  watch([gridResize, style], (_, _old, cleanup) => {
    const gridElement = toValue(grid)
    if (!gridElement) {
      cellRects.value = []
      return
    }
    const computedStyle = getComputedStyle(gridElement)
    const columns = computedStyle.getPropertyValue('grid-template-columns').trim().split(/\s+/)
    const rows = computedStyle.getPropertyValue('grid-template-rows').trim().split(/\s+/)

    const tempCells = rows.flatMap((_, rowIndex) => {
      return columns.map((_, colIndex) => {
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
      const row = Math.floor(index / columns.length) + 1
      const column = (index % columns.length) + 1
      return { rect, row, column }
    })
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
    getGridCellSpanFromPoint,
    getBoxFromGridArea,
    cellRects,
  }
}

type RowRange = { rowStart: number; rowEnd: number }

function compressEmptyRows(data: RowRange[]) {
  if (data.length === 0) return { compressed: [], deletedEmptyLines: [] }

  const used = new Set<number>()
  for (const { rowStart, rowEnd } of data) {
    for (let i = rowStart; i < rowEnd; i++) {
      used.add(i)
    }
  }

  const maxRow = Math.max(...data.map((d) => d.rowEnd))
  const offsetMap = new Map<number, number>()
  let removed = 0
  let i = 1
  const deletedEmptyLines: number[] = []

  while (i <= maxRow) {
    if (!used.has(i)) {
      const gapStart = i
      while (i <= maxRow && !used.has(i)) {
        i++
      }
      const gapLength = i - gapStart

      if (gapLength > 1) {
        const retained = gapStart === 1 ? gapStart + 1 : gapStart

        for (let j = gapStart; j < gapStart + gapLength; j++) {
          if (j === retained) continue
          offsetMap.set(j, ++removed)
          deletedEmptyLines.push(j)
        }
      }
    } else {
      offsetMap.set(i, removed)
      i++
    }
  }

  const compressed = data.map(({ rowStart, rowEnd }) => {
    const offsetStart = offsetMap.get(rowStart) ?? 0
    const offsetEnd = offsetMap.get(rowEnd - 1) ?? 0
    return {
      rowStart: rowStart - offsetStart,
      rowEnd: rowEnd - offsetEnd,
    }
  })

  return {
    compressed,
    deletedEmptyLines,
  }
}
</script>
