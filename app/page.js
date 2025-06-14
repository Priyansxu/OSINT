"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, ExternalLink, Search, X, Info, Folder, FileText, Link } from "lucide-react"
import data from "../data/osint.json"

export default function Home() {
  const [expandedNodes, setExpandedNodes] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [highlightedPath, setHighlightedPath] = useState([])

  useEffect(() => {
    setExpandedNodes({ "OSINT": true })
  }, [])

  const toggleNode = (nodeName) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeName]: !prev[nodeName],
    }))
  }

  const expandPathToNode = (path) => {
    const newExpandedNodes = { ...expandedNodes }
    path.forEach((nodeName) => {
      newExpandedNodes[nodeName] = true
    })
    setExpandedNodes(newExpandedNodes)
    setHighlightedPath(path)

    setTimeout(() => {
      setHighlightedPath([])
    }, 2000)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)

    if (!term.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results = []

    const searchInNode = (node, path = []) => {
      const currentPath = [...path, node.name]

      if (node.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({ 
          ...node, 
          path: currentPath,
          isExactMatch: node.name.toLowerCase() === term.toLowerCase()
        })
      }

      if (node.children) {
        node.children.forEach((child) => searchInNode(child, currentPath))
      }
    }

    searchInNode(data)

    results.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1
      if (!a.isExactMatch && b.isExactMatch) return 1
      return a.path.length - b.path.length
    })

    setSearchResults(results)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setIsSearching(false)
  }

  const folderContainsSearchResult = (node) => {
    if (!isSearching || !searchTerm) return false

    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) 
      return true

    if (node.children) {
      return node.children.some(folderContainsSearchResult)
    }

    return false
  }

  const renderNode = (node, level = 0, path = [], isLastChild = false) => {
    const currentPath = [...path, node.name]
    const isExpanded = expandedNodes[node.name] || false
    const isFolder = node.type === "folder"
    const containsSearchResult = isFolder && folderContainsSearchResult(node)
    const isHighlighted = highlightedPath.includes(node.name)

    if (isSearching && searchResults.length > 0) {
      const isInResultPath = searchResults.some((result) =>
        result.path.includes(node.name) || currentPath.some((p) => result.path.includes(p))
      )
      if (!isInResultPath) return null
    }

    const getIndicator = () => {
      if (node.type !== "url") return null

      const indicators = []
      if (node.isLocalTool) indicators.push("T")
      if (node.isGoogleDork) indicators.push("D")
      if (node.requiresRegistration) indicators.push("R")
      if (node.manualUrl) indicators.push("M")

      return indicators.length ? indicators : null
    }

    const indicators = getIndicator()
    const isSearchResult = isSearching && searchResults.some(r => r.name === node.name)

    return (
      <div 
        key={`${node.name}-${level}`} 
        className="tree-node"
      >
        <div
          className={`flex items-center py-1.5 rounded transition-colors duration-150 ${
            isSearchResult ? "bg-black/20" : 
            isHighlighted ? "bg-black/30" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {level > 0 && (
            <div className="text-neutral-500 font-mono mr-1">
              {isLastChild ? "└── " : "├── "}
            </div>
          )}

          {isFolder && (
            <div className="relative">
              <button
                onClick={() => toggleNode(node.name)}
                className="text-neutral-500 flex items-center mr-1.5 hover:text-white"
                aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
        
              {containsSearchResult && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          )}

          {isFolder && <Folder size={15} className="text-neutral-400 mr-1.5" />}
          {node.type === "url" && <Link size={14} className="text-neutral-400 mr-1.5" />}
          {!isFolder && node.type !== "url" && <FileText size={14} className="text-neutral-400 mr-1.5" />}

          {node.type === "url" ? (
            <div className="flex items-center group">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-neutral-300 hover:text-white text-xs"
              >
                <span>{node.name}</span>
                <ExternalLink size={10} className="ml-1 text-neutral-500 opacity-70 group-hover:opacity-100" />
              </a>

              {indicators && indicators.map((indicator, i) => (
                <span 
                  key={i}
                  className="ml-1.5 bg-black text-neutral-500 text-[10px] px-0.5 rounded"
                >
                  {indicator}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center">
              <span
                className={`${isSearchResult ? "text-white font-medium" : "text-neutral-300"} cursor-pointer text-xs`}
                onClick={() => toggleNode(node.name)}
              >
                {node.name}
              </span>
              
              {isFolder && (
                <span className="ml-1.5 text-neutral-600 text-[10px]">
                  {node.children ? `(${node.children.length})` : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="relative">
            {node.children.map((child, index) =>
              renderNode(
                child, 
                level + 1, 
                currentPath, 
                index === node.children.length - 1
              )
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black border-b border-neutral-800 px-3 py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-xl font-medium tracking-tight">OSINT Tools</h1>
            <div className="relative w-full md:max-w-md">
              <Search 
                className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-600" 
                size={16} 
              />
              <input 
                type="text" 
                placeholder="Search tools and resources..." 
                value={searchTerm} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="w-full pl-8 pr-8 py-1.5 bg-black border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-700 text-xs" 
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {isSearching && (
            <div className="mt-3">
              {searchResults.length > 0 ? (
                <div>
                  <div className="text-xs text-neutral-500 mb-1.5">
                    Found {searchResults.length} results
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-black border border-neutral-800 rounded">
                    {searchResults.slice(0, 10).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => expandPathToNode(result.path)}
                        className="flex items-center bg-black hover:bg-neutral-900 border border-neutral-800 text-xs px-2 py-0.5 rounded"
                      >
                        <span className="truncate max-w-xs">{result.name}</span>
                        <ChevronRight size={12} className="ml-1 text-neutral-500" />
                      </button>
                    ))}
                    {searchResults.length > 10 && (
                      <span className="text-neutral-600 text-xs px-2 py-0.5">
                        +{searchResults.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-neutral-600">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-3 py-4">
        <div className="bg-black border border-neutral-800 p-3 rounded-md mb-4 flex items-start gap-2">
          <Info size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-neutral-400 space-y-0.5">
            <p><span className="bg-black border border-neutral-800 text-[10px] px-1 rounded mr-1">T</span> Tool that must be installed and run locally</p>
            <p><span className="bg-black border border-neutral-800 text-[10px] px-1 rounded mr-1">D</span> Google Dork</p>
            <p><span className="bg-black border border-neutral-800 text-[10px] px-1 rounded mr-1">R</span> Requires registration</p>
            <p><span className="bg-black border border-neutral-800 text-[10px] px-1 rounded mr-1">M</span> URL with search term that must be edited manually</p>
            <p className="mt-1.5 text-neutral-500">A  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full align-middle"></span>  indicates folder contains a search match</p>
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-md p-3 shadow-md mb-4">
          <div className="file-tree font-mono">
            {renderNode(data)}
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-md p-3 shadow-md mb-4">
          <h2 className="text-sm font-medium mb-2">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">↑</kbd>
              <span className="text-neutral-400">Navigate up</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">↓</kbd>
              <span className="text-neutral-400">Navigate down</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">→</kbd>
              <span className="text-neutral-400">Expand folder</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">←</kbd>
              <span className="text-neutral-400">Collapse folder</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">Ctrl</kbd>
              <span className="text-neutral-400">+</span>
              <kbd className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded">F</kbd>
              <span className="text-neutral-400">Search</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto max-w-6xl px-3 py-4 text-center text-neutral-600 text-xs border-t border-neutral-900">
        <p>OSINT Tools - A curated collection of open source intelligence tools and resources</p>
      </footer>
    </div>
  )
}
