import { useCallback, useRef } from 'react'

interface TabItem {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length
      } else if (e.key === 'Home') {
        nextIndex = 0
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1
      }

      if (nextIndex !== null) {
        e.preventDefault()
        tabsRef.current[nextIndex]?.focus()
        onTabChange(tabs[nextIndex].key)
      }
    },
    [tabs, onTabChange]
  )

  return (
    <div
      className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800"
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            ref={(el) => {
              tabsRef.current[index] = el
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-white'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
