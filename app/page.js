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
        className="tree-node transition-colors duration-200"
      >
        <div
          className={`flex items-center py-2 rounded ${
            isSearchResult ? "bg-blue-900/30" : 
            isHighlighted ? "bg-amber-900/30" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {isFolder && (
            <button
              onClick={() => toggleNode(node.name)}
              className="text-neutral-400 flex items-center mr-2 hover:text-white"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          {isFolder && <Folder size={16} className="text-neutral-400 mr-2" />}

          {node.type === "url" ? (
            <div className="flex items-center group">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-neutral-300 hover:text-white"
              >
                <span>{node.name}</span>
                <ExternalLink size={12} className="ml-1 text-blue-500 opacity-70 group-hover:opacity-100" />
              </a>
              
              {indicators && indicators.map((indicator, i) => (
                <span 
                  key={i}
                  className="ml-2 bg-neutral-800 text-neutral-400 text-xs px-1 rounded"
                >
                  {indicator}
                </span>
              ))}
            </div>
          ) : (
            <span
              className={`${isSearchResult ? "text-white font-medium" : "text-neutral-100"} cursor-pointer`}
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
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-2xl font-medium tracking-tight">OSINT Framework</h1>
            <div className="relative w-full md:max-w-md">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" 
                size={18} 
              />
              <input 
                type="text" 
                placeholder="Search tools and resources..." 
                value={searchTerm} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600" 
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          {isSearching && (
            <div className="mt-4">
              {searchResults.length > 0 ? (
                <div>
                  <div className="text-sm text-neutral-400 mb-2">
                    Found {searchResults.length} results
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-neutral-800/50 rounded">
                    {searchResults.slice(0, 10).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => expandPathToNode(result.path)}
                        className="flex items-center bg-neutral-800 hover:bg-neutral-700 text-sm px-2 py-1 rounded"
                      >
                        <span className="truncate max-w-xs">{result.name}</span>
                        <ChevronRight size={14} className="ml-1 text-neutral-500" />
                      </button>
                    ))}
                    {searchResults.length > 10 && (
                      <span className="text-neutral-500 text-sm px-2 py-1">
                        +{searchResults.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-neutral-500">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-neutral-900/50 p-4 rounded-lg mb-6 flex items-start gap-3">
          <Info size={20} className="text-blue-400 mt-1 flex-shrink-0" />
          <div className="text-sm text-neutral-300 space-y-1">
            <p><span className="bg-neutral-800 text-xs px-1 rounded mr-1">T</span> Link to a tool that must be installed and run locally</p>
            <p><span className="bg-neutral-800 text-xs px-1 rounded mr-1">D</span> Google Dork</p>
            <p><span className="bg-neutral-800 text-xs px-1 rounded mr-1">R</span> Requires registration</p>
            <p><span className="bg-neutral-800 text-xs px-1 rounded mr-1">M</span> URL that contains a search term and must be edited manually</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4 md:p-6 overflow-auto shadow-lg max-h-[calc(100vh-280px)]">
          {renderNode(data)}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-4 text-center text-neutral-500 text-sm">
        <p>OSINT Framework - A collection of OSINT tools and resources</p>
      </footer>
    </div>
  )
}