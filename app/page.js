"use client"

import { useState, useEffect } from "react"
import { 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  Search, 
  X, 
  Info, 
  Folder,
  Tag
} from "lucide-react"
import data from "../data/osints.json"

export default function Home() {
  const [expandedNodes, setExpandedNodes] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [highlightedPath, setHighlightedPath] = useState([])

  // Initialize with the main OSINT Framework node expanded
  useEffect(() => {
    setExpandedNodes({ "OSINT Framework": true })
  }, [])

  // Handle node expansion/collapse
  const toggleNode = (nodeName) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeName]: !prev[nodeName],
    }))
  }

  // Auto-expand parent nodes when clicking on a search result
  const expandPathToNode = (path) => {
    const newExpandedNodes = { ...expandedNodes }
    path.forEach((nodeName) => {
      newExpandedNodes[nodeName] = true
    })
    setExpandedNodes(newExpandedNodes)
    setHighlightedPath(path)

    // Reset highlight after a delay
    setTimeout(() => {
      setHighlightedPath([])
    }, 2000)
  }

  // Handle search functionality
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

      // Check if the node matches the search term
      if (node.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({ 
          ...node, 
          path: currentPath,
          isExactMatch: node.name.toLowerCase() === term.toLowerCase()
        })
      }

      // Search in children if they exist
      if (node.children) {
        node.children.forEach((child) => searchInNode(child, currentPath))
      }
    }

    searchInNode(data)

    // Sort results: exact matches first, then by path length
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

  // Check if a folder contains any search result
  const folderContainsSearchResult = (node) => {
    if (!isSearching || !searchTerm) return false

    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) 
      return true

    if (node.children) {
      return node.children.some(folderContainsSearchResult)
    }

    return false
  }

  // Render tree node
  const renderNode = (node, level = 0, path = []) => {
    const currentPath = [...path, node.name]
    const isExpanded = expandedNodes[node.name] || false
    const isFolder = node.type === "folder"
    const containsSearchResult = isFolder && folderContainsSearchResult(node)
    const isHighlighted = highlightedPath.includes(node.name)

    // Filter out nodes not in search results when searching
    if (isSearching && searchResults.length > 0) {
      const isInResultPath = searchResults.some((result) =>
        result.path.includes(node.name) || currentPath.some((p) => result.path.includes(p))
      )
      if (!isInResultPath) return null
    }

    // Get indicators for URL nodes
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
            isSearchResult ? "bg-blue-900/40" : 
            isHighlighted ? "bg-amber-900/40" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 10}px` }}
        >
          {isFolder && (
            <button
              onClick={() => toggleNode(node.name)}
              className="text-neutral-500 flex items-center mr-1.5 hover:text-gray-300"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}

          {isFolder && <Folder size={14} className="text-neutral-500 mr-1.5" />}

          {node.type === "url" ? (
            <div className="flex items-center group">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-neutral-400 hover:text-blue-400 text-xs"
              >
                <span>{node.name}</span>
                <ExternalLink size={10} className="ml-1 text-blue-600 opacity-70 group-hover:opacity-100" />
              </a>

              {indicators && indicators.map((indicator, i) => (
                <span 
                  key={i}
                  className="ml-1.5 bg-gray-900 text-neutral-500 text-[10px] px-0.5 rounded"
                >
                  {indicator}
                </span>
              ))}
            </div>
          ) : (
            <span
              className={`${isSearchResult ? "text-blue-400 font-medium" : "text-neutral-300"} cursor-pointer text-xs`}
              onClick={() => toggleNode(node.name)}
            >
              {node.name}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) =>
              renderNode(child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="sticky top-0 z-10 bg-[#111111] border-b border-[#222222] px-3 py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-xl font-medium tracking-tight">OSINT Framework</h1>
            <div className="relative w-full md:max-w-md">
              <Search 
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600" 
                size={16} 
              />
              <input 
                type="text" 
                placeholder="Search tools and resources..." 
                value={searchTerm} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="w-full pl-8 pr-8 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#444444] text-xs" 
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
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
                  <div className="text-xs text-gray-500 mb-1.5">
                    Found {searchResults.length} results
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#1a1a1a] rounded">
                    {searchResults.slice(0, 10).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => expandPathToNode(result.path)}
                        className="flex items-center bg-[#222222] hover:bg-[#333333] text-xs px-2 py-0.5 rounded"
                      >
                        <span className="truncate max-w-xs">{result.name}</span>
                        <ChevronRight size={12} className="ml-1 text-gray-500" />
                      </button>
                    ))}
                    {searchResults.length > 10 && (
                      <span className="text-gray-600 text-xs px-2 py-0.5">
                        +{searchResults.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-600">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-3 py-4">
        <div className="bg-[#1a1a1a] p-3 rounded-md mb-4 flex items-start gap-2">
          <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400 space-y-0.5">
            <p><span className="bg-[#222222] text-[10px] px-1 rounded mr-1">T</span> Tool that must be installed and run locally</p>
            <p><span className="bg-[#222222] text-[10px] px-1 rounded mr-1">D</span> Google Dork</p>
            <p><span className="bg-[#222222] text-[10px] px-1 rounded mr-1">R</span> Requires registration</p>
            <p><span className="bg-[#222222] text-[10px] px-1 rounded mr-1">M</span> URL with search term that must be edited manually</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-md p-3 shadow-md mb-4">
          {renderNode(data)}
        </div>
      </main>

      <footer className="container mx-auto max-w-6xl px-3 py-4 text-center text-gray-600 text-xs">
        <p>OSINT Framework - A curated collection of open source intelligence tools and resources</p>
      </footer>
    </div>
  )
}